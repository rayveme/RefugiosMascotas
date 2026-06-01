from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.pet import PetType


class PetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    type: PetType
    breed: str = Field(..., min_length=1, max_length=120)
    age: str = Field(..., min_length=1, max_length=40)
    city: str = Field(..., min_length=2, max_length=80)
    urgent: bool = False
    vaccinated: bool = False
    sterilized: bool = False
    gradient_from: str = Field("#C4813A", pattern=r"^#[0-9A-Fa-f]{6,8}$")
    gradient_to: str = Field("#E8A060", pattern=r"^#[0-9A-Fa-f]{6,8}$")


class PetCreate(PetBase):
    pass


class PetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=80)
    type: PetType | None = None
    breed: str | None = Field(None, min_length=1, max_length=120)
    age: str | None = Field(None, min_length=1, max_length=40)
    city: str | None = Field(None, min_length=2, max_length=80)
    urgent: bool | None = None
    vaccinated: bool | None = None
    sterilized: bool | None = None
    gradient_from: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6,8}$")
    gradient_to: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6,8}$")


class PetRead(PetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    foundation_id: int
    shelter: str = ""  # nombre de la fundación, llenado en el router
    is_adopted: bool = False
    image_public_id: str | None = None
    image_url: str | None = None  # URL optimizada, calculada en el router
    created_at: datetime
