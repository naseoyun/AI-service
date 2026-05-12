from datetime import datetime

from .crawlers import Portal1365Crawler, VmsCrawler
from .models import (
    OpportunityListResponse,
    OpportunityQuery,
    RefreshResponse,
    VolunteerOpportunity,
    VolunteerPortal,
)
from .sample_data import sample_opportunities
from .skill_extractor import SKILL_KEYWORDS


class OpportunityService:
    def __init__(self) -> None:
        self._cache: list[VolunteerOpportunity] = []
        self._warnings: list[str] = []
        self._last_live_success = False

    async def list_opportunities(self, query: OpportunityQuery) -> OpportunityListResponse:
        live_fetch_attempted = False
        live_items: list[VolunteerOpportunity] = []
        warnings: list[str] = []

        if query.include_live:
            live_fetch_attempted = True
            live_items, warnings = await self._fetch_live(query.limit)
            if live_items:
                self._cache = live_items
                self._warnings = warnings
                self._last_live_success = True

        items = self._cache or live_items
        fallback_used = False
        if len(items) < query.limit:
            fallback_used = True
            items = self._merge_unique(items, sample_opportunities())

        filtered = self._filter(items, query)[: query.limit]
        return OpportunityListResponse(
            total_count=len(filtered),
            live_fetch_attempted=live_fetch_attempted,
            live_fetch_succeeded=bool(live_items),
            fallback_used=fallback_used,
            sources=sorted({item.portal for item in filtered}, key=lambda value: value.value),
            items=filtered,
            warnings=warnings or self._warnings,
        )

    async def refresh(self, limit: int = 50) -> RefreshResponse:
        items, warnings = await self._fetch_live(limit)
        fallback_used = not bool(items)

        self._cache = items if items else sample_opportunities()
        self._warnings = warnings
        self._last_live_success = bool(items)

        return RefreshResponse(
            refreshed_at=datetime.now(),
            live_fetch_succeeded=bool(items),
            fetched_count=len(items),
            fallback_used=fallback_used,
            warnings=warnings,
        )

    def skills(self) -> list[str]:
        return sorted(SKILL_KEYWORDS.keys())

    async def _fetch_live(self, limit: int) -> tuple[list[VolunteerOpportunity], list[str]]:
        crawlers = [Portal1365Crawler(), VmsCrawler()]
        items: list[VolunteerOpportunity] = []
        warnings: list[str] = []

        for crawler in crawlers:
            result = await crawler.fetch(limit=limit)
            items.extend(result.items)
            warnings.extend(result.warnings)

        return self._merge_unique([], items), warnings

    def _filter(self, items: list[VolunteerOpportunity], query: OpportunityQuery) -> list[VolunteerOpportunity]:
        filtered = items
        if query.portal:
            filtered = [item for item in filtered if item.portal == query.portal]
        if query.location:
            location = query.location.lower()
            filtered = [item for item in filtered if location in item.location.lower()]
        if query.skill:
            skill = query.skill.lower()
            filtered = [
                item
                for item in filtered
                if skill in " ".join(item.required_skills).lower()
                or skill in item.title.lower()
                or skill in (item.summary or "").lower()
            ]
        return filtered

    def _merge_unique(
        self,
        primary: list[VolunteerOpportunity],
        secondary: list[VolunteerOpportunity],
    ) -> list[VolunteerOpportunity]:
        seen = {item.id for item in primary}
        merged = list(primary)
        for item in secondary:
            if item.id not in seen:
                merged.append(item)
                seen.add(item.id)
        return merged