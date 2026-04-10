from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import Hospital
from resp_models import HospitalCreate


class HospitalRepository:


    def __init__(self, db: AsyncSession):

        self.db = db

    async def create(self,hospitals_create:HospitalCreate)  -> Hospital:

        hospital = Hospital(
            name=hospitals_create.name,
            address=hospitals_create.address,
            email=hospitals_create.email,
            telephone=hospitals_create.telephone
        )

        self.db.add(hospital)  # use ORM for sql queries
        await self.db.commit()
        await self.db.refresh(hospital)
        return hospital

    async def get_hospital_by_id(self,hospital_id:int) -> Hospital | None:

        query = select(Hospital).where(Hospital.id == hospital_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_hospital_by_email(self, email: str) -> Hospital | None:
        query = select(Hospital).where(Hospital.email == email)
        result = await self.db.execute(query)
        return result.scalars().first() # database row covert sqlalchemy formate

    async def get_all_hospitals(self,skip:int =0 , limit:int=10) -> list[Hospital]:

        query = select(Hospital).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

