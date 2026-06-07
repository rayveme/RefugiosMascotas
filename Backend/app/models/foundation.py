import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.adoption_request import AdoptionRequest
    from app.models.pet import Pet


class FoundationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Foundation(Base, TimestampMixin):
    __tablename__ = "foundations"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    google_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, default=None
    )
    password_hash: Mapped[str | None] = mapped_column(String(255), default=None)

    name: Mapped[str] = mapped_column(String(120), index=True)
    city: Mapped[str] = mapped_column(String(80), index=True)
    description: Mapped[str | None] = mapped_column(String(1000), default=None)
    phone: Mapped[str | None] = mapped_column(String(30), default=None)

    # ── Ubicación ─────────────────────────────────────────────────────────────
    address: Mapped[str | None] = mapped_column(String(255), default=None)
    state: Mapped[str | None] = mapped_column(String(80), default=None)
    postal_code: Mapped[str | None] = mapped_column(String(10), default=None)

    # ── Contacto adicional ────────────────────────────────────────────────────
    whatsapp: Mapped[str | None] = mapped_column(String(30), default=None)
    website: Mapped[str | None] = mapped_column(String(255), default=None)
    responsible: Mapped[str | None] = mapped_column(String(120), default=None)

    # ── Redes sociales ────────────────────────────────────────────────────────
    instagram: Mapped[str | None] = mapped_column(String(255), default=None)
    facebook: Mapped[str | None] = mapped_column(String(255), default=None)

    # ── Operación ─────────────────────────────────────────────────────────────
    schedule: Mapped[str | None] = mapped_column(String(500), default=None)      # Horario de atención
    references: Mapped[str | None] = mapped_column(String(1000), default=None)  # Referencias
    vet_name: Mapped[str | None] = mapped_column(String(120), default=None)      # Veterinario nombre
    vet_phone: Mapped[str | None] = mapped_column(String(30), default=None)      # Veterinario tel

    # ── Legal ─────────────────────────────────────────────────────────────────
    legal_id: Mapped[str | None] = mapped_column(String(50), default=None)       # RFC / Registro AC
    donation_clabe: Mapped[str | None] = mapped_column(String(20), default=None) # CLABE donaciones

    years: Mapped[int] = mapped_column(Integer, default=0)
    adoptions: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[FoundationStatus] = mapped_column(
        Enum(FoundationStatus, name="foundation_status"),
        default=FoundationStatus.PENDING,
        index=True,
    )

    initial: Mapped[str] = mapped_column(String(2), default="?")
    gradient_from: Mapped[str] = mapped_column(String(9), default="#C4813A")
    gradient_to: Mapped[str] = mapped_column(String(9), default="#E8A060")

    pets: Mapped[list["Pet"]] = relationship(
        back_populates="foundation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    adoption_requests: Mapped[list["AdoptionRequest"]] = relationship(
        back_populates="foundation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def profile_complete(self) -> bool:
        return bool(
            self.name
            and self.city
            and self.city != "Sin ciudad"
            and self.phone
            and self.description
            and self.responsible
        )
