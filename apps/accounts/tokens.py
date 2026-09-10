"""
Token generators for email verification and password reset.

Uses Django's signing framework (HMAC-based, time-limited) instead of
storing tokens in the database — stateless, no cleanup needed.
"""
import logging
from django.core import signing

logger = logging.getLogger("kvs")

EMAIL_VERIFY_SALT = "email-verification"
PASSWORD_RESET_SALT = "password-reset"
EMAIL_VERIFY_MAX_AGE = 60 * 60 * 24  # 24 hours
PASSWORD_RESET_MAX_AGE = 60 * 60  # 1 hour


def generate_email_verification_token(user_id):
    return signing.dumps({"user_id": user_id, "purpose": "email_verify"}, salt=EMAIL_VERIFY_SALT)


def verify_email_token(token):
    try:
        data = signing.loads(token, salt=EMAIL_VERIFY_SALT, max_age=EMAIL_VERIFY_MAX_AGE)
        return data.get("user_id")
    except signing.BadSignature:
        logger.warning("Invalid email verification token attempted")
        return None


def generate_password_reset_token(user_id):
    return signing.dumps({"user_id": user_id, "purpose": "password_reset"}, salt=PASSWORD_RESET_SALT)


def verify_password_reset_token(token):
    try:
        data = signing.loads(token, salt=PASSWORD_RESET_SALT, max_age=PASSWORD_RESET_MAX_AGE)
        return data.get("user_id")
    except signing.BadSignature:
        logger.warning("Invalid password reset token attempted")
        return None
