from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class HospitalBase(BaseModel):

    name:str = Field (..., min_length=3, max_length=255)
    address:Optional[str] = None
    email:Optional[str] = None
    telephone:Optional[str] = None


class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):

    id:int
    created_at: Optional[datetime] = None

    class Config:# inner class pydantic model covert to ORM
        from_attributes= True


class HospitalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3,max_length=255)
    address:Optional[str]=None
    email: Optional[str] =None
    telephone:Optional[str]=None

class EquipmentBase(BaseModel):
    hospital_id:int
    name:str
    model:Optional[str] = None
    serial_number:Optional[str] = None
    manufacturer:Optional[str] = None
    status:Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    hospital_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    model: Optional[str] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    status: Optional[str] = None

class EquipmentResponse(EquipmentBase):
    id:int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    equipment_id:int
    service_year:int
    quarter:int
    service_date:str
    engineer_name:str
    status:str
    remarks:str

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id:int
    created_at: datetime

    class Config:
        from_attributes = True


class ServiceAgreementResponse(BaseModel):
    id: int
    hospital_name: str
    equipment_name: str
    installation_date: Optional[date] = None
    contract_number: Optional[str] = None
    provider_type: Optional[str] = None
    agreement_start_date: Optional[date] = None
    agreement_end_date: Optional[date] = None
    source_row: int

    class Config:
        from_attributes = True


class ServiceAgreementUpdate(BaseModel):
    agreement_start_date: Optional[date] = None
    agreement_end_date: Optional[date] = None



class AgentQueryRequest(BaseModel):
    query:str
    thread_id: str | None = None

class AgentQueryResponse(BaseModel):
    query:str
    result:str
    thread_id:str

class DMLProposalRequest(BaseModel):
    query:str

class DMLProposalResponse(BaseModel):
    approval_id:str
    sql:str
    status:str

class DMLApprovalRequest(BaseModel):
    approval_id:str
    approve:bool

class DMLApprovalResponse(BaseModel):
    approval_id:str
    status:str
    result:str



