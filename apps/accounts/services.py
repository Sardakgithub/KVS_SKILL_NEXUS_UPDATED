"""
Business logic for accounts. Views delegate here — they never contain
business logic directly (project convention from Module 1).
"""
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from apps.accounts.tokens import (
    generate_email_verification_token,
    generate_password_reset_token,
    verify_email_token,
    verify_password_reset_token,
)
from apps.common.exceptions import ApplicationError, ConflictError, ResourceNotFoundError

User = get_user_model()
logger = logging.getLogger("kvs")
security_logger = logging.getLogger("kvs.security")


def register_user(validated_data):
    """Create a new user account and trigger verification email."""
    with transaction.atomic():
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=validated_data.get("role", "student"),
        )

    # Send verification email asynchronously
    from apps.accounts.tasks import send_verification_email
    send_verification_email.delay(user.id)

    security_logger.info("User registered: id=%s role=%s", user.id, user.role)
    return user


def login_user(email, password):
    """Authenticate user and return JWT token pair."""
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        raise ApplicationError("Invalid email or password.", status_code=401)

    if not user.check_password(password):
        security_logger.warning("Failed login attempt for email=%s", email)
        raise ApplicationError("Invalid email or password.", status_code=401)

    if not user.is_active:
        raise ApplicationError("Your account has been deactivated. Please contact support.", status_code=403)

    refresh = RefreshToken.for_user(user)
    security_logger.info("User logged in: id=%s", user.id)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "is_email_verified": user.is_email_verified,
            "avatar": user.avatar.url if user.avatar else None,
        },
    }


def logout_user(refresh_token):
    """Blacklist the refresh token to invalidate the session."""
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        security_logger.info("User logged out (token blacklisted)")
    except Exception:
        raise ApplicationError("Invalid or expired token.", status_code=400)


def verify_email(token):
    """Verify a user's email address using the signed token."""
    user_id = verify_email_token(token)
    if not user_id:
        raise ApplicationError("Invalid or expired verification link.", status_code=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ResourceNotFoundError("User not found.")

    if user.is_email_verified:
        raise ConflictError("Email is already verified.")

    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])
    security_logger.info("Email verified for user id=%s", user.id)
    return user


def forgot_password(email):
    """Send password reset email if the user exists. Always returns success
    to prevent email enumeration."""
    try:
        user = User.objects.get(email__iexact=email, is_active=True)
        from apps.accounts.tasks import send_password_reset_email
        send_password_reset_email.delay(user.id)
        security_logger.info("Password reset requested for user id=%s", user.id)
    except User.DoesNotExist:
        # Don't reveal whether the email exists
        pass


def reset_password(token, new_password):
    """Reset user password using the signed token."""
    user_id = verify_password_reset_token(token)
    if not user_id:
        raise ApplicationError("Invalid or expired reset link.", status_code=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ResourceNotFoundError("User not found.")

    user.set_password(new_password)
    user.save(update_fields=["password"])
    security_logger.info("Password reset for user id=%s", user.id)
    return user


def change_password(user, old_password, new_password):
    """Change password for the authenticated user."""
    if not user.check_password(old_password):
        raise ApplicationError("Current password is incorrect.", status_code=400)
    user.set_password(new_password)
    user.save(update_fields=["password"])
    security_logger.info("Password changed for user id=%s", user.id)


def update_profile(user, validated_data):
    """Update user profile fields."""
    for field, value in validated_data.items():
        setattr(user, field, value)
    user.save(update_fields=list(validated_data.keys()))
    logger.info("Profile updated for user id=%s", user.id)
    return user
