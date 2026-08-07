from datetime import date, datetime

from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):#DRY principle- Dont Repeat your self
    pass



class Hospital(Base):

    __tablename__ = 'hospitals'

    id : Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    telephone: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=datetime.now()
    )


class Equipment(Base):

    __tablename__ = 'equipment'

    id : Mapped[int] =mapped_column(primary_key=True,index=True)
    hospital_id : Mapped[int]= mapped_column(ForeignKey("hospitals.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model : Mapped[str | None]=mapped_column(String(100),nullable=True)
    serial_number: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at : Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=datetime.now()
    )


class Services(Base):

    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    service_year: Mapped[int] = mapped_column(nullable=False)
    service_date: Mapped[str] = mapped_column(String(255),nullable=False)
    quarter: Mapped[int] = mapped_column(nullable=False)
    engineer_name:Mapped[str] =mapped_column(String(1000))
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    remarks:Mapped[str]=mapped_column(String(255) ,default="pending")
    created_at : Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=datetime.now()
    )


class ServiceAgreement(Base):

    __tablename__ = "service_agreements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    hospital_name: Mapped[str] = mapped_column(String(255), nullable=False)
    equipment_name: Mapped[str] = mapped_column(String(255), nullable=False)
    installation_date: Mapped[date | None] = mapped_column(nullable=True)
    contract_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    agreement_start_date: Mapped[date | None] = mapped_column(nullable=True)
    agreement_end_date: Mapped[date | None] = mapped_column(nullable=True)
    source_file: Mapped[str] = mapped_column(String(255), nullable=False)
    source_sheet: Mapped[str] = mapped_column(String(255), nullable=False)
    source_row: Mapped[int] = mapped_column(nullable=False)
    imported_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())


