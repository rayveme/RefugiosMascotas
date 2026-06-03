from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.adoption_request import AdoptionStatus


class AdoptionRequestCreate(BaseModel):
    """Body que envía un adopter al pedir adoptar."""
    message: str | None = Field(None, max_length=500)


class _PetSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    breed: str
    type: Literal["Perro", "Gato"]
    image_public_id: str | None = None
    image_url: str | None = None  # se llena en el router


class _AdopterSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    city: str | None
    avatar_url: str | None
    # Perfil del hogar
    housing_type: str | None = None
    has_garden: bool | None = None
    has_children: bool | None = None
    has_other_pets: bool | None = None
    other_pets_desc: str | None = None
    adoption_reason: str | None = None
    # Documentos
    id_front_url: str | None = None
    id_back_url: str | None = None
    proof_address_url: str | None = None
    home_photo_urls: str | None = None
    signature_url: str | None = None


class AdoptionRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pet_id: int
    adopter_id: int
    foundation_id: int
    status: AdoptionStatus
    message: str | None
    created_at: datetime
    updated_at: datetime

    pet: _PetSummary
    adopter: _AdopterSummary
