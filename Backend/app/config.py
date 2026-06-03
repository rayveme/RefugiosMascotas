from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración de la app.

    Todas las credenciales se leen desde variables de entorno (o .env local).
    En despliegue (Railway, Vercel, etc.) basta con definirlas en el panel.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "RefugiosMascotas API"
    debug: bool = False
    frontend_url: str = "http://localhost:5173"

    # Lista de orígenes permitidos para CORS, separados por coma.
    # Ej: "http://localhost:5173,https://mi-app.vercel.app"
    # Si está vacío, se usa frontend_url + los hosts locales típicos de Vite.
    cors_origins: str = ""

    # Postgres async (driver para la app). Para Alembic se deriva la versión sync.
    # En local sin Docker: postgresql+asyncpg://postgres:postgres@localhost:5432/refugios
    # En Docker compose: postgresql+asyncpg://postgres:postgres@db:5432/refugios
    # En Railway: la URL la inyecta el plugin de Postgres (ver README).
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/refugios"

    jwt_secret: str = "dev-jwt-secret-change-in-prod-please-please-please"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    session_secret: str = "dev-session-secret-change-in-prod-please-please"

    # --- Google OAuth (opcional) ---
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"

    # --- Admin bootstrap ---
    # En producción define ADMIN_SECRET con un valor largo y aleatorio.
    # El endpoint POST /auth/register/admin lo exigirá cuando DEBUG=false.
    # Con DEBUG=true se omite la comprobación (uso local).
    admin_secret: str = ""

    # --- Cloudinary (opcional) ---
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_folder: str = "huella/pets"

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        """Normaliza URLs de distintos proveedores al formato asyncpg.

        - Railway: postgres:// o postgresql://
        - Neon: postgresql://...?sslmode=require  →  ?ssl=require
        - asyncpg no acepta sslmode como query param, usa ssl=require.
        """
        if not v:
            return v
        # Normalizar esquema
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://"):]
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        # Neon y otros usan sslmode=require; asyncpg necesita ssl=require
        v = v.replace("sslmode=require", "ssl=require")
        v = v.replace("sslmode=prefer", "ssl=prefer")
        return v

    @property
    def google_enabled(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret)

    @property
    def sync_database_url(self) -> str:
        """Versión síncrona de la URL para Alembic (psycopg2)."""
        return self.database_url.replace("+asyncpg", "+psycopg2")

    @property
    def cors_allowed_origins(self) -> list[str]:
        """Lista final de orígenes permitidos.

        Si `cors_origins` está definida, se respeta tal cual.
        Si no, se construye una lista local-friendly a partir de `frontend_url`.
        """
        if self.cors_origins.strip():
            return [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        return [
            self.frontend_url,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
            # Cuando Vite se expone en red (o en Docker), el origin puede verse como IP local.
            # Permitimos el origin actual observado en consola.
            "http://172.20.10.2:5174",
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
