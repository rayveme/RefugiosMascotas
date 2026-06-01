from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Admin, Adopter, Foundation, FoundationStatus
from app.schemas.auth import Role
from app.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=True)

SessionDep = Annotated[AsyncSession, Depends(get_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def _credentials_error(detail: str = "No autorizado") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_principal(token: TokenDep) -> tuple[int, Role]:
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise _credentials_error(str(exc)) from exc

    sub = payload.get("sub")
    role = payload.get("role")
    if sub is None or role not in ("adopter", "foundation", "admin"):
        raise _credentials_error("Token incompleto")

    try:
        return int(sub), role  # type: ignore[return-value]
    except (TypeError, ValueError) as exc:
        raise _credentials_error("Subject inválido") from exc


PrincipalDep = Annotated[tuple[int, Role], Depends(get_current_principal)]


async def get_current_adopter(session: SessionDep, principal: PrincipalDep) -> Adopter:
    user_id, role = principal
    if role != "adopter":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Se requiere usuario adoptante")
    user = await session.get(Adopter, user_id)
    if user is None:
        raise _credentials_error("Adoptante no encontrado")
    return user


async def get_current_foundation(session: SessionDep, principal: PrincipalDep) -> Foundation:
    user_id, role = principal
    if role != "foundation":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Se requiere usuario fundación")
    foundation = await session.get(Foundation, user_id)
    if foundation is None:
        raise _credentials_error("Fundación no encontrada")
    return foundation


CurrentAdopter = Annotated[Adopter, Depends(get_current_adopter)]
CurrentFoundation = Annotated[Foundation, Depends(get_current_foundation)]


async def get_current_admin(session: SessionDep, principal: PrincipalDep) -> Admin:
    user_id, role = principal
    if role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Se requiere usuario admin")
    admin = await session.get(Admin, user_id)
    if admin is None:
        raise _credentials_error("Admin no encontrado")
    return admin


CurrentAdmin = Annotated[Admin, Depends(get_current_admin)]


async def require_approved_foundation(foundation: CurrentFoundation) -> Foundation:
    """Solo permite operar a fundaciones aprobadas por el admin."""
    if foundation.status == FoundationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta de refugio está pendiente de aprobación por un administrador.",
        )
    if foundation.status == FoundationStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu solicitud de refugio fue rechazada. Contacta al administrador.",
        )
    return foundation


ApprovedFoundation = Annotated[Foundation, Depends(require_approved_foundation)]


async def require_complete_adopter(adopter: CurrentAdopter) -> Adopter:
    if not adopter.profile_complete:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Perfil incompleto: completa city y phone antes de adoptar. "
                "Usa PATCH /adopters/me."
            ),
        )
    return adopter


CompleteAdopter = Annotated[Adopter, Depends(require_complete_adopter)]
