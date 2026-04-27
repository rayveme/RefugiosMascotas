from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración de la app.

    Para esta corrida local todos los valores están hardcoded como defaults.
    Si más adelante quieres pasarlos por entorno, basta con definir las mismas
    variables en un .env (pydantic-settings las leerá automáticamente).
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "RefugiosMascotas API"
    debug: bool = True
    frontend_url: str = "http://localhost:5173"

    # Postgres local — driver async para la app.
    # Driver sync (psycopg2) para Alembic se deriva en `sync_database_url`.
    database_url: str = "postgresql+asyncpg://postgres:123@localhost:5432/Patitas"

    jwt_secret: str = "dev-jwt-secret-change-in-prod-please-please-please"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    session_secret: str = "dev-session-secret-change-in-prod-please-please"

    google_client_id: str = "***REMOVED***"
    google_client_secret: str = "***REMOVED***"
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"

    # --- Cloudinary (hardcoded para esta corrida local) ---
    cloudinary_cloud_name: str = "dsl5sarlu"
    cloudinary_api_key: str = "***REMOVED***"
    cloudinary_api_secret: str = "***REMOVED***"
    cloudinary_folder: str = "huella/pets"

    @property
    def google_enabled(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret)

    @property
    def sync_database_url(self) -> str:
        """Versión síncrona de la URL para Alembic (psycopg2)."""
        return self.database_url.replace("+asyncpg", "+psycopg2")


@lru_cache
def get_settings() -> Settings:
    return Settings()
