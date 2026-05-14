from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import OpportunityListResponse, OpportunityQuery, RefreshResponse, VolunteerPortal
from .service import OpportunityService

app = FastAPI(
    title="Probono Volunteer Backend",
    description="APIs for professional volunteer opportunity discovery.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = OpportunityService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/probono/opportunities", response_model=OpportunityListResponse)
async def list_opportunities(
    location: str | None = None,
    skill: str | None = None,
    portal: VolunteerPortal | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    include_live: bool = True,
) -> OpportunityListResponse:
    query = OpportunityQuery(
        location=location,
        skill=skill,
        portal=portal,
        limit=limit,
        include_live=include_live,
    )
    return await service.list_opportunities(query)


@app.post("/api/probono/opportunities/refresh", response_model=RefreshResponse)
async def refresh_opportunities(limit: int = Query(default=50, ge=1, le=100)) -> RefreshResponse:
    return await service.refresh(limit=limit)


@app.get("/api/probono/skills", response_model=list[str])
def list_skills() -> list[str]:
    return service.skills()