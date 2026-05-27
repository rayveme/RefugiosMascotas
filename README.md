# RefugiosMascotas

Monorepo con:

- **Backend** — FastAPI + SQLAlchemy async + PostgreSQL ([Backend/](Backend/))
- **Frontend** — React + Vite + TypeScript ([RefugiosMascotas/](RefugiosMascotas/))

---

## 1. Correr todo en local con Docker (recomendado)

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# 1. Clona el repo
git clone <repo-url>
cd RefugiosMascotas

# 2. Copia los env de ejemplo
cp .env.example .env
cp Backend/.env.example Backend/.env
cp RefugiosMascotas/.env.example RefugiosMascotas/.env

# 3. Levanta todo (Postgres 17 + Backend + Frontend)
docker compose up --build
```

Servicios:

| Servicio  | URL                              | Notas                                |
|-----------|----------------------------------|--------------------------------------|
| Frontend  | http://localhost:5173            | Vite con HMR                         |
| Backend   | http://localhost:8000            | FastAPI; docs en `/docs`             |
| Postgres  | localhost:5432                   | user/pass/db = `postgres/postgres/refugios` |

Para parar: `docker compose down` (los datos quedan en el volumen `pgdata`).
Para borrar también la base de datos: `docker compose down -v`.

> Las migraciones/creación de tablas se ejecutan automáticamente al arrancar el backend (lifespan en [Backend/app/main.py](Backend/app/main.py)).

---

## 2. Correr en local sin Docker

### Backend

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
cp .env.example .env              # editar DATABASE_URL si hace falta
uvicorn app.main:app --reload
```

Necesitas una instancia de Postgres corriendo. Lo más fácil es solo levantar la DB con compose:

```bash
docker compose up db
```

### Frontend

```bash
cd RefugiosMascotas
npm install
cp .env.example .env              # VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 3. Despliegue

### Backend → Railway

1. En Railway, crea un proyecto nuevo y **añade el plugin de PostgreSQL**.
2. Conecta este repo y selecciona el subdirectorio `Backend/` como root del servicio.
3. Railway detecta el `Dockerfile` (y el `railway.json` con el `startCommand` y healthcheck a `/health`).
4. En **Variables** del servicio, define al menos:
   - `DATABASE_URL` → referencia la variable del plugin de Postgres (`${{Postgres.DATABASE_URL}}`). El backend normaliza `postgres://` → `postgresql+asyncpg://` automáticamente.
   - `JWT_SECRET` y `SESSION_SECRET` → strings largos aleatorios.
   - `FRONTEND_URL` → la URL pública de Vercel (ej. `https://mi-app.vercel.app`).
   - `CORS_ORIGINS` → mismo valor que `FRONTEND_URL` (o lista coma-separada si hay más dominios).
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (si usas login con Google; el redirect debe apuntar al dominio público del backend).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (si subes imágenes).
5. Railway expone el puerto vía `$PORT`; el `Dockerfile` ya lo respeta.

### Frontend → Vercel

1. En Vercel, importa el repo y selecciona el subdirectorio `RefugiosMascotas/` como root del proyecto.
2. Framework preset: **Vite** (el `vercel.json` ya lo declara junto con el SPA rewrite).
3. En **Environment Variables**, define:
   - `VITE_API_URL` → la URL pública del backend en Railway (ej. `https://refugios-backend.up.railway.app`).
4. Deploy. Vercel corre `npm run build` y publica `dist/`.

> Tras el primer deploy, copia el dominio de Vercel y mételo en `FRONTEND_URL` / `CORS_ORIGINS` del backend en Railway, y redeploy del backend.

---

## 4. Estructura

```
RefugiosMascotas/
├── docker-compose.yml          # Postgres 17 + backend + frontend
├── .env.example                # variables para compose
├── Backend/
│   ├── Dockerfile
│   ├── railway.json            # config de Railway
│   ├── Procfile                # fallback estilo Heroku
│   ├── .env.example
│   └── app/                    # FastAPI
└── RefugiosMascotas/
    ├── Dockerfile              # solo para dev local en compose
    ├── vercel.json             # config de Vercel
    ├── .env.example
    └── src/                    # React + Vite
```
