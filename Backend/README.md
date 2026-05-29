# RefugiosMascotas API

API asíncrona en **FastAPI + SQLAlchemy 2.x (async)** para la app de adopción.
Maneja dos tipos de usuario:

- **Adopter** — usuario que quiere adoptar.
- **Foundation** — refugio/fundación que publica mascotas en adopción.

Dos formas de autenticarse (cualquiera de las dos para cualquier rol):

- **Email + contraseña** (registro local).
- **Google OAuth** (Authlib).

Ambas emiten un **JWT** propio con `role` (`adopter` | `foundation`).

## Stack

- FastAPI · SQLAlchemy 2.x async (`Mapped` / `mapped_column`) · Pydantic v2
- Authlib (Google OIDC) · python-jose (JWT) · bcrypt (hash de contraseñas)
- SQLite async por defecto (`aiosqlite`); cámbialo a Postgres con `postgresql+asyncpg://...`

## Estructura

```
Backend/
  app/
    main.py              # Arranque FastAPI + middlewares + lifespan (crea tablas)
    config.py            # Settings con pydantic-settings
    database.py          # Engine + sessionmaker async + dependencia get_session
    deps.py              # Auth dependencies (CurrentAdopter / CurrentFoundation)
    security.py          # Emisión / verificación JWT
    oauth.py             # Cliente OAuth Google (Authlib)
    models/              # SQLAlchemy 2.x: Adopter, Foundation, Pet
    schemas/             # Pydantic: in/out por entidad + auth
    routers/             # Endpoints: auth, adopters, foundations, pets
  requirements.txt
  .env.example
```

## Setup (con uv)

```bash
cd Backend
uv sync                          # crea .venv e instala todo desde pyproject.toml
copy .env.example .env           # editar JWT_SECRET, SESSION_SECRET, GOOGLE_*
uv run uvicorn app.main:app --reload
```

> Sin uv: `python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`.

Docs interactivos: <http://localhost:8000/docs>

### Google OAuth

1. Crea credenciales OAuth en <https://console.cloud.google.com/apis/credentials>.
2. Tipo *Web application*, redirect: `http://localhost:8000/auth/google/callback`.
3. Pega `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`.

### Login de desarrollo (sin Google)

Con `DEBUG=true`:

```bash
curl -X POST "http://localhost:8000/auth/dev-login?email=foo@test.com&role=adopter&name=Foo"
```

Devuelve un JWT que puedes usar como `Authorization: Bearer <token>`.

## Endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register/adopter` | Registro adoptante (email + password) → JWT |
| POST | `/auth/register/foundation` | Registro fundación (email + password) → JWT |
| POST | `/auth/login` | Login email/password (`{email, password, role}`) → JWT |
| GET | `/auth/google/login?role=adopter\|foundation` | Inicia OAuth Google |
| GET | `/auth/google/callback` | Callback → JWT |
| POST | `/auth/dev-login` | Login dev (solo `DEBUG=true`) |

> Si un usuario ya tenía cuenta por email/contraseña y luego entra con Google con el mismo email, el `google_id` se enlaza a esa cuenta automáticamente (no se crea duplicado).

### Adopters (requiere JWT con `role=adopter`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/adopters/me` | Perfil propio |
| PATCH | `/adopters/me` | Actualiza perfil (city, phone, full_name, avatar_url) |

### Foundations
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/foundations` | público | Lista (filtro `city`, paginación) |
| GET | `/foundations/{id}` | público | Detalle |
| GET | `/foundations/me` | foundation | Perfil propio |
| PATCH | `/foundations/me` | foundation | Edita datos del refugio |

### Pets
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/pets` | público | Lista (filtros: `type`, `city`, `urgent`, `foundation_id`, `include_adopted`) |
| GET | `/pets/{id}` | público | Detalle |
| POST | `/pets` | foundation | Crea (queda asociada al refugio autenticado) |
| PATCH | `/pets/{id}` | foundation (dueña) | Actualiza |
| DELETE | `/pets/{id}` | foundation (dueña) | Elimina |
| POST | `/pets/{id}/adopt` | adopter (perfil completo) | Marca adoptada e incrementa `foundation.adoptions` |

## Datos faltantes después de Google login

Google solo entrega `email`, `name`, `picture` (no entrega ciudad ni teléfono).
Por eso, después de un sign-in con Google los `/me` exponen un flag:

```json
{ "id": 1, "email": "...", "profile_complete": false, ... }
```

- **Adopter** se considera completo cuando tiene `full_name`, `city` y `phone`.
- **Foundation** se considera completa cuando tiene `name`, `city`, `phone` y `description`.

Endpoints que requieren completitud (server-side, devuelven `409 Conflict` si falta info):

- `POST /pets/{id}/adopt` — bloquea la adopción hasta que el adoptante haya completado su perfil.

El front debe leer `profile_complete: false` tras el login con Google y mostrar el formulario para que el usuario complete los datos vía `PATCH /adopters/me` o `PATCH /foundations/me`.

## Mapeo con los tipos del front

`src/types/index.ts` → `Pet` ↔ `PetRead` (campo `shelter` se devuelve como nombre del refugio).
`Refugio` ↔ `FoundationRead` (campo `animals` es el conteo dinámico de mascotas).

Los campos `gradientFrom` / `gradientTo` se serializan como `gradient_from` / `gradient_to` (snake_case).
Si quieres camelCase en JSON, agrega `alias_generator=to_camel` en los `ConfigDict` de los schemas.
