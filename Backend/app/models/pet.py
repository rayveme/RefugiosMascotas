import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.foundation import Foundation


class PetType(str, enum.Enum):
    PERRO = "Perro"
    GATO = "Gato"


class Pet(Base, TimestampMixin):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), index=True)
    type: Mapped[PetType] = mapped_column(Enum(PetType, name="pet_type"))
    breed: Mapped[str] = mapped_column(String(120))
    age: Mapped[str] = mapped_column(String(40))
    city: Mapped[str] = mapped_column(String(80), index=True)

    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    vaccinated: Mapped[bool] = mapped_column(Boolean, default=False)
    sterilized: Mapped[bool] = mapped_column(Boolean, default=False)
    is_adopted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    gradient_from: Mapped[str] = mapped_column(String(9), default="#C4813A")
    gradient_to: Mapped[str] = mapped_column(String(9), default="#E8A060")

    image_public_id: Mapped[str | None] = mapped_column(String(255), default=None)

    foundation_id: Mapped[int] = mapped_column(
        ForeignKey("foundations.id", ondelete="CASCADE"), index=True
    )
    foundation: Mapped["Foundation"] = relationship(back_populates="pets", lazy="joined")

    adopter_id: Mapped[int | None] = mapped_column(
        ForeignKey("adopters.id", ondelete="SET NULL"), default=None, index=True
    )
