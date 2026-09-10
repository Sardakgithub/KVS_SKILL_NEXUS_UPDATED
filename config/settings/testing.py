"""Testing settings: fast password hashing, synchronous celery, in-memory cache."""
from .base import *  # noqa: F401,F403

DEBUG = False

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

LOGGING["handlers"]["console"]["level"] = "CRITICAL"  # noqa: F405
