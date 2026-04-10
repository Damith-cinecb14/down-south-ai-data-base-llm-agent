from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException
from database_config import get_db
from resp_models import HospitalCreate, HospitalResponse
from hospital_repository import HospitalRepository


router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.post("/", response_model=HospitalResponse,status_code=status.HTTP_201_CREATED)
async def create_hospital(hospital_data:HospitalCreate,db:AsyncSession = Depends(get_db)): # dependency injection
    # print(hospital_data)
    # return hospital_data
    repo = HospitalRepository(db)

    existing_hospital = await repo.get_hospital_by_email(hospital_data.email)

    if existing_hospital:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Hospital Already exists with this email")
    hospital= await repo.create(hospital_data)
    return hospital

@router.get("/",response_model=List[HospitalResponse])
async def get_hospitals(skip: int =0, limit:int =10, db:AsyncSession = Depends(get_db)):
    repo = HospitalRepository(db)

    hospitals = await repo.get_all_hospitals(skip=skip,limit=limit)
    return hospitals

@router.get("/{hospital_id}")
async def get_hospital(hospital_id: int, db:AsyncSession = Depends(get_db)):
    repo = HospitalRepository(db)
    hospital = await repo.get_hospital_by_id(hospital_id=hospital_id)

    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UHospital not found"
        )
    return hospital