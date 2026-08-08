from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException

from agreement_repository import ServiceAgreementRepository
from database_config import get_db
from resp_models import ServiceAgreementResponse, ServiceAgreementUpdate


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


@router.patch("/{agreement_id}", response_model=ServiceAgreementResponse)
async def update_service_agreement_coverage(
        agreement_id: int,
        agreement_update: ServiceAgreementUpdate,
        db: AsyncSession = Depends(get_db)
):
    repo = ServiceAgreementRepository(db)
    agreement = await repo.get_by_id(agreement_id)
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service agreement not found",
        )

    start_date = agreement_update.agreement_start_date
    end_date = agreement_update.agreement_end_date
    if (start_date is None) != (end_date is None):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Enter both coverage dates or clear both dates.",
        )
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coverage end date cannot be before the start date.",
        )

    return await repo.update_coverage(agreement, agreement_update)
