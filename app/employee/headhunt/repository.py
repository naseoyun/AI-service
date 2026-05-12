from datetime import datetime
from uuid import uuid4

from app.models import (
    HeadhuntOffer,
    HeadhuntOfferCreate,
    HeadhuntOfferUpdate,
    InterviewStage,
    OfferStatus,
    StageUpdateRequest,
)
from app.stage_flow import apply_stage_progress, create_initial_stages


class OfferRepository:
    def __init__(self) -> None:
        self._offers: dict[str, HeadhuntOffer] = {}
        self._seed()

    def list(self) -> list[HeadhuntOffer]:
        return sorted(
            self._offers.values(),
            key=lambda offer: (offer.priority, offer.response_due_date or offer.received_at),
        )

    def get(self, offer_id: str) -> HeadhuntOffer | None:
        return self._offers.get(offer_id)

    def create(self, payload: HeadhuntOfferCreate) -> HeadhuntOffer:
        now = datetime.now()
        offer = HeadhuntOffer(
            id=str(uuid4()),
            **payload.model_dump(),
            status=OfferStatus.RECEIVED,
            current_stage=InterviewStage.OFFER_RECEIVED,
            stages=create_initial_stages(),
            created_at=now,
            updated_at=now,
        )
        self._offers[offer.id] = offer
        return offer

    def update(self, offer_id: str, payload: HeadhuntOfferUpdate) -> HeadhuntOffer | None:
        offer = self.get(offer_id)
        if offer is None:
            return None

        data = payload.model_dump(exclude_unset=True)
        updated = offer.model_copy(update={**data, "updated_at": datetime.now()})
        self._offers[offer_id] = updated
        return updated

    def accept(self, offer_id: str) -> HeadhuntOffer | None:
        offer = self.get(offer_id)
        if offer is None:
            return None

        updated = offer.model_copy(
            update={
                "status": OfferStatus.ACCEPTED,
                "current_stage": InterviewStage.ACCEPTED,
                "stages": apply_stage_progress(offer.stages, InterviewStage.ACCEPTED),
                "updated_at": datetime.now(),
            },
            deep=True,
        )
        self._offers[offer_id] = updated
        return updated

    def update_stage(self, offer_id: str, payload: StageUpdateRequest) -> HeadhuntOffer | None:
        offer = self.get(offer_id)
        if offer is None:
            return None

        status = OfferStatus.ACCEPTED if offer.status == OfferStatus.RECEIVED else offer.status
        updated = offer.model_copy(
            update={
                "status": status,
                "current_stage": payload.stage,
                "stages": apply_stage_progress(
                    offer.stages,
                    payload.stage,
                    scheduled_at=payload.scheduled_at,
                    note=payload.note,
                ),
                "updated_at": datetime.now(),
            },
            deep=True,
        )
        self._offers[offer_id] = updated
        return updated

    def close(self, offer_id: str) -> HeadhuntOffer | None:
        offer = self.get(offer_id)
        if offer is None:
            return None

        updated = offer.model_copy(
            update={
                "status": OfferStatus.CLOSED,
                "updated_at": datetime.now(),
            }
        )
        self._offers[offer_id] = updated
        return updated

    def _seed(self) -> None:
        samples = [
            HeadhuntOfferCreate(
                company_name="Nexora Labs",
                position_title="Backend Engineer",
                recruiter_name="Harin Kim",
                location="Seoul Gangnam",
                employment_type="Full-time",
                salary_min=6500,
                salary_max=8200,
                required_skills=["Python", "FastAPI", "PostgreSQL"],
                message="Backend role for a B2B SaaS platform.",
                priority=1,
            ),
            HeadhuntOfferCreate(
                company_name="Bluefin AI",
                position_title="AI Product Engineer",
                recruiter_name="Junseo Lee",
                location="Pangyo",
                employment_type="Full-time",
                salary_min=7000,
                salary_max=9500,
                required_skills=["LLM", "TypeScript", "MLOps"],
                message="Role connecting AI capabilities to user-facing product features.",
                priority=2,
            ),
            HeadhuntOfferCreate(
                company_name="Orbit Commerce",
                position_title="Platform Developer",
                recruiter_name="Soyun Park",
                location="Remote",
                employment_type="Contract",
                salary_min=5500,
                salary_max=7000,
                required_skills=["Java", "Spring", "AWS"],
                message="Offer to join a commerce platform migration project.",
                priority=4,
            ),
        ]
        for sample in samples:
            self.create(sample)