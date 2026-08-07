from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException

from database_config import get_db
from equipment_repository import EquipmentRepository
from hospital_repository import HospitalRepository
from resp_models import EquipmentCreate, EquipmentResponse, EquipmentUpdate

router = APIRouter(prefix="/equipments", tags=["Equipments"])


@router.get("/", response_model=List[EquipmentResponse])
async def get_equipments(
        skip: int = 0,
        limit: int = 100,
        hospital_id: int | None = None,
        db: AsyncSession = Depends(get_db)
):
    repo = EquipmentRepository(db)
    return await repo.get_all(skip=skip, limit=min(limit, 500), hospital_id=hospital_id)

@router.post("/", response_model=EquipmentResponse,status_code=status.HTTP_201_CREATED)
async  def create_equipment(
        equipment_data:EquipmentCreate,
        db: AsyncSession = Depends(get_db)

):

    repo = EquipmentRepository(db)
    hospital = await HospitalRepository(db).get_hospital_by_id(equipment_data.hospital_id)
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    if equipment_data.serial_number:
        existing_serial = await repo.get_by_serial_number(equipment_data.serial_number)
        if existing_serial:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Equipment already exists with this serial number")
    return await repo.create(equipment_data)


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
        equipment_id: int,
        equipment_data: EquipmentUpdate,
        db: AsyncSession = Depends(get_db)
):
    repo = EquipmentRepository(db)
    equipment = await repo.get_by_id(equipment_id)
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")

    if equipment_data.hospital_id is not None:
        hospital = await HospitalRepository(db).get_hospital_by_id(equipment_data.hospital_id)
        if not hospital:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    if equipment_data.serial_number and equipment_data.serial_number != equipment.serial_number:
        existing_serial = await repo.get_by_serial_number(equipment_data.serial_number)
        if existing_serial:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Equipment already exists with this serial number")

    return await repo.update(equipment, equipment_data)
