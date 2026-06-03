from typing import Literal

from authlib.integrations.base_client import OAuthError
from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.deps import SessionDep
from app.models import Admin, Adopter, Foundation
from app.oauth import oauth
from app.schemas.admin import AdminRegister
from app.schemas.auth import (
    AdopterRegister,
    FoundationRegister,
    GoogleUserInfo,
    LoginRequest,
    Role,
    TokenResponse,
)
from app.security import (
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _ensure_google_ready() -> None:
    if not settings.google_enabled:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Google OAuth no está configurado (define GOOGLE_CLIENT_ID/SECRET).",
        )


def _make_token(role: Role, principal_id: int) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(principal_id, role), role=role)


# --------- Registro / Login con email + contraseña ---------

@router.post(
    "/register/adopter",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registra un adoptante con email y contraseña",
)
async def register_adopter(payload: AdopterRegister, session: SessionDep) -> TokenResponse:
    if await _email_exists(session, Adopter, payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")

    adopter = Adopter(
        email=payload.email,
        full_name=payload.full_name,
        city=payload.city,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    session.add(adopter)
    await session.commit()
    await session.refresh(adopter)
    return _make_token("adopter", adopter.id)


@router.post(
    "/register/foundation",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registra una fundación (queda PENDING hasta que un admin la apruebe)",
)
async def register_foundation(
    payload: FoundationRegister, session: SessionDep
) -> TokenResponse:
    if await _email_exists(session, Foundation, payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")

    # status arranca en PENDING (default del modelo). El admin aprueba después
    # via /admin/foundations/{id}/approve.
    foundation = Foundation(
        email=payload.email,
        name=payload.name,
        city=payload.city,
        description=payload.description,
        phone=payload.phone,
        years=payload.years,
        initial=payload.name[:1].upper(),
        password_hash=hash_password(payload.password),
    )
    session.add(foundation)
    await session.commit()
    await session.refresh(foundation)
    return _make_token("foundation", foundation.id)


@router.post(
    "/register/admin",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registra una cuenta de administrador (requiere ADMIN_SECRET en producción)",
)
async def register_admin(payload: AdminRegister, session: SessionDep) -> TokenResponse:
    if not settings.debug:
        if not settings.admin_secret:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "El registro de administradores está deshabilitado en este entorno.",
            )
        if payload.secret_code != settings.admin_secret:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Código de administrador incorrecto.",
            )

    if await _email_exists(session, Admin, payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")

    admin = Admin(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
    )
    session.add(admin)
    await session.commit()
    await session.refresh(admin)
    return _make_token("admin", admin.id)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    if payload.role == "adopter":
        user = await _get_by_email(session, Adopter, payload.email)
    elif payload.role == "foundation":
        user = await _get_by_email(session, Foundation, payload.email)
    else:  # admin
        user = await _get_by_email(session, Admin, payload.email)

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")

    return _make_token(payload.role, user.id)


# --------- Google OAuth ---------

@router.get("/google/login", summary="Inicia el flujo OAuth de Google")
async def google_login(
    request: Request,
    role: Literal["adopter", "foundation"] = Query(
        "adopter", description="Tipo de usuario que se está autenticando"
    ),
):
    _ensure_google_ready()
    request.session["oauth_role"] = role
    return await oauth.google.authorize_redirect(request, settings.google_redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, session: SessionDep) -> RedirectResponse:
    """Tras el OAuth, redirige al front pasando el JWT en el hash de la URL.

    Usamos hash (#) en lugar de query (?) para que el token no quede en logs
    de servidores intermedios ni en el referer del navegador.
    """
    _ensure_google_ready()
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as exc:
        return _redirect_with_error(exc.error or "oauth_error")

    userinfo_raw = token.get("userinfo") or await oauth.google.userinfo(token=token)
    info = GoogleUserInfo.model_validate(dict(userinfo_raw))

    role: Role = request.session.pop("oauth_role", "adopter")
    if role == "foundation":
        principal_id = await _upsert_foundation(session, info)
    else:
        principal_id = await _upsert_adopter(session, info)

    access_token = create_access_token(principal_id, role)
    target = (
        f"{settings.frontend_url}/auth/callback"
        f"#token={access_token}&role={role}"
    )
    return RedirectResponse(target, status_code=status.HTTP_302_FOUND)


def _redirect_with_error(error: str) -> RedirectResponse:
    return RedirectResponse(
        f"{settings.frontend_url}/auth/callback#error={error}",
        status_code=status.HTTP_302_FOUND,
    )


# --------- Login de desarrollo (sin Google) ---------

@router.post(
    "/dev-login",
    response_model=TokenResponse,
    summary="Login de desarrollo (solo si DEBUG=true)",
)
async def dev_login(
    session: SessionDep,
    email: str,
    role: Literal["adopter", "foundation"] = "adopter",
    name: str = "Dev User",
) -> TokenResponse:
    if not settings.debug:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No disponible")

    info = GoogleUserInfo(sub=f"dev-{role}-{email}", email=email, name=name)
    if role == "foundation":
        principal_id = await _upsert_foundation(session, info)
    else:
        principal_id = await _upsert_adopter(session, info)

    return _make_token(role, principal_id)


# --------- Helpers ---------

async def _email_exists(
    session: AsyncSession,
    model: type[Adopter] | type[Foundation] | type[Admin],
    email: str,
) -> bool:
    stmt = select(model.id).where(model.email == email)
    return (await session.scalar(stmt)) is not None


async def _get_by_email(
    session: AsyncSession,
    model: type[Adopter] | type[Foundation] | type[Admin],
    email: str,
) -> Adopter | Foundation | Admin | None:
    stmt = select(model).where(model.email == email)
    return (await session.scalars(stmt)).first()


async def _upsert_adopter(session: AsyncSession, info: GoogleUserInfo) -> int:
    user = (
        await session.scalars(select(Adopter).where(Adopter.google_id == info.sub))
    ).first()
    if user is None:
        # Si ya existe un adoptante con ese email (registrado por contraseña), enlazamos.
        user = (
            await session.scalars(select(Adopter).where(Adopter.email == info.email))
        ).first()
        if user is None:
            user = Adopter(
                email=info.email,
                full_name=info.name or info.email.split("@")[0],
                google_id=info.sub,
                avatar_url=info.picture,
            )
            session.add(user)
        else:
            user.google_id = info.sub
            if info.picture and not user.avatar_url:
                user.avatar_url = info.picture
    else:
        if info.picture and user.avatar_url != info.picture:
            user.avatar_url = info.picture

    await session.commit()
    await session.refresh(user)
    return user.id


async def _upsert_foundation(session: AsyncSession, info: GoogleUserInfo) -> int:
    foundation = (
        await session.scalars(select(Foundation).where(Foundation.google_id == info.sub))
    ).first()
    if foundation is None:
        foundation = (
            await session.scalars(select(Foundation).where(Foundation.email == info.email))
        ).first()
        if foundation is None:
            display = info.name or info.email.split("@")[0]
            foundation = Foundation(
                email=info.email,
                name=display,
                city="Sin ciudad",
                initial=display[:1].upper(),
                google_id=info.sub,
            )
            session.add(foundation)
        else:
            foundation.google_id = info.sub

    await session.commit()
    await session.refresh(foundation)
    return foundation.id
