from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from agreement_repository import ServiceAgreementRepository
from database_config import get_db
from resp_models import ServiceAgreementResponse


router = APIRouter(prefix="/agreements", tags=["Service Agreements"])


@router.get("/", response_model=List[ServiceAgreementResponse])
async def get_service_agreements(
        skip: int = 0,
        limit: int = 100,
        hospital_name: str | None = None,
        db: AsyncSession = Depends(get_db)
):
    repo = ServiceAgreementRepository(db)
    return await repo.get_all(
        skip=skip,
        limit=min(limit, 500),
        hospital_name=hospital_name,
    )
