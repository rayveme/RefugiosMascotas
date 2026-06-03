from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.adoption_request import AdoptionRequest


class Adopter(Base, TimestampMixin):
    __tablename__ = "adopters"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))

    google_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, default=None
    )
    password_hash: Mapped[str | None] = mapped_column(String(255), default=None)

    avatar_url: Mapped[str | None] = mapped_column(String(500), default=None)
    city: Mapped[str | None] = mapped_column(String(80), default=None)
    phone: Mapped[str | None] = mapped_column(String(30), default=None)

    # ── Perfil del hogar ──────────────────────────────────────────────────────
    housing_type: Mapped[str | None] = mapped_column(String(50), default=None)
    has_garden: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=None)
    has_children: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=None)
    has_other_pets: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=None)
    other_pets_desc: Mapped[str | None] = mapped_column(String(500), default=None)
    adoption_reason: Mapped[str | None] = mapped_column(Text, default=None)

    # ── Documentos (URLs seguras de Cloudinary) ───────────────────────────────
    # Identificación oficial
    id_front_url: Mapped[str | None] = mapped_column(String(500), default=None)
    id_back_url: Mapped[str | None] = mapped_column(String(500), default=None)
    # Comprobante de domicilio
    proof_address_url: Mapped[str | None] = mapped_column(String(500), default=None)
    # Fotos del hogar (hasta 4), separadas por "|"
    home_photo_urls: Mapped[str | None] = mapped_column(String(2000), default=None)
    # Firma digital (imagen PNG en Cloudinary)
    signature_url: Mapped[str | None] = mapped_column(String(500), default=None)

    adoption_requests: Mapped[list["AdoptionRequest"]] = relationship(
        back_populates="adopter",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def profile_complete(self) -> bool:
        return bool(self.full_name and self.city and self.phone)
