from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.middleware.sessions import SessionMiddleware

from app.config import get_settings
from app.database import engine
from app.models import Base
from app.routers import admin, adopters, adoptions, auth, foundations, pets

settings = get_settings()

# Columnas que deben existir pero pueden faltar en bases de datos creadas
# antes de que se escribieran sus migraciones de Alembic.
# Cada sentencia usa IF NOT EXISTS — es segura de correr en cada arranque.
_ENSURE_COLUMNS = [
    # Migración c9a8b7d6e5f4 — perfil del hogar y documentos del adoptante
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS housing_type    VARCHAR(50)",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS has_garden      BOOLEAN",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS has_children    BOOLEAN",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS has_other_pets  BOOLEAN",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS other_pets_desc VARCHAR(500)",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS adoption_reason TEXT",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS id_front_url      VARCHAR(500)",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS id_back_url       VARCHAR(500)",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS proof_address_url VARCHAR(500)",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS home_photo_urls   VARCHAR(2000)",
    "ALTER TABLE adopters ADD COLUMN IF NOT EXISTS signature_url     VARCHAR(500)",
    # Migración 68d7bc9c7887 — public_id de imágenes de mascotas
    "ALTER TABLE pets ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255)",
    # Migración d3e4f5a6b7c8 — ubicación y contacto adicional de la fundación
    "ALTER TABLE foundations ADD COLUMN IF NOT EXISTS address     VARCHAR(255)",
    "ALTER TABLE foundations ADD COLUMN IF NOT EXISTS state       VARCHAR(80)",
    "ALTER TABLE foundations ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10)",
    "ALTER TABLE foundations ADD COLUMN IF NOT EXISTS whatsapp    VARCHAR(30)",
    "ALTER TABLE foundations ADD COLUMN IF NOT EXISTS website     VARCHAR(255)",
    "ALTER TABLE foundations ADD COLUMN IF NOT EXISTS responsible VARCHAR(120)",
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        # Crea tablas nuevas que aún no existan (no toca las existentes)
        await conn.run_sync(Base.metadata.create_all)
        # Agrega columnas faltantes de forma segura (idempotente)
        for stmt in _ENSURE_COLUMNS:
            await conn.execute(text(stmt))
    yield
    await engine.dispose()


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(SessionMiddleware, secret_key=settings.session_secret)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(adopters.router)
app.include_router(foundations.router)
app.include_router(pets.router)
app.include_router(adoptions.router)
app.include_router(admin.router)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
