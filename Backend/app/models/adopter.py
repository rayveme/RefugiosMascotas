from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


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

    @property
    def profile_complete(self) -> bool:
        return bool(self.full_name and self.city and self.phone)
