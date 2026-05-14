from __future__ import annotations

import hashlib
import re
from datetime import datetime
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from .models import OpportunityStatus, VolunteerOpportunity, VolunteerPortal
from .skill_extractor import extract_required_skills


# =========================
# KEYWORDS
# =========================

KW_VOLUNTEER = "봉사"
KW_RECRUIT = "모집"
KW_MENTOR = "멘토"
KW_SUPPORT = "지원"
KW_PROGRAM = "프로그램"
KW_ASSIST = "보조"
KW_ACCEPTED_HOURS = "인정시간"


# =========================
# LOCATION MAPPING
# =========================

KOREAN_LOCATIONS = {
    "서울": "Seoul",
    "경기": "Gyeonggi",
    "인천": "Incheon",
    "부산": "Busan",
    "대구": "Daegu",
    "광주": "Gwangju",
    "대전": "Daejeon",
    "울산": "Ulsan",
    "세종": "Sejong",
    "강원": "Gangwon",
    "충북": "Chungbuk",
    "충남": "Chungnam",
    "전북": "Jeonbuk",
    "전남": "Jeonnam",
    "경북": "Gyeongbuk",
    "경남": "Gyeongnam",
    "제주": "Jeju",
}


# =========================
# AREA KEYWORDS
# =========================

AREA_KEYWORDS = {
    "생활편의": "Daily support",
    "상담": "Counseling",
    "멘토링": "Mentoring",
    "교육": "Education",
    "환경": "Environment",
    "문화": "Culture",
    "행정": "Administration",
    "보건": "Healthcare",
    "복지": "Welfare",
    "돌봄": "Care",
    "IT": "IT",
}


# =========================
# RESULT
# =========================

class CrawlResult:
    def __init__(self, items: list[VolunteerOpportunity], warnings: list[str] | None = None):
        self.items = items
        self.warnings = warnings or []


# =========================
# BASE CRAWLER
# =========================

class BaseCrawler:
    portal: VolunteerPortal
    base_url: str

    async def fetch(self, limit: int = 20) -> CrawlResult:
        raise NotImplementedError

    def _stable_id(self, value: str) -> str:
        digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]
        return f"{self.portal.value}-{digest}"

    def _clean(self, value: str | None) -> str:
        if not value:
            return ""

        value = re.sub(r"\s+", " ", value)
        return value.strip()

    def _extract_hours(self, text: str) -> float | None:
        patterns = [
            r"최대\s*(\d+(?:\.\d+)?)\s*시간",
            r"(\d+(?:\.\d+)?)\s*시간\s*인정",
            r"인정시간\s*[:\s]?\s*(\d+(?:\.\d+)?)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return float(match.group(1))

        return None

    def _extract_location(self, text: str) -> str:
        for korean, english in KOREAN_LOCATIONS.items():
            if korean in text:
                return english

        return "Unknown"

    def _extract_area(self, text: str) -> str | None:
        for keyword, label in AREA_KEYWORDS.items():
            if keyword in text:
                return label

        return None

    def _extract_organization(self, text: str) -> str | None:
        match = re.search(r"\[([^\]]+)\]", text)
        if match:
            return match.group(1)

        return None

    async def _request(self, url: str) -> str:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
            },
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.text


# =========================
# 1365 CRAWLER
# =========================

class Portal1365Crawler(BaseCrawler):
    portal = VolunteerPortal.PORTAL_1365

    base_url = "https://www.1365.go.kr"

    list_url = "https://www.1365.go.kr/?menuId=MNU_0000000000000482"

    async def fetch(self, limit: int = 20) -> CrawlResult:
        warnings = []

        try:
            html = await self._request(self.list_url)
        except Exception as exc:
            return CrawlResult([], [f"1365 fetch failed: {exc}"])

        soup = BeautifulSoup(html, "html.parser")

        items: list[VolunteerOpportunity] = []
        visited = set()

        selectors = [
            "table tbody tr",
            ".board_list tbody tr",
            ".list_area li",
        ]

        rows = []

        for selector in selectors:
            rows = soup.select(selector)
            if rows:
                break

        if not rows:
            return CrawlResult([], ["1365 모집공고 영역을 찾지 못했습니다."])

        for row in rows:
            try:
                link = row.select_one("a")

                if not link:
                    continue

                title = self._clean(link.get_text(" "))

                if len(title) < 5:
                    continue

                href = link.get("href")
                full_url = urljoin(self.base_url, href)

                if full_url in visited:
                    continue

                visited.add(full_url)

                row_text = self._clean(row.get_text(" "))

                item = VolunteerOpportunity(
                    id=self._stable_id(full_url),
                    portal=self.portal,
                    title=title[:160],
                    organization=self._extract_organization(row_text),
                    location=self._extract_location(row_text),
                    activity_area=self._extract_area(row_text),
                    required_skills=extract_required_skills(row_text),
                    recognized_hours=self._extract_hours(row_text),
                    status=OpportunityStatus.OPEN,
                    apply_url=full_url,
                    source_updated_at=datetime.now(),
                    summary=row_text[:240],
                )

                items.append(item)

                if len(items) >= limit:
                    break

            except Exception as exc:
                warnings.append(f"1365 parsing error: {exc}")

        return CrawlResult(items, warnings)


# =========================
# VMS CRAWLER
# =========================

class VmsCrawler(BaseCrawler):
    portal = VolunteerPortal.VMS

    base_url = "https://www.vms.or.kr"

    list_url = "https://www.vms.or.kr/partspace/recruit.do"

    async def fetch(self, limit: int = 20) -> CrawlResult:
        warnings = []

        try:
            html = await self._request(self.list_url)
        except Exception as exc:
            return CrawlResult([], [f"VMS fetch failed: {exc}"])

        soup = BeautifulSoup(html, "html.parser")

        items: list[VolunteerOpportunity] = []
        visited = set()

        selectors = [
            "table tbody tr",
            ".board_list tbody tr",
            ".list_type li",
        ]

        rows = []

        for selector in selectors:
            rows = soup.select(selector)
            if rows:
                break

        if not rows:
            return CrawlResult([], ["VMS 모집공고 영역을 찾지 못했습니다."])

        for row in rows:
            try:
                link = row.select_one("a")

                if not link:
                    continue

                title = self._clean(link.get_text(" "))

                if len(title) < 5:
                    continue

                href = link.get("href")
                full_url = urljoin(self.base_url, href)

                if full_url in visited:
                    continue

                visited.add(full_url)

                row_text = self._clean(row.get_text(" "))

                item = VolunteerOpportunity(
                    id=self._stable_id(full_url),
                    portal=self.portal,
                    title=title[:160],
                    organization=self._extract_organization(row_text),
                    location=self._extract_location(row_text),
                    activity_area=self._extract_area(row_text),
                    required_skills=extract_required_skills(row_text),
                    recognized_hours=self._extract_hours(row_text),
                    status=OpportunityStatus.OPEN,
                    apply_url=full_url,
                    source_updated_at=datetime.now(),
                    summary=row_text[:240],
                )

                items.append(item)

                if len(items) >= limit:
                    break

            except Exception as exc:
                warnings.append(f"VMS parsing error: {exc}")

        return CrawlResult(items, warnings)


# =========================
# TEST
# =========================

async def test_crawlers():
    crawler_1365 = Portal1365Crawler()
    result_1365 = await crawler_1365.fetch(limit=5)

    print("\n===== 1365 =====")

    for item in result_1365.items:
        print(item.title)
        print(item.apply_url)
        print(item.location)
        print("-")

    if result_1365.warnings:
        print(result_1365.warnings)

    crawler_vms = VmsCrawler()
    result_vms = await crawler_vms.fetch(limit=5)

    print("\n===== VMS =====")

    for item in result_vms.items:
        print(item.title)
        print(item.apply_url)
        print(item.location)
        print("-")

    if result_vms.warnings:
        print(result_vms.warnings)