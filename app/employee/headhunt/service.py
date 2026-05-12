from .models import (
    HeadhuntOffer,
    InterviewStage,
    OfferStatus,
    OfferSummary,
    PipelineColumn,
    PipelineResponse,
)
from .stage_flow import STAGE_LABELS, STAGE_ORDER, progress_percent


def to_offer_summary(offer: HeadhuntOffer) -> OfferSummary:
    return OfferSummary(
        id=offer.id,
        company_name=offer.company_name,
        position_title=offer.position_title,
        location=offer.location,
        salary_range=_salary_range(offer.salary_min, offer.salary_max),
        required_skills=offer.required_skills,
        received_at=offer.received_at,
        response_due_date=offer.response_due_date,
        priority=offer.priority,
        status=offer.status,
        current_stage=offer.current_stage,
        progress_percent=progress_percent(offer.current_stage),
    )


def build_pipeline(offers: list[HeadhuntOffer]) -> PipelineResponse:
    summaries = [to_offer_summary(offer) for offer in offers]
    columns = []

    for order, stage in enumerate(STAGE_ORDER):
        stage_offers = [summary for summary in summaries if summary.current_stage == stage]
        columns.append(
            PipelineColumn(
                stage=stage,
                label=STAGE_LABELS[stage],
                order=order,
                count=len(stage_offers),
                offers=stage_offers,
            )
        )

    return PipelineResponse(
        total_count=len(offers),
        active_count=sum(1 for offer in offers if offer.status not in {OfferStatus.CLOSED, OfferStatus.DECLINED}),
        accepted_count=sum(1 for offer in offers if offer.status == OfferStatus.ACCEPTED),
        columns=columns,
        offers=summaries,
    )


def _salary_range(salary_min: int | None, salary_max: int | None) -> str | None:
    if salary_min is None and salary_max is None:
        return None
    if salary_min is not None and salary_max is not None:
        return f"KRW {salary_min:,} - {salary_max:,}"
    if salary_min is not None:
        return f"KRW {salary_min:,}+"
    return f"Up to KRW {salary_max:,}"