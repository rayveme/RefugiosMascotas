from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.cloudinary_client import build_image_url
from app.deps import ApprovedFoundation, CompleteAdopter, SessionDep
from app.models import AdoptionRequest, AdoptionStatus, Pet
from app.schemas.adoption_request import AdoptionRequestCreate, AdoptionRequestRead

router = APIRouter(tags=["adoptions"])


def _to_read(req: AdoptionRequest) -> AdoptionRequestRead:
    data = AdoptionRequestRead.model_validate(req)
    if req.pet and req.pet.image_public_id:
        data.pet.image_url = build_image_url(req.pet.image_public_id)
    return data


# --- Adopter: crear solicitud ---

@router.post(
    "/pets/{pet_id}/request-adoption",
    response_model=AdoptionRequestRead,
    status_code=status.HTTP_201_CREATED,
    summary="El adoptante crea una solicitud de adopción para una mascota",
)
async def request_adoption(
    pet_id: int,
    payload: AdoptionRequestCreate,
    adopter: CompleteAdopter,
    session: SessionDep,
) -> AdoptionRequestRead:
    pet = await session.get(Pet, pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    if pet.is_adopted:
        raise HTTPException(status.HTTP_409_CONFLICT, "La mascota ya fue adoptada")

    existing = (
        await session.scalars(
            select(AdoptionRequest).where(
                AdoptionRequest.pet_id == pet_id,
                AdoptionRequest.adopter_id == adopter.id,
                AdoptionRequest.status == AdoptionStatus.PENDING,
            )
        )
    ).first()
    if existing is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Ya tienes una solicitud pendiente para esta mascota",
        )

    req = AdoptionRequest(
        pet_id=pet.id,
        adopter_id=adopter.id,
        foundation_id=pet.foundation_id,
        message=payload.message,
        status=AdoptionStatus.PENDING,
    )
    session.add(req)
    await session.commit()
    await session.refresh(req, attribute_names=["pet", "adopter"])
    return _to_read(req)


# --- Adopter: listar mis solicitudes ---

@router.get(
    "/adoption-requests/mine",
    response_model=list[AdoptionRequestRead],
    summary="Solicitudes que el adopter actual ha enviado",
)
async def list_my_requests(
    adopter: CompleteAdopter,
    session: SessionDep,
    status_filter: AdoptionStatus | None = Query(None, alias="status"),
) -> list[AdoptionRequestRead]:
    stmt = select(AdoptionRequest).where(AdoptionRequest.adopter_id == adopter.id)
    if status_filter:
        stmt = stmt.where(AdoptionRequest.status == status_filter)
    stmt = stmt.order_by(AdoptionRequest.created_at.desc())
    requests = (await session.scalars(stmt)).unique().all()
    return [_to_read(r) for r in requests]


# --- Foundation: listar solicitudes recibidas ---

@router.get(
    "/adoption-requests",
    response_model=list[AdoptionRequestRead],
    summary="Solicitudes recibidas por la fundación autenticada",
)
async def list_foundation_requests(
    foundation: ApprovedFoundation,
    session: SessionDep,
    status_filter: AdoptionStatus | None = Query(None, alias="status"),
) -> list[AdoptionRequestRead]:
    stmt = select(AdoptionRequest).where(AdoptionRequest.foundation_id == foundation.id)
    if status_filter:
        stmt = stmt.where(AdoptionRequest.status == status_filter)
    stmt = stmt.order_by(AdoptionRequest.created_at.desc())
    requests = (await session.scalars(stmt)).unique().all()
    return [_to_read(r) for r in requests]


# --- Foundation: aprobar solicitud ---

@router.post(
    "/adoption-requests/{request_id}/approve",
    response_model=AdoptionRequestRead,
    summary="Aprueba la solicitud y rechaza automáticamente las otras pendientes de esa mascota",
)
async def approve_request(
    request_id: int,
    foundation: ApprovedFoundation,
    session: SessionDep,
) -> AdoptionRequestRead:
    req = await session.get(AdoptionRequest, request_id)
    if req is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Solicitud no encontrada")
    if req.foundation_id != foundation.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "No puedes gestionar solicitudes de otra fundación",
        )
    if req.status != AdoptionStatus.PENDING:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"La solicitud ya está {req.status.value}",
        )

    pet = await session.get(Pet, req.pet_id)
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mascota no encontrada")
    if pet.is_adopted:
        raise HTTPException(status.HTTP_409_CONFLICT, "La mascota ya fue adoptada")

    # Aprobar esta + auto-rechazar las otras pendientes de la misma mascota.
    req.status = AdoptionStatus.APPROVED
    pet.is_adopted = True
    pet.adopter_id = req.adopter_id
    pet.foundation.adoptions += 1

    others = (
        await session.scalars(
            select(AdoptionRequest).where(
                AdoptionRequest.pet_id == pet.id,
                AdoptionRequest.id != req.id,
                AdoptionRequest.status == AdoptionStatus.PENDING,
            )
        )
    ).all()
    for other in others:
        other.status = AdoptionStatus.REJECTED

    await session.commit()
    await session.refresh(req, attribute_names=["pet", "adopter"])
    return _to_read(req)


# --- Foundation: rechazar solicitud ---

@router.post(
    "/adoption-requests/{request_id}/reject",
    response_model=AdoptionRequestRead,
    summary="Rechaza esta solicitud (las otras pendientes siguen activas)",
)
async def reject_request(
    request_id: int,
    foundation: ApprovedFoundation,
    session: SessionDep,
) -> AdoptionRequestRead:
    req = await session.get(AdoptionRequest, request_id)
    if req is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Solicitud no encontrada")
    if req.foundation_id != foundation.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "No puedes gestionar solicitudes de otra fundación",
        )
    if req.status != AdoptionStatus.PENDING:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"La solicitud ya está {req.status.value}",
        )

    req.status = AdoptionStatus.REJECTED
    await session.commit()
    await session.refresh(req, attribute_names=["pet", "adopter"])
    return _to_read(req)
