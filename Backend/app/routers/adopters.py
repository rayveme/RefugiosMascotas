from fastapi import APIRouter

from app.deps import CurrentAdopter, SessionDep
from app.schemas.adopter import AdopterRead, AdopterUpdate

router = APIRouter(prefix="/adopters", tags=["adopters"])


@router.get("/me", response_model=AdopterRead)
async def read_me(adopter: CurrentAdopter) -> AdopterRead:
    return AdopterRead.model_validate(adopter)


@router.patch("/me", response_model=AdopterRead)
async def update_me(
    payload: AdopterUpdate,
    adopter: CurrentAdopter,
    session: SessionDep,
) -> AdopterRead:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(adopter, field, value)
    await session.commit()
    await session.refresh(adopter)
    return AdopterRead.model_validate(adopter)
