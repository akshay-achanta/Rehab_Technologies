from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
import uuid


# --- Auth ---
class RegisterRequest(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    mobile: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- User ---
class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    mobile: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Services ---
class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Wrench"
    is_active: bool = True


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    icon: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Service Requests ---
class ServiceRequestCreate(BaseModel):
    service_id: uuid.UUID
    property_type: str
    location: str
    preferred_date: Optional[date] = None
    notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


class ServiceOut_Mini(BaseModel):
    id: uuid.UUID
    name: str
    icon: Optional[str]

    class Config:
        from_attributes = True


class UserOut_Mini(BaseModel):
    id: uuid.UUID
    name: str
    mobile: str

    class Config:
        from_attributes = True


class ServiceRequestOut(BaseModel):
    id: str
    user_id: uuid.UUID
    service_id: uuid.UUID
    property_type: str
    location: str
    preferred_date: Optional[date]
    notes: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    service: Optional[ServiceOut_Mini] = None
    user: Optional[UserOut_Mini] = None

    class Config:
        from_attributes = True
