from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class HospitalBase(BaseModel):

    id:int
    name:str = Field (..., min_length=3, max_length=255)
    address:str
    email:str
    telephone:str


class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):

    id:int

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
    model:str
    serial_number:str
    manufacturer:str
    status:str


class EquipmentCreate(EquipmentBase):
    pass

class EquipmentResponse(EquipmentBase):
    id:int
    created_at: datetime

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



