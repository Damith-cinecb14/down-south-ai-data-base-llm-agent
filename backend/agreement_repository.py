from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db_models import Equipment, Hospital, ServiceAgreement
from resp_models import ServiceAgreementUpdate


def normalized_asset_name(column):
    compact_name = func.regexp_replace(
        func.lower(column),
        "[^a-z0-9]",
        "",
        "g",
    )
    return func.regexp_replace(compact_name, r"(.)\1+", r"\1", "g")


class ServiceAgreementRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, agreement_id: int) -> ServiceAgreement | None:
        result = await self.db.execute(
            select(ServiceAgreement).where(ServiceAgreement.id == agreement_id)
        )
        return result.scalars().first()

    async def update_coverage(
            self,
            agreement: ServiceAgreement,
            agreement_update: ServiceAgreementUpdate
    ) -> ServiceAgreement:
        agreement.agreement_start_date = agreement_update.agreement_start_date
        agreement.agreement_end_date = agreement_update.agreement_end_date
        await self.db.commit()
        await self.db.refresh(agreement)
        return agreement

    async def get_all(
            self,
            skip: int = 0,
            limit: int = 100,
            hospital_name: str | None = None
    ) -> list[ServiceAgreement]:
        agreement_equipment_name = normalized_asset_name(ServiceAgreement.equipment_name)
        equipment_model = normalized_asset_name(Equipment.model)
        equipment_name = normalized_asset_name(Equipment.name)
        current_equipment_exists = (
            select(Equipment.id)
            .join(Hospital, Hospital.id == Equipment.hospital_id)
            .where(
                func.lower(func.trim(Hospital.name))
                == func.lower(func.trim(ServiceAgreement.hospital_name)),
                or_(
                    equipment_model == agreement_equipment_name,
                    equipment_name == agreement_equipment_name,
                    func.strpos(equipment_model, agreement_equipment_name) > 0,
                    func.strpos(equipment_name, agreement_equipment_name) > 0,
                    func.strpos(agreement_equipment_name, equipment_model) > 0,
                    func.strpos(agreement_equipment_name, equipment_name) > 0,
                ),
            )
            .exists()
        )

        query = select(ServiceAgreement).where(current_equipment_exists).order_by(
            ServiceAgreement.agreement_end_date,
            ServiceAgreement.hospital_name,
            ServiceAgreement.equipment_name,
        )
        if hospital_name:
            query = query.where(ServiceAgreement.hospital_name == hospital_name)
        result = await self.db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())
