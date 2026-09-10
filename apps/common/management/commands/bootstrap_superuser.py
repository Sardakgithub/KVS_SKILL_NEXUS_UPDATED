"""
Idempotent superuser bootstrap for fresh environments / CI pipelines.

Reads DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD from the
environment so no credentials are ever typed interactively or committed to
source control. Safe to run on every deploy - it's a no-op if the user
already exists.

Note: relies on the custom user model landing in Module 2 (email as the
USERNAME_FIELD). Until then this command intentionally no-ops with a clear
message rather than failing, so it's safe to include in deploy scripts now.
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from decouple import config


class Command(BaseCommand):
    help = "Create a superuser from DJANGO_SUPERUSER_EMAIL/PASSWORD env vars if one doesn't already exist."

    def handle(self, *args, **options):
        email = config("DJANGO_SUPERUSER_EMAIL", default="")
        password = config("DJANGO_SUPERUSER_PASSWORD", default="")

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                "DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD not set - skipping bootstrap."
            ))
            return

        try:
            User = get_user_model()
        except Exception:
            self.stdout.write(self.style.WARNING(
                "Custom user model not available yet (arrives in Module 2) - skipping bootstrap."
            ))
            return

        username_field = User.USERNAME_FIELD
        if User.objects.filter(**{username_field: email}).exists():
            self.stdout.write(self.style.SUCCESS(f"Superuser '{email}' already exists - nothing to do."))
            return

        User.objects.create_superuser(**{username_field: email, "password": password})
        self.stdout.write(self.style.SUCCESS(f"Superuser '{email}' created."))
