"""Production settings: hardened security, error tracking, static file compression."""
from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403
from .base import SECRET_KEY, SENTRY_DSN

DEBUG = False

if SECRET_KEY.startswith("django-insecure-local-dev-only"):
    raise ImproperlyConfigured(
        "Refusing to start with the insecure default SECRET_KEY in production. "
        "Set a real SECRET_KEY via the environment."
    )

# --------------------------------------------------------------------------
# Security hardening
# --------------------------------------------------------------------------
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30  # 30 days
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --------------------------------------------------------------------------
# Cross-Origin (CORS) & CSRF Configuration
# --------------------------------------------------------------------------
FRONTEND_URL = config(
    "FRONTEND_URL",
    default="https://kvs-skill-nexus-frontend.onrender.com",
)
BACKEND_URL = config(
    "BACKEND_URL",
    default="https://kvs-backend-os33.onrender.com",
)

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default=FRONTEND_URL,
    cast=Csv(),
)

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default=f"{FRONTEND_URL},{BACKEND_URL}",
    cast=Csv(),
)

CORS_ALLOW_CREDENTIALS = True

# Required for cross-site cookie transmission (Vite frontend <-> Django backend)
SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"

# --------------------------------------------------------------------------
# Error tracking
# --------------------------------------------------------------------------
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment="production",
    )

# Static assets served via WhiteNoise; MIDDLEWARE order matters.
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")  # noqa: F405