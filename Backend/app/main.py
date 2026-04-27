from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.config import get_settings
from app.database import engine
from app.models import Base
from app.routers import adopters, auth, foundations, pets

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(SessionMiddleware, secret_key=settings.session_secret)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,            # http://localhost:5173 (Vite dev)
        "http://127.0.0.1:5173",          # Vite resuelto por IP
        "http://localhost:4173",          # Vite preview
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(adopters.router)
app.include_router(foundations.router)
app.include_router(pets.router)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
