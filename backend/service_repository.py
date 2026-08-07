
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import Services
from resp_models import ServiceCreate


class ServiceRepository:


    def __init__(self, db: AsyncSession):

        self.db = db

    async def create(self,service_create:ServiceCreate)  ->Services:

       service = Services(
           equipment_id=service_create.equipment_id,
           service_year=service_create.service_year,
           quarter=service_create.quarter,
           service_date=service_create.service_date,
           engineer_name=service_create.engineer_name,
           status=service_create.status,
           remarks=service_create.remarks


       )

       self.db.add(service)  # use ORM for sql queries
       await self.db.commit()
       await self.db.refresh(service)
       return service

    async def get_all(
            self,
            skip: int = 0,
            limit: int = 100,
            equipment_id: int | None = None
    ) -> list[Services]:
       query = select(Services).order_by(Services.service_year.desc(), Services.id.desc())
       if equipment_id is not None:
           query = query.where(Services.equipment_id == equipment_id)
       result = await self.db.execute(query.offset(skip).limit(limit))
       return list(result.scalars().all())




