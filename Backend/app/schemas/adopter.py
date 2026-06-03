from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdopterBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    city: str | None = Field(None, max_length=80)
    phone: str | None = Field(None, max_length=30)


class AdopterUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=120)
    city: str | None = Field(None, max_length=80)
    phone: str | None = Field(None, max_length=30)
    avatar_url: str | None = Field(None, max_length=500)
    # Perfil del hogar
    housing_type: str | None = Field(None, max_length=50)
    has_garden: bool | None = None
    has_children: bool | None = None
    has_other_pets: bool | None = None
    other_pets_desc: str | None = Field(None, max_length=500)
    adoption_reason: str | None = Field(None, max_length=2000)


class AdopterRead(AdopterBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    avatar_url: str | None
    profile_complete: bool
    created_at: datetime

    # Perfil del hogar
    housing_type: str | None = None
    has_garden: bool | None = None
    has_children: bool | None = None
    has_other_pets: bool | None = None
    other_pets_desc: str | None = None
    adoption_reason: str | None = None

    # Documentos (URLs seguras de Cloudinary)
    id_front_url: str | None = None
    id_back_url: str | None = None
    proof_address_url: str | None = None
    home_photo_urls: str | None = None   # pipe-separated
    signature_url: str | None = None
