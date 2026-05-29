# syntax=docker/dockerfile:1.6
# Pin a bookworm (Debian 12 estable). `slim` sin sufijo a veces apunta a
# trixie/testing y rompe builds cuando el mirror está intermitente.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# No instalamos build-essential / libpq-dev: psycopg2-binary, asyncpg, bcrypt
# y cryptography ya traen wheels para linux/amd64 y linux/arm64.

# Capa de dependencias cacheable.
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Código.
COPY . .

# Railway/Heroku inyectan $PORT; en local docker-compose usamos 8000.
ENV PORT=8000
EXPOSE 8000

# `sh -c` para que $PORT se expanda en runtime.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
