# KVS Skill Nexus — Backend

AI-powered career development platform backend. Django + DRF + PostgreSQL +
Redis + Celery, built module by module per the project specification. This
file is the **living backend specification** — updated as each module lands
with every endpoint, its purpose, permissions, and business rules.

## Stack

- Python 3.12, Django 5.0, Django REST Framework 3.15
- PostgreSQL (via psycopg 3)
- Redis (cache + Celery broker/result backend)
- Celery + django-celery-beat (scheduled/background jobs)
- SimpleJWT (access + refresh token auth)
- drf-spectacular (OpenAPI 3 schema, Swagger UI, ReDoc)
- Docker / docker-compose for local + production parity

## Project layout

```
kvs_skill_nexus/
├── config/                  # Project-level config, not business logic
│   ├── settings/
│   │   ├── base.py          # Shared settings
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py              # Root URL conf, /api/v1/ namespace + schema/docs
│   ├── celery.py
│   ├── wsgi.py / asgi.py
├── apps/
│   ├── common/               # Shared foundation (Module 1) — no business models
│   │   ├── models.py         # BaseModel / UUIDBaseModel / soft delete
│   │   ├── responses.py      # APIResponse — standard success/error envelope
│   │   ├── exceptions.py     # Centralized DRF exception handler
│   │   ├── pagination.py
│   │   ├── permissions.py    # Role-based + ownership permission classes
│   │   ├── mixins.py         # View/viewset mixins (thin views, services do the work)
│   │   ├── middleware.py     # Request ID + structured request logging
│   │   ├── utils.py          # JSON log formatter, misc helpers
│   │   └── health/           # Liveness/readiness endpoints
│   ├── accounts/              # Module 2 (not yet implemented)
│   ├── students/              # Module 3
│   ├── mentors/                # Module 4
│   ├── careers/                 # Module 5
│   ├── courses/                  # Module 6
│   ├── assessments/               # Module 7
│   ├── resumes/                     # Module 8
│   ├── jobs/                          # Module 9
│   ├── certificates/                   # Module 10
│   ├── notifications/                    # Module 11
│   ├── admin_panel/                       # Module 12
│   └── analytics/                          # Module 13
├── requirements/
│   ├── base.txt / development.txt / production.txt / testing.txt
├── docker-compose.yml
├── Dockerfile
└── manage.py
```

Every future app follows the same internal shape: `models.py`,
`serializers.py`, `services.py` (business logic — never in views),
`permissions.py`, `views.py`, `urls.py`, `tests/`.

## Getting started (local, Docker)

```bash
cp .env.example .env        # fill in real values
docker compose up --build
```

This starts PostgreSQL, Redis, the Django app (`runserver`), a Celery
worker, and Celery beat. On boot the entrypoint waits for the database,
runs migrations, and collects static files.

- API base: `http://localhost:8000/api/v1/`
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI schema (JSON): `http://localhost:8000/api/schema/`
- Django admin: `http://localhost:8000/admin/`

## Getting started (local, without Docker)

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements/development.txt
cp .env.example .env         # point DB_HOST/REDIS_URL at local services
python manage.py migrate
python manage.py runserver
```

Requires a locally running PostgreSQL and Redis matching your `.env`.

## Running tests

```bash
pytest
```

Uses `config/settings/testing.py` automatically (forced via `conftest.py`):
MD5 password hashing for speed, eager Celery execution, in-memory cache, and
an isolated test database. Coverage reports to the terminal by default
(`pytest.ini`).

## Environments

Selected via the `DJANGO_ENV` env var (`development` default, `production`,
`testing`) — see `config/settings/__init__.py`. All three share
`config/settings/base.py` and only override what genuinely differs
(security headers, debug tooling, password hashers, etc.), so behavior
never silently diverges between environments beyond documented overrides.

## Conventions established in Module 1 (apply to every future module)

- **Views are thin.** Views/viewsets only validate input via a serializer
  and call a `services.py` function; they never contain business logic.
- **Standard response envelope.** Every endpoint returns responses built
  with `apps.common.responses.APIResponse` — `{success, message, data,
  errors, meta}` — via `APIResponseMixin` on viewsets, or directly in
  function/class-based views. See `apps/common/responses.py`.
- **Centralized exceptions.** Raise `apps.common.exceptions.ApplicationError`
  (or subclasses `ResourceNotFoundError`, `ConflictError`) from services for
  expected business-rule failures. Anything unexpected is caught by
  `custom_exception_handler`, logged with a reference ID, and never leaks
  internals to the client.
- **Base models.** Every domain model inherits `apps.common.models.BaseModel`
  (int PK, timestamps, `is_active`, soft delete) or `UUIDBaseModel` (same,
  UUID PK) for anything exposed in public URLs.
- **Permissions.** Role checks assume `request.user.role` on the custom
  user model landing in Module 2. `apps.common.permissions` ships
  `IsStudent`, `IsMentor`, `IsAdmin`, `IsMentorOrAdmin`,
  `ReadOnlyOrIsAdmin` (catalog resources: browse = any authenticated user,
  write = admin only), and object-level `IsOwner` / `IsOwnerOrReadOnly`.
  New roles (Recruiter, Company, College, Super Admin) extend `Roles`
  choices on the user model with zero changes needed here.
- **Pagination.** `StandardResultsPagination` (20/page, max 100) is the DRF
  default for every list endpoint; response meta includes page/count/links.
- **Logging.** Structured JSON logs to `logs/app.log`, `logs/error.log`,
  `logs/security.log` (rotated, 10MB/5 backups). Only IDs/metadata are
  logged — never request bodies, passwords, or tokens. Every request gets a
  correlation `X-Request-ID` header via `RequestLoggingMiddleware`.
- **Docs.** Every endpoint should carry a `drf_spectacular.utils.extend_schema`
  (or docstring, picked up automatically) with a summary, description, and
  a `tags` entry per module, so Swagger/ReDoc stay organized as modules land.

## Endpoint reference

### Module 1 — Foundation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health/live/` | None | Liveness probe — process is up. |
| GET | `/api/v1/health/ready/` | None | Readiness probe — checks DB + Redis connectivity. |
| GET | `/api/schema/` | None | Raw OpenAPI 3 schema (JSON). |
| GET | `/api/docs/` | None | Swagger UI. |
| GET | `/api/redoc/` | None | ReDoc UI. |
| * | `/admin/` | Django staff | Django admin site. |

No domain models ship in Module 1 — `apps.common` is infrastructure only
(base models, response envelope, exception handling, permissions,
pagination, logging, health checks). `AUTH_USER_MODEL` is pre-wired to
`accounts.User` (commented out until Module 2 creates that app) so no
settings churn is needed when auth lands.

---
_Next: Module 2 — Authentication & User Management (custom user model,
JWT login/refresh/logout, registration, email verification, password
reset, role permissions, profile APIs)._
