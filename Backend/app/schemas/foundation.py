from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.foundation import FoundationStatus


class FoundationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    city: str = Field(..., min_length=2, max_length=80)
    description: str | None = Field(None, max_length=1000)
    phone: str | None = Field(None, max_length=30)
    years: int = Field(0, ge=0, le=200)
    initial: str = Field("?", min_length=1, max_length=2)
    gradient_from: str = Field("#C4813A", pattern=r"^#[0-9A-Fa-f]{6,8}$")
    gradient_to: str = Field("#E8A060", pattern=r"^#[0-9A-Fa-f]{6,8}$")

    @field_validator("initial")
    @classmethod
    def upper_initial(cls, v: str) -> str:
        return v.upper()


class FoundationUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    city: str | None = Field(None, min_length=2, max_length=80)
    description: str | None = Field(None, max_length=1000)
    phone: str | None = Field(None, max_length=30)
    years: int | None = Field(None, ge=0, le=200)
    initial: str | None = Field(None, min_length=1, max_length=2)
    gradient_from: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6,8}$")
    gradient_to: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6,8}$")
    # `adoptions` se actualiza solo desde el endpoint /pets/{id}/adopt — no exponer aquí.


class FoundationRead(FoundationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    adoptions: int
    animals: int = 0
    profile_complete: bool
    status: FoundationStatus
    created_at: datetime
