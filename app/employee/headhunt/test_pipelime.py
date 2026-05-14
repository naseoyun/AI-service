from .models import HeadhuntOfferCreate, InterviewStage, StageUpdateRequest
from .repository import OfferRepository
from .service import build_pipeline, to_offer_summary


def test_accept_offer_starts_interview_flow() -> None:
    repository = OfferRepository()
    offer = repository.create(
        HeadhuntOfferCreate(
            company_name="Test Company",
            position_title="Backend Engineer",
            required_skills=["Python"],
        )
    )

    accepted = repository.accept(offer.id)

    assert accepted is not None
    assert accepted.current_stage == InterviewStage.ACCEPTED
    assert to_offer_summary(accepted).progress_percent > 0


def test_pipeline_groups_offers_by_current_stage() -> None:
    repository = OfferRepository()
    offer = repository.create(
        HeadhuntOfferCreate(
            company_name="Visual Corp",
            position_title="Product Engineer",
        )
    )
    repository.update_stage(
        offer.id,
        StageUpdateRequest(stage=InterviewStage.FIRST_INTERVIEW, note="1차 면접 일정 조율 중"),
    )

    pipeline = build_pipeline(repository.list())
    first_interview_column = next(
        column for column in pipeline.columns if column.stage == InterviewStage.FIRST_INTERVIEW
    )

    assert first_interview_column.count >= 1
    assert any(item.company_name == "Visual Corp" for item in first_interview_column.offers)