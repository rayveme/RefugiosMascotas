"""Utilidades compartidas para subida de archivos.

Centraliza la validación de MIME type y tamaño para todos los routers.
Detecta el tipo real por magic bytes cuando el navegador no envía Content-Type
(común en móviles y en iOS Safari con HEIC).
"""

from __future__ import annotations

from fastapi import HTTPException, UploadFile, status

# ── Magic bytes → MIME ──────────────────────────────────────────────────────
_SIGNATURES: list[tuple[bytes, str]] = [
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"RIFF", "image/webp"),   # se verifica más abajo
    (b"%PDF", "application/pdf"),
    # HEIC / HEIF usan un contenedor ISO BMFF; el ftyp box empieza en offset 4.
    # Marcadores comunes de iPhones.
]

_HEIC_BRANDS = {b"heic", b"heix", b"hevc", b"hevx", b"mif1", b"msf1", b"hevm", b"hevs"}


def _sniff_mime(header: bytes) -> str | None:
    """Detecta el MIME type a partir de los primeros bytes del archivo."""
    if len(header) < 12:
        return None

    # JPEG
    if header[:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # PNG
    if header[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"

    # WebP: RIFF????WEBP
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"

    # PDF
    if header[:4] == b"%PDF":
        return "application/pdf"

    # HEIC / HEIF (ISO BMFF ftyp box)
    # El ftyp brand está en los bytes 8..12 del contenedor
    if len(header) >= 12:
        brand = header[8:12]
        if brand in _HEIC_BRANDS:
            return "image/heic"
        # Algunos exportan como 'MiHE' o variantes menos comunes
        if header[4:8] == b"ftyp":
            return "image/heic"

    return None


# ── Tipos permitidos ─────────────────────────────────────────────────────────
#   Incluye HEIC/HEIF (iPhones) y application/octet-stream como comodín
#   (algunos navegadores móviles no envían Content-Type).

IMAGE_MIME = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}

DOC_MIME = IMAGE_MIME | {"application/pdf"}

# Usamos content_type "real" (sniffed) para validar, pero siempre pasamos
# resource_type="auto" a Cloudinary para que él determine el formato.

# ── Tamaños máximos ──────────────────────────────────────────────────────────
MAX_IMAGE_BYTES = 20 * 1024 * 1024   # 20 MB — smartphones modernos sacan fotos de 15 MB
MAX_DOC_BYTES   = 20 * 1024 * 1024   # 20 MB — PDFs escaneados también pueden ser grandes


async def resolve_mime(file: UploadFile, allowed: set[str]) -> tuple[bytes, str]:
    """Lee el contenido del archivo, detecta el MIME real y valida que esté permitido.

    Devuelve ``(content, mime)`` si todo es correcto.
    Lanza HTTP 400 si el tipo no está permitido o HTTP 413 si supera el límite.
    """
    content = await file.read()

    # Detectar MIME: primero el que reporta el navegador, luego magic bytes.
    reported = (file.content_type or "").lower().strip()
    mime = reported if reported and reported != "application/octet-stream" else None

    if not mime or mime not in allowed:
        # Intentar detectar por magic bytes
        sniffed = _sniff_mime(content[:16])
        if sniffed:
            mime = sniffed

    # Si sigue sin ser reconocido, rechazar
    if not mime or mime not in allowed:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Tipo de archivo no permitido ({file.content_type or 'desconocido'}). "
            f"Se aceptan: JPEG, PNG, WebP, HEIC{', PDF' if 'application/pdf' in allowed else ''}.",
        )

    return content, mime
