from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_, select

from app.deps import CurrentFoundation, SessionDep
from app.models import Foundation, Pet
from app.schemas.foundation import FoundationRead, FoundationUpdate

router = APIRouter(prefix="/foundations", tags=["foundations"])


def _to_read(foundation: Foundation, animals: int) -> FoundationRead:
    data = FoundationRead.model_validate(foundation)
    data.animals = animals
    return data


@router.get("", response_model=list[FoundationRead])
async def list_foundations(
    session: SessionDep,
    search: str | None = Query(None, description="Buscar por nombre o ciudad"),
    city: str | None = Query(None, description="Filtrar por ciudad exacta"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> list[FoundationRead]:
    stmt = select(Foundation)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(Foundation.name.ilike(like), Foundation.city.ilike(like)))
    if city:
        stmt = stmt.where(Foundation.city.ilike(f"%{city}%"))
    stmt = stmt.order_by(Foundation.id).limit(limit).offset(offset)
    foundations = (await session.scalars(stmt)).all()

    if not foundations:
        return []

    counts_stmt = (
        select(Pet.foundation_id, func.count(Pet.id))
        .where(Pet.foundation_id.in_([f.id for f in foundations]))
        .group_by(Pet.foundation_id)
    )
    counts = dict((await session.execute(counts_stmt)).all())
    return [_to_read(f, counts.get(f.id, 0)) for f in foundations]


@router.get("/me", response_model=FoundationRead)
async def read_me(foundation: CurrentFoundation, session: SessionDep) -> FoundationRead:
    animals = await session.scalar(
        select(func.count(Pet.id)).where(Pet.foundation_id == foundation.id)
    )
    return _to_read(foundation, animals or 0)


@router.patch("/me", response_model=FoundationRead)
async def update_me(
    payload: FoundationUpdate,
    foundation: CurrentFoundation,
    session: SessionDep,
) -> FoundationRead:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(foundation, field, value)
    await session.commit()
    await session.refresh(foundation)
    animals = await session.scalar(
        select(func.count(Pet.id)).where(Pet.foundation_id == foundation.id)
    )
    return _to_read(foundation, animals or 0)


@router.get("/{foundation_id}", response_model=FoundationRead)
async def get_foundation(foundation_id: int, session: SessionDep) -> FoundationRead:
    foundation = await session.get(Foundation, foundation_id)
    if foundation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fundación no encontrada")
    animals = await session.scalar(
        select(func.count(Pet.id)).where(Pet.foundation_id == foundation.id)
    )
    return _to_read(foundation, animals or 0)
