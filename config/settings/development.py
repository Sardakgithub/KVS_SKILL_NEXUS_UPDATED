"""Development settings: verbose errors, browsable API, debug toolbar."""
from .base import *  # noqa: F401,F403
from .base import MIDDLEWARE, REST_FRAMEWORK

DEBUG = True

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
)

# Only add debug_toolbar if it is installed (optional dev dependency)
try:
    import debug_toolbar  # noqa: F401
    INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
    MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE
except ImportError:
    pass

INTERNAL_IPS = ["127.0.0.1"]

# Relaxed CORS for local frontend development.
CORS_ALLOW_ALL_ORIGINS = True

# Emails just print to console locally unless overridden in .env.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# -------------------------------------------------------------------------
# Local development overrides — run without PostgreSQL or Redis
# -------------------------------------------------------------------------
from decouple import config  # noqa: E402

# Use SQLite by default locally; override DB_ENGINE in .env to switch back.
if config("DB_ENGINE", default="django.db.backends.sqlite3") == "django.db.backends.sqlite3":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / config("DB_NAME", default="db.sqlite3"),  # noqa: F405
        }
    }

# Use local-memory cache when Redis is not available (no redis-server required).
if config("REDIS_URL", default="") == "" or config("DJANGO_ENV", default="development") == "development":
    try:
        import redis as _r
        _r.Redis.from_url(
            config("REDIS_URL", default="redis://localhost:6379/0"),
            socket_timeout=1,
            socket_connect_timeout=1,
        ).ping()
    except Exception:
        # Redis not reachable — fall back to in-process memory cache.
        CACHES = {  # noqa: F405
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            }
        }
        # Use database sessions instead of cache sessions when Redis is unavailable.
        SESSION_ENGINE = "django.contrib.sessions.backends.db"  # noqa: F405
        SESSION_CACHE_ALIAS = "default"  # noqa: F405

# Use Celery in eager/synchronous mode (no broker needed) for local development.
CELERY_TASK_ALWAYS_EAGER = True  # noqa: F405
CELERY_TASK_EAGER_PROPAGATES = True  # noqa: F405
