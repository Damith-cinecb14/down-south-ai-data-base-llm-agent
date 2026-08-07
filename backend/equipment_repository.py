
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import Equipment
from resp_models import EquipmentCreate, EquipmentUpdate


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

    async def get_by_id(self, equipment_id: int) -> Equipment | None:
        result = await self.db.execute(select(Equipment).where(Equipment.id == equipment_id))
        return result.scalars().first()

    async def get_by_serial_number(self, serial_number: str) -> Equipment | None:
        result = await self.db.execute(select(Equipment).where(Equipment.serial_number == serial_number))
        return result.scalars().first()

    async def update(self, equipment: Equipment, equipment_update: EquipmentUpdate) -> Equipment:
        for field, value in equipment_update.model_dump(exclude_unset=True).items():
            setattr(equipment, field, value)
        await self.db.commit()
        await self.db.refresh(equipment)
        return equipment

    async def get_all(
            self,
            skip: int = 0,
            limit: int = 100,
            hospital_id: int | None = None
    ) -> list[Equipment]:
        query = select(Equipment).order_by(Equipment.hospital_id, Equipment.name)
        if hospital_id is not None:
            query = query.where(Equipment.hospital_id == hospital_id)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())




