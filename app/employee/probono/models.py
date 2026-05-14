from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, Field, HttpUrl


class VolunteerPortal(StrEnum):
    PORTAL_1365 = "1365"
    VMS = "vms"
    SAMPLE = "sample"


class OpportunityStatus(StrEnum):
    OPEN = "open"
    CLOSED = "closed"
    UNKNOWN = "unknown"


class OpportunityQuery(BaseModel):
    location: str | None = None
    skill: str | None = None
    portal: VolunteerPortal | None = None
    limit: int = Field(default=20, ge=1, le=100)
    include_live: bool = True


class VolunteerOpportunity(BaseModel):
    id: str
    portal: VolunteerPortal
    title: str
    organization: str | None = None
    location: str
    activity_area: str | None = None
    target_group: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    recognized_hours: float | None = Field(default=None, ge=0)
    recruitment_start_date: date | None = None
    recruitment_end_date: date | None = None
    activity_start_date: date | None = None
    activity_end_date: date | None = None
    volunteer_count: int | None = Field(default=None, ge=0)
    status: OpportunityStatus = OpportunityStatus.UNKNOWN
    apply_url: HttpUrl | str | None = None
    source_updated_at: datetime | None = None
    summary: str | None = None


class OpportunityListResponse(BaseModel):
    total_count: int
    live_fetch_attempted: bool
    live_fetch_succeeded: bool
    fallback_used: bool
    sources: list[VolunteerPortal]
    items: list[VolunteerOpportunity]
    warnings: list[str] = Field(default_factory=list)


class RefreshResponse(BaseModel):
    refreshed_at: datetime
    live_fetch_succeeded: bool
    fetched_count: int
    fallback_used: bool
    warnings: list[str] = Field(default_factory=list)