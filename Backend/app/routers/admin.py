from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select

from app.cloudinary_client import build_image_url, delete_image
from app.deps import CurrentAdmin, SessionDep
from app.models import Adopter, Foundation, FoundationStatus, Pet
from app.schemas.adopter import AdopterRead
from app.schemas.foundation import FoundationRead
from app.schemas.pet import PetRead

# ── Schemas exclusivos del admin ──────────────────────────────────────────────

class AdminFoundationPatch(BaseModel):
    """Campos que el admin puede modificar en una fundación."""
    name:        str | None = Field(None, min_length=2, max_length=120)
    city:        str | None = Field(None, min_length=2, max_length=80)
    description: str | None = Field(None, max_length=1000)
    phone:       str | None = Field(None, max_length=30)
    years:       int | None = Field(None, ge=0, le=200)
    email:       EmailStr | None = None
    status:      FoundationStatus | None = None
    # Ubicación
    address:     str | None = Field(None, max_length=255)
    state:       str | None = Field(None, max_length=80)
    postal_code: str | None = Field(None, max_length=10)
    # Contacto adicional
    whatsapp:    str | None = Field(None, max_length=30)
    website:     str | None = Field(None, max_length=255)
    responsible: str | None = Field(None, max_length=120)
    # Redes sociales
    instagram:   str | None = Field(None, max_length=255)
    facebook:    str | None = Field(None, max_length=255)
    # Operación
    schedule:       str | None = Field(None, max_length=500)
    references:     str | None = Field(None, max_length=1000)
    vet_name:       str | None = Field(None, max_length=120)
    vet_phone:      str | None = Field(None, max_length=30)
    # Legal
    legal_id:       str | None = Field(None, max_length=50)
    donation_clabe: str | None = Field(None, max_length=20)


class AdminAdopterPatch(BaseModel):
    """Campos que el admin puede modificar en un adoptante."""
    full_name: str | None = Field(None, min_length=2, max_length=120)
    city:      str | None = Field(None, max_length=80)
    phone:     str | None = Field(None, max_length=30)
    email:     EmailStr | None = None

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get(
    "/me",
    summary="Devuelve el perfil del admin autenticado",
)
async def read_me(admin: CurrentAdmin) -> dict:
    return {
        "id": admin.id,
        "email": admin.email,
        "full_name": admin.full_name,
        "created_at": admin.created_at.isoformat(),
    }


def _foundation_to_read(foundation: Foundation, animals: int) -> FoundationRead:
    data = FoundationRead.model_validate(foundation)
    data.animals = animals
    return data


def _pet_to_read(pet: Pet) -> PetRead:
    data = PetRead.model_validate(pet)
    data.shelter = pet.foundation.name if pet.foundation else ""
    data.image_url = build_image_url(pet.image_public_id)
    return data


# ============================================================
#   FUNDACIONES
# ============================================================

@router.get(
    "/foundations",
    response_model=list[FoundationRead],
    summary="Lista todas las fundaciones (filtrable por status)",
)
async def list_foundations(
    _: CurrentAdmin,
    session: SessionDep,
    status_filter: FoundationStatus | None = Query(None, alias="status"),
) -> list[FoundationRead]:
    stmt = select(Foundation)
    if status_filter:
        stmt = stmt.where(Foundation.status == status_filter)
    stmt = stmt.order_by(Foundation.created_at.desc())
    foundations = (await session.scalars(stmt)).all()
    if not foundations:
        return []

    counts_stmt = (
        select(Pet.foundation_id, func.count(Pet.id))
        .where(Pet.foundation_id.in_([f.id for f in foundations]))
        .group_by(Pet.foundation_id)
    )
    counts = dict((await session.execute(counts_stmt)).all())
    return [_foundation_to_read(f, counts.get(f.id, 0)) for f in foundations]


@router.post(
    "/foundations/{foundation_id}/approve",
    response_model=FoundationRead,
    summary="Aprueba la solicitud de una fundación pendiente",
)
async def approve_foundation(
    foundation_id: int,
    _: CurrentAdmin,
    session: SessionDep,
) -> FoundationRead:
    foundation = await session.get(Foundation, foundation_id)
    if foundation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fundación no encontrada")
    foundation.status = FoundationStatus.APPROVED
    await session.commit()
    await session.refresh(foundation)
    animals = await session.scalar(
        select(func.count(Pet.id)).where(Pet.foundation_id == foundation.id)
    )
    return _foundation_to_read(foundation, animals or 0)


@router.post(
    "/foundations/{foundation_id}/reject",
    response_model=FoundationRead,
    summary="Rechaza la solicitud de una fundación",
)
async def reject_foundation(
    foundation_id: int,
    _: CurrentAdmin,
    session: SessionDep,
) -> FoundationRead:
    foundation = await session.get(Foundation, foundation_id)
    if foundation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fundación no encontrada")
    foundation.status = FoundationStatus.REJECTED
    await session.commit()
    await session.refresh(foundation)
    animals = await session.scalar(
        select(func.count(Pet.id)).where(Pet.foundation_id == foundation.id)
    )
    return _foundation_to_read(foundation, animals or 0)


@router.patch(
    "/foundations/{foundation_id}",
    response_model=FoundationRead,
    summary="Actualiza campos de una fundación (admin override)",
)
async def update_foundation(
    foundation_id: int,
    body: AdminFoundationPatch,
    _: CurrentAdmin,
    session: SessionDep,
) -> FoundationRead:
    foundation = await session.get(Foundation, foundation_id)
    if foundation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fundación no encontrada")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(foundation, field, value)
    await session.commit()
    await session.refresh(foundation)
    animals = await session.scalar(
        select(func.count(Pet.id)).where(Pet.foundation_id == foundation.id)
    )
    return _foundation_to_read(foundation, animals or 0)


@router.delete(
    "/foundations/{foundation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina una fundación (cascade: borra mascotas y solicitudes)",
)
async def delete_foundation(
    foundation_id: int,
    _: CurrentAdmin,
    session: SessionDep,
) -> None:
    foundation = await session.get(Foundation, foundation_id)
    if foundation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fundación no encontrada")

    # Recoger imágenes de todas las mascotas para borrarlas de Cloudinary.
    pet_image_ids = [
        p.image_public_id for p in foundation.pets if p.image_public_id
    ]

    await session.delete(foundation)
    await session.commit()

    for public_id in pet_image_ids:
        try:
            await delete_image(public_id)
        except Exception:
            pass


# ============================================================
#   ADOPTANTES
# ============================================================

@router.get(
    "/adopters",
    response_model=list[AdopterRead],
    summary="Lista todos los adoptantes",
)
async def list_adopters(
    _: CurrentAdmin,
    session: SessionDep,
) -> list[AdopterRead]:
    stmt = select(Adopter).order_by(Adopter.created_at.desc())
    adopters = (await session.scalars(stmt)).all()
    return [AdopterRead.model_validate(a) for a in adopters]


@router.patch(
    "/adopters/{adopter_id}",
    response_model=AdopterRead,
    summary="Actualiza campos de un adoptante (admin override)",
)
async def update_adopter(
    adopter_id: int,
    body: AdminAdopterPatch,
    _: CurrentAdmin,
    session: SessionDep,
) -> AdopterRead:
    adopter = await session.get(Adopter, adopter_id)
    if adopter is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Adoptante no encontrado")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(adopter, field, value)
    await session.commit()
    await session.refresh(adopter)
    return AdopterRead.model_validate(adopter)


@router.delete(
    "/adopters/{adopter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un adoptante (cascade: borra sus solicitudes)",
)
async def delete_adopter(
    adopter_id: int,
    _: CurrentAdmin,
    session: SessionDep,
) -> None:
    adopter = await session.get(Adopter, adopter_id)
    if adopter is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Adoptante no encontrado")
    await session.delete(adopter)
    await session.commit()


# ============================================================
#   MASCOTAS
# ============================================================

@router.get(
    "/pets",
    response_model=list[PetRead],
    summary="Lista todas las mascotas (incluyendo adoptadas y de fundaciones pending)",
)
async def list_pets(
    _: CurrentAdmin,
    session: SessionDep,
) -> list[PetRead]:
    stmt = select(Pet).order_by(Pet.created_at.desc())
    pets = (await session.scalars(stmt)).unique().all()
    return [_pet_to_read(p) for p in pets]


@router.delete(
    "/pets/{pet_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina una publicación de mascota (admin override)",
)
async def delete_pet(
    pet_id: int,
    _: CurrentAdmin,
    session: SessionDep,
) -> None:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")

    public_id = pet.image_public_id
    await session.delete(pet)
    await session.commit()

    if public_id:
        try:
            await delete_image(public_id)
        except Exception:
            pass
