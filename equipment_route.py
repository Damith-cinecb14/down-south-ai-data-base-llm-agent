from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException

from database_config import get_db
from equipment_repository import EquipmentRepository
from resp_models import EquipmentCreate, EquipmentResponse

router = APIRouter(prefix="/equipments", tags=["Equipments"])

@router.post("/", response_model=EquipmentResponse,status_code=status.HTTP_201_CREATED)
async  def create_equipment(
        equipment_data:EquipmentCreate,
        db: AsyncSession = Depends(get_db)

):

    repo = EquipmentRepository(db)

    try:
        equipment = await repo.create(equipment_data)
        return equipment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f" An Error occurred -{str(e)} "
        )