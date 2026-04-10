from datetime import datetime

from sqlalchemy import String, func, TextAsFrom, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):#DRY principle- Dont Repeat your self
    pass



class Hospital(Base):

    __tablename__ = 'hospitals'

    id : Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255),unique=True, nullable=False)
    telephone: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=datetime.now()
    )


class Equipment(Base):

    __tablename__ = 'equipment'

    id : Mapped[int] =mapped_column(primary_key=True,index=True)
    hospital_id : Mapped[int]= mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model : Mapped[str]=mapped_column(String(100),nullable=False)
    serial_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    manufacturer: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at : Mapped[datetime] = mapped_column(
        server_default=func.now(),
        default=datetime.now()
    )


class Services(Base):

    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    equipment_id: Mapped[int] = mapped_column(nullable=False)
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


