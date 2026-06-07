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
    # Ubicación adicional
    address: str | None = None
    state: str | None = None
    postal_code: str | None = None
    # Contacto adicional
    whatsapp: str | None = None
    website: str | None = None
    responsible: str | None = None
    # Redes sociales
    instagram: str | None = None
    facebook: str | None = None
    # Operación
    schedule: str | None = None
    references: str | None = None
    vet_name: str | None = None
    vet_phone: str | None = None
    # Legal
    legal_id: str | None = None
    donation_clabe: str | None = None

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
    # Ubicación adicional
    address: str | None = Field(None, max_length=255)
    state: str | None = Field(None, max_length=80)
    postal_code: str | None = Field(None, max_length=10)
    # Contacto adicional
    whatsapp: str | None = Field(None, max_length=30)
    website: str | None = Field(None, max_length=255)
    responsible: str | None = Field(None, max_length=120)
    # Redes sociales
    instagram: str | None = Field(None, max_length=255)
    facebook: str | None = Field(None, max_length=255)
    # Operación
    schedule: str | None = Field(None, max_length=500)
    references: str | None = Field(None, max_length=1000)
    vet_name: str | None = Field(None, max_length=120)
    vet_phone: str | None = Field(None, max_length=30)
    # Legal
    legal_id: str | None = Field(None, max_length=50)
    donation_clabe: str | None = Field(None, max_length=20)
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
