import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.adopter import Adopter
    from app.models.foundation import Foundation
    from app.models.pet import Pet


class AdoptionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AdoptionRequest(Base, TimestampMixin):
    __tablename__ = "adoption_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"), index=True
    )
    adopter_id: Mapped[int] = mapped_column(
        ForeignKey("adopters.id", ondelete="CASCADE"), index=True
    )
    foundation_id: Mapped[int] = mapped_column(
        ForeignKey("foundations.id", ondelete="CASCADE"), index=True
    )

    status: Mapped[AdoptionStatus] = mapped_column(
        Enum(AdoptionStatus, name="adoption_status"),
        default=AdoptionStatus.PENDING,
        index=True,
    )
    message: Mapped[str | None] = mapped_column(String(500), default=None)

    pet: Mapped["Pet"] = relationship(back_populates="adoption_requests", lazy="joined")
    adopter: Mapped["Adopter"] = relationship(back_populates="adoption_requests", lazy="joined")
    foundation: Mapped["Foundation"] = relationship(back_populates="adoption_requests")
