"""
Environment switch.

DJANGO_ENV in the environment / .env file selects which settings module is
active: development (default), production, or testing. This keeps a single
DJANGO_SETTINGS_MODULE=config.settings entry point for manage.py, gunicorn,
and celery, while still fully separating each environment's configuration.
"""
import os

from decouple import config

default_env = "production" if (os.environ.get("RENDER") or os.environ.get("RENDER_SERVICE_ID")) else "development"
DJANGO_ENV = config("DJANGO_ENV", default=default_env)

if DJANGO_ENV == "production":
    from .production import *  # noqa: F401,F403
elif DJANGO_ENV == "testing":
    from .testing import *  # noqa: F401,F403
else:
    from .development import *  # noqa: F401,F403

os.environ.setdefault("DJANGO_ENV_ACTIVE", DJANGO_ENV)
