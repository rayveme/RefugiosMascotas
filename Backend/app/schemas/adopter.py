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


class AdopterRead(AdopterBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    avatar_url: str | None
    profile_complete: bool
    created_at: datetime
