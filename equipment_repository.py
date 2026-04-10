
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import Equipment
from resp_models import EquipmentCreate


class EquipmentRepository:


    def __init__(self, db: AsyncSession):

        self.db = db

    async def create(self,equipment_create:EquipmentCreate)  ->Equipment:

       equipment = Equipment(
           hospital_id=equipment_create.hospital_id,
           name=equipment_create.name,
           model=equipment_create.model,
           serial_number=equipment_create.serial_number,
           manufacturer=equipment_create.manufacturer,
           status=equipment_create.status


       )

       self.db.add(equipment)  # use ORM for sql queries
       await self.db.commit()
       await self.db.refresh(equipment)
       return equipment




