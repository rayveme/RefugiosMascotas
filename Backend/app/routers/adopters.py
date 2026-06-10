from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.cloudinary_client import upload_document
from app.config import get_settings
from app.deps import CurrentAdopter, SessionDep
from app.schemas.adopter import AdopterRead, AdopterUpdate
from app.upload_utils import DOC_MIME, IMAGE_MIME, MAX_DOC_BYTES, resolve_mime

router = APIRouter(prefix="/adopters", tags=["adopters"])
settings = get_settings()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _docs_folder() -> str:
    base = settings.cloudinary_folder.rsplit("/", 1)[0]
    return f"{base}/documents"


async def _upload_file(
    file: UploadFile,
    folder: str,
    allowed_mime: set[str],
) -> str:
    content, _mime = await resolve_mime(file, allowed_mime)
    if len(content) > MAX_DOC_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"Archivo demasiado grande (máx {MAX_DOC_BYTES // (1024 * 1024)} MB)",
        )
    result = await upload_document(content, folder=folder, filename=file.filename)
    return str(result["secure_url"])


# ── Rutas ──────────────────────────────────────────────────────────────────────

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


@router.post(
    "/me/documents",
    response_model=AdopterRead,
    summary="Sube documentos y datos del perfil del hogar del adoptante",
)
async def upload_my_documents(
    adopter: CurrentAdopter,
    session: SessionDep,
    # ── Archivos ────────────────────────────────────────────────────────────
    id_front:      UploadFile | None = File(None, description="Frente de la identificación"),
    id_back:       UploadFile | None = File(None, description="Reverso de la identificación"),
    proof_address: UploadFile | None = File(None, description="Comprobante de domicilio"),
    home_photos:   list[UploadFile] = File(default=[], description="Fotos del hogar (máx 4)"),
    signature:     UploadFile | None = File(None, description="Firma digital (PNG)"),
    # ── Perfil del hogar (campos de texto) ─────────────────────────────────
    housing_type:    str | None = Form(None),
    has_garden:      str | None = Form(None),   # "true" / "false"
    has_children:    str | None = Form(None),
    has_other_pets:  str | None = Form(None),
    other_pets_desc: str | None = Form(None),
    adoption_reason: str | None = Form(None),
) -> AdopterRead:
    folder = _docs_folder()

    # ── Perfil del hogar (texto) — se guarda aunque el upload de archivos falle ──
    if housing_type is not None:
        adopter.housing_type = housing_type or None
    if has_garden is not None:
        adopter.has_garden = has_garden.lower() == "true"
    if has_children is not None:
        adopter.has_children = has_children.lower() == "true"
    if has_other_pets is not None:
        adopter.has_other_pets = has_other_pets.lower() == "true"
    if other_pets_desc is not None:
        adopter.other_pets_desc = other_pets_desc or None
    if adoption_reason is not None:
        adopter.adoption_reason = adoption_reason or None

    # Commit inmediato del perfil textual: esto persiste aunque los uploads fallen
    await session.commit()

    # ── Documentos (archivos → Cloudinary) ─────────────────────────────────────
    # Cada upload se intenta de forma independiente; un fallo no revierte los demás.
    if id_front and id_front.filename:
        try:
            adopter.id_front_url = await _upload_file(id_front, folder, DOC_MIME)
        except Exception:
            pass

    if id_back and id_back.filename:
        try:
            adopter.id_back_url = await _upload_file(id_back, folder, DOC_MIME)
        except Exception:
            pass

    if proof_address and proof_address.filename:
        try:
            adopter.proof_address_url = await _upload_file(proof_address, folder, DOC_MIME)
        except Exception:
            pass

    if home_photos:
        urls: list[str] = []
        for photo in home_photos[:4]:
            if photo.filename:
                try:
                    url = await _upload_file(photo, folder, IMAGE_MIME)
                    urls.append(url)
                except Exception:
                    pass
        if urls:
            adopter.home_photo_urls = "|".join(urls)

    if signature and signature.filename:
        try:
            adopter.signature_url = await _upload_file(signature, folder, IMAGE_MIME)
        except Exception:
            pass

    # Segundo commit: sólo si algo cambió (los atributos URL)
    await session.commit()
    await session.refresh(adopter)
    return AdopterRead.model_validate(adopter)
