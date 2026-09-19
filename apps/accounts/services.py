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


import random
from django.core.mail import send_mail
from apps.accounts.models import PasswordResetOTP

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

    # Send verification email asynchronously safely
    try:
        from apps.accounts.tasks import send_verification_email
        send_verification_email.delay(user.id)
    except Exception as exc:
        logger.warning("Could not enqueue verification email: %s", exc)

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


def send_password_reset_otp(email):
    """Generate 6-digit OTP and send to user's email."""
    try:
        user = User.objects.get(email__iexact=email, is_active=True)
    except User.DoesNotExist:
        raise ApplicationError("User with this email address does not exist.", status_code=404)

    # Generate 6-digit random OTP
    otp_code = f"{random.randint(100000, 999999)}"

    # Invalidate previous OTPs for this email
    PasswordResetOTP.objects.filter(email__iexact=email).delete()

    PasswordResetOTP.objects.create(
        email=user.email,
        otp=otp_code,
        is_verified=False,
    )

    # Send email
    subject = "Password Reset OTP - KVS Skill Nexus"
    message = f"Hi {user.first_name},\n\nYour OTP for resetting your password is: {otp_code}\n\nThis OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.\n\nBest regards,\nKVS Skill Nexus Team"

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        logger.error("Failed to send OTP email: %s", e)

    print(f"\n==============================================")
    print(f" [KVS SKILL NEXUS OTP] Email: {user.email}")
    print(f" OTP CODE: {otp_code}")
    print(f"==============================================\n")

    logger.info("Password Reset OTP generated for email=%s: %s", user.email, otp_code)
    return {"message": "OTP has been sent to your email address."}






def verify_password_reset_otp(email, otp):
    """Verify the 6-digit OTP code."""
    try:
        otp_obj = PasswordResetOTP.objects.filter(email__iexact=email, otp=otp).first()
        if not otp_obj:
            raise ApplicationError("Invalid OTP code. Please check and try again.", status_code=400)

        from django.utils import timezone
        import datetime
        if timezone.now() - otp_obj.created_at > datetime.timedelta(minutes=15):
            raise ApplicationError("OTP code has expired. Please request a new one.", status_code=400)

        otp_obj.is_verified = True
        otp_obj.save(update_fields=["is_verified"])
        return True
    except ApplicationError:
        raise
    except Exception:
        raise ApplicationError("Invalid or expired OTP code.", status_code=400)


def reset_password_with_otp(email=None, otp=None, token=None, new_password=None):
    """Reset password using verified OTP or legacy token."""
    if token:
        user_id = verify_password_reset_token(token)
        if not user_id:
            raise ApplicationError("Invalid or expired reset link.", status_code=400)
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ResourceNotFoundError("User not found.")
    else:
        otp_obj = PasswordResetOTP.objects.filter(email__iexact=email, otp=otp, is_verified=True).first()
        if not otp_obj:
            raise ApplicationError("Please verify your email OTP first before resetting your password.", status_code=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise ResourceNotFoundError("User not found.")

        otp_obj.delete()

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
