"""
Celery tasks for asynchronous email sending.
"""
import logging

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

from apps.accounts.tokens import generate_email_verification_token, generate_password_reset_token

User = get_user_model()
logger = logging.getLogger("kvs")


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email(self, user_id):
    """Send email verification link to the user."""
    try:
        user = User.objects.get(id=user_id)
        token = generate_email_verification_token(user.id)
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

        send_mail(
            subject="Verify your email — KVS Skill Nexus",
            message=(
                f"Hi {user.first_name},\n\n"
                f"Welcome to KVS Skill Nexus! Please verify your email by clicking the link below:\n\n"
                f"{verification_url}\n\n"
                f"This link expires in 24 hours.\n\n"
                f"Best regards,\nKVS Skill Nexus Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info("Verification email sent to user id=%s", user_id)
    except User.DoesNotExist:
        logger.error("User not found for verification email: id=%s", user_id)
    except Exception as exc:
        logger.error("Failed to send verification email to user id=%s: %s", user_id, exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, user_id):
    """Send password reset link to the user."""
    try:
        user = User.objects.get(id=user_id)
        token = generate_password_reset_token(user.id)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        send_mail(
            subject="Reset your password — KVS Skill Nexus",
            message=(
                f"Hi {user.first_name},\n\n"
                f"We received a request to reset your password. Click the link below:\n\n"
                f"{reset_url}\n\n"
                f"This link expires in 1 hour. If you didn't request this, ignore this email.\n\n"
                f"Best regards,\nKVS Skill Nexus Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info("Password reset email sent to user id=%s", user_id)
    except User.DoesNotExist:
        logger.error("User not found for password reset email: id=%s", user_id)
    except Exception as exc:
        logger.error("Failed to send password reset email to user id=%s: %s", user_id, exc)
        raise self.retry(exc=exc)
