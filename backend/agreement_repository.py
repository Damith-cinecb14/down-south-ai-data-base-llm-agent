from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import ServiceAgreement


class ServiceAgreementRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
            self,
            skip: int = 0,
            limit: int = 100,
            hospital_name: str | None = None
    ) -> list[ServiceAgreement]:
        query = select(ServiceAgreement).order_by(
            ServiceAgreement.agreement_end_date,
            ServiceAgreement.hospital_name,
            ServiceAgreement.equipment_name,
        )
        if hospital_name:
            query = query.where(ServiceAgreement.hospital_name == hospital_name)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())
