from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select

from app.cloudinary_client import build_image_url, delete_image, upload_pet_image
from app.deps import ApprovedFoundation, SessionDep
from app.models import Foundation, FoundationStatus, Pet, PetType
from app.schemas.pet import PetCreate, PetRead, PetUpdate

router = APIRouter(prefix="/pets", tags=["pets"])

# 5 MiB. Cloudinary acepta más en plan gratis pero queremos cortar antes.
MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/webp"}


def _to_read(pet: Pet) -> PetRead:
    data = PetRead.model_validate(pet)
    data.shelter = pet.foundation.name if pet.foundation else ""
    data.image_url = build_image_url(pet.image_public_id)
    return data


@router.get("", response_model=list[PetRead])
async def list_pets(
    session: SessionDep,
    type: PetType | None = Query(None),
    city: str | None = Query(None),
    urgent: bool | None = Query(None),
    foundation_id: int | None = Query(None),
    include_adopted: bool = Query(False, description="Incluir mascotas ya adoptadas"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> list[PetRead]:
    stmt = select(Pet).join(Foundation).where(
        Foundation.status == FoundationStatus.APPROVED,
    )
    if not include_adopted:
        stmt = stmt.where(Pet.is_adopted.is_(False))
    if type is not None:
        stmt = stmt.where(Pet.type == type)
    if city:
        stmt = stmt.where(Pet.city.ilike(f"%{city}%"))
    if urgent is not None:
        stmt = stmt.where(Pet.urgent == urgent)
    if foundation_id is not None:
        stmt = stmt.where(Pet.foundation_id == foundation_id)
    stmt = stmt.order_by(Pet.id.desc()).limit(limit).offset(offset)

    pets = (await session.scalars(stmt)).unique().all()
    return [_to_read(p) for p in pets]


@router.get("/{pet_id}", response_model=PetRead)
async def get_pet(pet_id: int, session: SessionDep) -> PetRead:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    return _to_read(pet)


@router.post("", response_model=PetRead, status_code=status.HTTP_201_CREATED)
async def create_pet(
    payload: PetCreate,
    foundation: ApprovedFoundation,
    session: SessionDep,
) -> PetRead:
    pet = Pet(**payload.model_dump(), foundation_id=foundation.id)
    session.add(pet)
    await session.commit()
    await session.refresh(pet, attribute_names=["foundation"])
    return _to_read(pet)


@router.patch("/{pet_id}", response_model=PetRead)
async def update_pet(
    pet_id: int,
    payload: PetUpdate,
    foundation: ApprovedFoundation,
    session: SessionDep,
) -> PetRead:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    if pet.foundation_id != foundation.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar mascotas de otra fundación")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pet, field, value)
    await session.commit()
    await session.refresh(pet, attribute_names=["foundation"])
    return _to_read(pet)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    pet_id: int,
    foundation: ApprovedFoundation,
    session: SessionDep,
) -> None:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    if pet.foundation_id != foundation.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes borrar mascotas de otra fundación")
    await session.delete(pet)
    await session.commit()


@router.post(
    "/{pet_id}/image",
    response_model=PetRead,
    summary="Sube/reemplaza la foto de la mascota (Cloudinary)",
)
async def upload_image(
    pet_id: int,
    foundation: ApprovedFoundation,
    session: SessionDep,
    file: UploadFile = File(..., description="JPEG/PNG/WebP, máx 5 MB"),
) -> PetRead:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    if pet.foundation_id != foundation.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes subir foto a otra fundación")

    if file.content_type not in ALLOWED_IMAGE_MIME:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Solo se aceptan imágenes JPEG, PNG o WebP",
        )

    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"Imagen demasiado grande (máx {MAX_IMAGE_BYTES // (1024 * 1024)} MB)",
        )

    old_public_id = pet.image_public_id

    try:
        result = await upload_pet_image(content, filename=file.filename)
    except Exception as exc:  # cloudinary lanza varias clases distintas
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"Cloudinary rechazó la imagen: {exc}",
        ) from exc

    pet.image_public_id = result["public_id"]
    await session.commit()
    await session.refresh(pet, attribute_names=["foundation"])

    # Borra la anterior solo después de que la nueva quedó persistida.
    if old_public_id and old_public_id != pet.image_public_id:
        try:
            await delete_image(old_public_id)
        except Exception:
            pass  # no es crítico — quedará huérfana pero no afecta la app

    return _to_read(pet)


@router.delete(
    "/{pet_id}/image",
    response_model=PetRead,
    summary="Elimina la foto actual de la mascota",
)
async def delete_pet_image(
    pet_id: int,
    foundation: ApprovedFoundation,
    session: SessionDep,
) -> PetRead:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    if pet.foundation_id != foundation.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar mascotas de otra fundación")

    if pet.image_public_id:
        public_id = pet.image_public_id
        pet.image_public_id = None
        await session.commit()
        try:
            await delete_image(public_id)
        except Exception:
            pass

    await session.refresh(pet, attribute_names=["foundation"])
    return _to_read(pet)


# La adopción directa fue reemplazada por el flujo de solicitudes:
#   POST /pets/{pet_id}/request-adoption  (router app.routers.adoptions)
# La mascota solo se marca is_adopted=True cuando la fundación aprueba una solicitud.
