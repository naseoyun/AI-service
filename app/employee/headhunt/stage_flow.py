from datetime import datetime

from .models import InterviewStage, StageEvent, StageState


STAGE_LABELS = {
    InterviewStage.OFFER_RECEIVED: "Offer received",
    InterviewStage.ACCEPTED: "Accepted",
    InterviewStage.HR_SCREENING: "HR screening",
    InterviewStage.FIRST_INTERVIEW: "First interview",
    InterviewStage.TECH_INTERVIEW: "Technical interview",
    InterviewStage.FINAL_INTERVIEW: "Final interview",
    InterviewStage.NEGOTIATION: "Compensation negotiation",
    InterviewStage.RESULT: "Final result",
}

STAGE_ORDER = list(InterviewStage)


def create_initial_stages() -> list[StageEvent]:
    return [
        StageEvent(
            stage=stage,
            state=StageState.DONE if stage == InterviewStage.OFFER_RECEIVED else StageState.LOCKED,
            label=STAGE_LABELS[stage],
            order=index,
            completed_at=datetime.now() if stage == InterviewStage.OFFER_RECEIVED else None,
        )
        for index, stage in enumerate(STAGE_ORDER)
    ]


def apply_stage_progress(
    stages: list[StageEvent],
    target_stage: InterviewStage,
    scheduled_at: datetime | None = None,
    note: str | None = None,
) -> list[StageEvent]:
    target_index = STAGE_ORDER.index(target_stage)
    now = datetime.now()
    updated: list[StageEvent] = []

    for event in stages:
        event_index = STAGE_ORDER.index(event.stage)
        copied = event.model_copy(deep=True)

        if event_index < target_index:
            copied.state = StageState.DONE
            copied.completed_at = copied.completed_at or now
        elif event_index == target_index:
            copied.state = StageState.IN_PROGRESS if target_stage != InterviewStage.RESULT else StageState.DONE
            copied.scheduled_at = scheduled_at
            copied.note = note
            if target_stage == InterviewStage.RESULT:
                copied.completed_at = now
        elif event_index == target_index + 1:
            copied.state = StageState.TODO
        else:
            copied.state = StageState.LOCKED

        updated.append(copied)

    return updated


def progress_percent(current_stage: InterviewStage) -> int:
    if current_stage == InterviewStage.RESULT:
        return 100
    return round((STAGE_ORDER.index(current_stage) / (len(STAGE_ORDER) - 1)) * 100)