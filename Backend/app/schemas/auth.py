from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Role = Literal["adopter", "foundation"]


class TokenPayload(BaseModel):
    sub: str
    role: Role
    exp: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    role: Role


class GoogleUserInfo(BaseModel):
    sub: str
    email: str
    name: str | None = None
    picture: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: Role


class AdopterRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=120)
    city: str | None = Field(None, max_length=80)
    phone: str | None = Field(None, max_length=30)


class FoundationRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=2, max_length=120)
    city: str = Field(..., min_length=2, max_length=80)
    description: str | None = Field(None, max_length=1000)
    phone: str | None = Field(None, max_length=30)
    years: int = Field(0, ge=0, le=200)
