from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select

from app.cloudinary_client import upload_document
from app.config import get_settings
from app.deps import CurrentFoundation, SessionDep
from app.models import Foundation, FoundationStatus, Pet
from app.schemas.foundation import FoundationRead, FoundationUpdate

router = APIRouter(prefix="/foundations", tags=["foundations"])
settings = get_settings()

MAX_DOC_BYTES    = 10 * 1024 * 1024
ALLOWED_IMG_MIME = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_DOC_MIME = {"image/jpeg", "image/png", "image/webp", "application/pdf"}


def _foundation_docs_folder() -> str:
    base = settings.cloudinary_folder.rsplit("/", 1)[0]
    return f"{base}/foundation-docs"


async def _upload_file(file: UploadFile, folder: str, allowed_mime: set[str]) -> str:
    if file.content_type not in allowed_mime:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Tipo de archivo no permitido: {file.content_type}. "
            f"Acepta: {', '.join(sorted(allowed_mime))}",
        )
    content = await file.read()
    if len(content) > MAX_DOC_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"Archivo muy grande (máx {MAX_DOC_BYTES // (1024 * 1024)} MB)",
        )
    result = await upload_document(content, folder=folder, filename=file.filename)
    return str(result["secure_url"])


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
    # Listado público: solo fundaciones aprobadas por el admin.
    stmt = select(Foundation).where(Foundation.status == FoundationStatus.APPROVED)
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


@router.post(
    "/me/documents",
    response_model=FoundationRead,
    summary="Sube documentos de verificación del refugio",
)
async def upload_my_documents(
    foundation: CurrentFoundation,
    session: SessionDep,
    id_front:      UploadFile | None = File(None, description="Identificación del responsable"),
    acta:          UploadFile | None = File(None, description="Acta constitutiva / Comprobante de registro"),
    proof_address: UploadFile | None = File(None, description="Comprobante de domicilio del refugio"),
    refuge_photos: list[UploadFile]  = File(default=[], description="Fotos del refugio (máx 3)"),
) -> FoundationRead:
    folder = _foundation_docs_folder()

    if id_front:
        foundation.id_front_url = await _upload_file(id_front, folder, ALLOWED_DOC_MIME)
    if acta:
        foundation.acta_url = await _upload_file(acta, folder, ALLOWED_DOC_MIME)
    if proof_address:
        foundation.proof_address_url = await _upload_file(proof_address, folder, ALLOWED_DOC_MIME)
    if refuge_photos:
        urls: list[str] = []
        for photo in refuge_photos[:3]:
            url = await _upload_file(photo, folder, ALLOWED_IMG_MIME)
            urls.append(url)
        if urls:
            foundation.refuge_photos_urls = ",".join(urls)

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
