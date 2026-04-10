from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException

from database_config import get_db
from service_repository import ServiceRepository
from resp_models import ServiceCreate, ServiceResponse

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceResponse,status_code=status.HTTP_201_CREATED)
async  def create_service(
        service_data:ServiceCreate,
        db: AsyncSession = Depends(get_db)

):

    repo = ServiceRepository(db)

    try:
        service = await repo.create(service_data)
        return service
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f" An Error occurred -{str(e)} "
        )