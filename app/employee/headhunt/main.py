from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    HeadhuntOffer,
    HeadhuntOfferCreate,
    HeadhuntOfferUpdate,
    OfferSummary,
    PipelineResponse,
    StageUpdateRequest,
)
from app.repository import OfferRepository
from app.service import build_pipeline, to_offer_summary

app = FastAPI(
    title="Smart Headhunt Backend",
    description="APIs for received job offers and interview-stage visualization.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repository = OfferRepository()
NOT_FOUND_MESSAGE = "headhunt offer not found"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/headhunt/offers", response_model=list[OfferSummary])
def list_offers() -> list[OfferSummary]:
    return [to_offer_summary(offer) for offer in repository.list()]


@app.post(
    "/api/headhunt/offers",
    response_model=HeadhuntOffer,
    status_code=status.HTTP_201_CREATED,
)
def create_offer(payload: HeadhuntOfferCreate) -> HeadhuntOffer:
    return repository.create(payload)


@app.get("/api/headhunt/offers/{offer_id}", response_model=HeadhuntOffer)
def get_offer(offer_id: str) -> HeadhuntOffer:
    offer = repository.get(offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND_MESSAGE)
    return offer


@app.patch("/api/headhunt/offers/{offer_id}", response_model=HeadhuntOffer)
def update_offer(offer_id: str, payload: HeadhuntOfferUpdate) -> HeadhuntOffer:
    offer = repository.update(offer_id, payload)
    if offer is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND_MESSAGE)
    return offer


@app.post("/api/headhunt/offers/{offer_id}/accept", response_model=HeadhuntOffer)
def accept_offer(offer_id: str) -> HeadhuntOffer:
    offer = repository.accept(offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND_MESSAGE)
    return offer


@app.patch("/api/headhunt/offers/{offer_id}/stage", response_model=HeadhuntOffer)
def update_stage(offer_id: str, payload: StageUpdateRequest) -> HeadhuntOffer:
    offer = repository.update_stage(offer_id, payload)
    if offer is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND_MESSAGE)
    return offer


@app.delete("/api/headhunt/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer(offer_id: str) -> Response:
    offer = repository.close(offer_id)
    if offer is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND_MESSAGE)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/headhunt/pipeline", response_model=PipelineResponse)
def get_pipeline() -> PipelineResponse:
    return build_pipeline(repository.list())


@app.get("/api/headhunt/visualization", response_model=PipelineResponse)
def get_visualization_data() -> PipelineResponse:
    return build_pipeline(repository.list())