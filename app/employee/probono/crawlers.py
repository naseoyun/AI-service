from __future__ import annotations

import hashlib
import re
from datetime import datetime
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from .models import OpportunityStatus, VolunteerOpportunity, VolunteerPortal
from .skill_extractor import extract_required_skills

KW_VOLUNTEER = "\ubd09\uc0ac"
KW_RECRUIT = "\ubaa8\uc9d1"
KW_MENTOR = "\uba58\ud1a0"
KW_SUPPORT = "\uc9c0\uc6d0"
KW_PROGRAM = "\ud504\ub85c\uadf8\ub7a8"
KW_ASSIST = "\ubcf4\uc870"
KW_ACCEPTED_HOURS = "\uc778\uc815\uc2dc\uac04"

KOREAN_LOCATIONS = {
    "\uc11c\uc6b8": "Seoul",
    "\uacbd\uae30": "Gyeonggi",
    "\uc778\ucc9c": "Incheon",
    "\ubd80\uc0b0": "Busan",
    "\ub300\uad6c": "Daegu",
    "\uad11\uc8fc": "Gwangju",
    "\ub300\uc804": "Daejeon",
    "\uc6b8\uc0b0": "Ulsan",
    "\uc138\uc885": "Sejong",
    "\uac15\uc6d0": "Gangwon",
    "\ucda9\ubd81": "Chungbuk",
    "\ucda9\ub0a8": "Chungnam",
    "\uc804\ubd81": "Jeonbuk",
    "\uc804\ub0a8": "Jeonnam",
    "\uacbd\ubd81": "Gyeongbuk",
    "\uacbd\ub0a8": "Gyeongnam",
    "\uc81c\uc8fc": "Jeju",
}

AREA_KEYWORDS = {
    "\uc0dd\ud65c\ud3b8\uc758": "Daily support",
    "\uc0c1\ub2f4": "Counseling",
    "\uba58\ud1a0\ub9c1": "Mentoring",
    "\uad50\uc721": "Education",
    "\ud658\uacbd": "Environment",
    "\ubb38\ud654": "Culture",
    "\ud589\uc815": "Administration",
    "\ubcf4\uac74": "Healthcare",
    "\ubcf5\uc9c0": "Welfare",
    "\ub3cc\ubd04": "Care",
    "IT": "IT",
}


class CrawlResult:
    def __init__(self, items: list[VolunteerOpportunity], warnings: list[str] | None = None) -> None:
        self.items = items
        self.warnings = warnings or []


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
        return re.sub(r"\s+", " ", value).strip()

    def _extract_hours(self, text: str) -> float | None:
        patterns = [
            r"\ucd5c\ub300\s*(\d+(?:\.\d+)?)\s*\uc2dc\uac04",
            r"(\d+(?:\.\d+)?)\s*\uc2dc\uac04\s*\uc778\uc815",
            rf"{KW_ACCEPTED_HOURS}\s*[:\s]?\s*(\d+(?:\.\d+)?)",
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