from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class OfferStatus(StrEnum):
    RECEIVED = "received"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    CLOSED = "closed"


class InterviewStage(StrEnum):
    OFFER_RECEIVED = "offer_received"
    ACCEPTED = "accepted"
    HR_SCREENING = "hr_screening"
    FIRST_INTERVIEW = "first_interview"
    TECH_INTERVIEW = "tech_interview"
    FINAL_INTERVIEW = "final_interview"
    NEGOTIATION = "negotiation"
    RESULT = "result"


class StageState(StrEnum):
    LOCKED = "locked"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    SKIPPED = "skipped"


class HeadhuntOfferCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=80)
    position_title: str = Field(min_length=1, max_length=80)
    recruiter_name: str | None = Field(default=None, max_length=50)
    recruiter_contact: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=80)
    employment_type: str | None = Field(default=None, max_length=40)
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    required_skills: list[str] = Field(default_factory=list)
    message: str | None = Field(default=None, max_length=2000)
    received_at: date = Field(default_factory=date.today)
    response_due_date: date | None = None
    priority: int = Field(default=3, ge=1, le=5)


class HeadhuntOfferUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=80)
    position_title: str | None = Field(default=None, min_length=1, max_length=80)
    recruiter_name: str | None = Field(default=None, max_length=50)
    recruiter_contact: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=80)
    employment_type: str | None = Field(default=None, max_length=40)
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    required_skills: list[str] | None = None
    message: str | None = Field(default=None, max_length=2000)
    response_due_date: date | None = None
    priority: int | None = Field(default=None, ge=1, le=5)
    status: OfferStatus | None = None


class StageUpdateRequest(BaseModel):
    stage: InterviewStage
    scheduled_at: datetime | None = None
    note: str | None = Field(default=None, max_length=1000)


class StageEvent(BaseModel):
    stage: InterviewStage
    state: StageState
    label: str
    order: int
    scheduled_at: datetime | None = None
    completed_at: datetime | None = None
    note: str | None = None


class HeadhuntOffer(BaseModel):
    id: str
    company_name: str
    position_title: str
    recruiter_name: str | None = None
    recruiter_contact: str | None = None
    location: str | None = None
    employment_type: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    required_skills: list[str] = Field(default_factory=list)
    message: str | None = None
    received_at: date
    response_due_date: date | None = None
    priority: int = Field(ge=1, le=5)
    status: OfferStatus
    current_stage: InterviewStage
    stages: list[StageEvent] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime