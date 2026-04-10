
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




