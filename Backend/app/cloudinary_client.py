"""Wrapper sobre el SDK de Cloudinary.

Centraliza:
- Configuración (lee de Settings).
- Subida (en thread, porque el SDK es síncrono y bloquea el event loop).
- Borrado.
- Generación de URLs optimizadas (auto-format, auto-quality, crop fill 600x400).
"""

from __future__ import annotations

import asyncio
from typing import Any

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

from app.config import get_settings

_settings = get_settings()

cloudinary.config(
    cloud_name=_settings.cloudinary_cloud_name,
    api_key=_settings.cloudinary_api_key,
    api_secret=_settings.cloudinary_api_secret,
    secure=True,
)


async def upload_pet_image(content: bytes, filename: str | None = None) -> dict[str, Any]:
    """Sube `content` a Cloudinary en la carpeta de mascotas y devuelve el resultado."""

    def _do_upload() -> dict[str, Any]:
        return cloudinary.uploader.upload(
            content,
            folder=_settings.cloudinary_folder,
            resource_type="image",
            use_filename=bool(filename),
            unique_filename=True,
            overwrite=False,
            filename_override=filename,
        )

    return await asyncio.to_thread(_do_upload)


async def upload_document(
    content: bytes,
    folder: str,
    filename: str | None = None,
    resource_type: str = "auto",
) -> dict[str, Any]:
    """Sube un documento (imagen o PDF) a Cloudinary en la carpeta indicada.

    Usa `resource_type="auto"` para que Cloudinary detecte si es imagen o PDF.
    Devuelve el dict completo del resultado (incluye `secure_url` y `public_id`).
    """

    def _do_upload() -> dict[str, Any]:
        return cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type=resource_type,
            use_filename=bool(filename),
            unique_filename=True,
            overwrite=False,
            filename_override=filename,
        )

    return await asyncio.to_thread(_do_upload)


async def delete_image(public_id: str) -> None:
    def _do_delete() -> None:
        cloudinary.uploader.destroy(public_id, invalidate=True, resource_type="image")

    await asyncio.to_thread(_do_delete)


def build_image_url(
    public_id: str | None,
    *,
    width: int = 600,
    height: int = 400,
    crop: str = "fill",
    gravity: str = "auto",
) -> str | None:
    """Construye la URL optimizada para mostrar la imagen. None si no hay public_id."""
    if not public_id:
        return None
    url, _ = cloudinary_url(
        public_id,
        fetch_format="auto",
        quality="auto",
        width=width,
        height=height,
        crop=crop,
        gravity=gravity,
        secure=True,
    )
    return url
