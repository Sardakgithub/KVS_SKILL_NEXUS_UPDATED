"""
Views for accounts app. Thin views — all business logic is in services.py.
"""
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts import services
from apps.accounts.serializers import (
    ChangePasswordSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
)
from apps.common.responses import APIResponse


def set_auth_cookies(response, access_token, refresh_token=None, user_role=None):
    """
    Set HTTP-Only cookies for access and refresh tokens, and readable cookie for user role.
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=15 * 60,
        httponly=True,
        samesite="Lax",
        secure=not settings.DEBUG,
        path="/",
    )
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=7 * 24 * 3600,
            httponly=True,
            samesite="Lax",
            secure=not settings.DEBUG,
            path="/",
        )
    if user_role:
        response.set_cookie(
            key="user_role",
            value=user_role,
            max_age=7 * 24 * 3600,
            httponly=False,
            samesite="Lax",
            secure=not settings.DEBUG,
            path="/",
        )
    return response


def clear_auth_cookies(response):
    """
    Remove HTTP cookies on logout or session clear.
    """
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("user_role", path="/")
    return response


@extend_schema(tags=["Authentication"])
class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        summary="Register a new user",
        request=RegisterSerializer,
        responses={201: OpenApiResponse(description="User registered successfully")},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = services.register_user(serializer.validated_data)
        return APIResponse.created(
            data=UserSerializer(user).data,
            message="Registration successful. Please check your email to verify your account.",
        )


@extend_schema(tags=["Authentication"])
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        summary="Login with email and password",
        request=LoginSerializer,
        responses={200: OpenApiResponse(description="Login successful with JWT tokens")},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = services.login_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        response = APIResponse.success(data=tokens, message="Login successful.")
        access_token = tokens.get("access")
        refresh_token = tokens.get("refresh")
        user_data = tokens.get("user", {})
        user_role = user_data.get("role") if isinstance(user_data, dict) else None

        return set_auth_cookies(response, access_token, refresh_token, user_role)


@extend_schema(tags=["Authentication"])
class LogoutView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Logout (blacklist refresh token & clear cookies)")
    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                services.logout_user(refresh_token)
            except Exception:
                pass
        response = APIResponse.success(message="Logged out successfully.")
        return clear_auth_cookies(response)


@extend_schema(tags=["Authentication"])
class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Refresh access token using refresh token cookie or payload")
    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh_token")
        if not refresh_token:
            response = APIResponse.error(message="Refresh token is required.", status_code=400)
            return clear_auth_cookies(response)

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
            new_refresh = None
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
                refresh.set_jti()
                refresh.set_exp()
                new_refresh = str(refresh)

            response = APIResponse.success(
                data={"access": new_access, "refresh": new_refresh or refresh_token},
                message="Token refreshed successfully.",
            )
            return set_auth_cookies(response, new_access, new_refresh)
        except TokenError as e:
            response = APIResponse.error(
                message=f"Invalid or expired refresh token: {str(e)}", status_code=401
            )
            return clear_auth_cookies(response)


@extend_schema(tags=["Authentication"])
class EmailVerifyView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Verify email address", request=EmailVerificationSerializer)
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.verify_email(serializer.validated_data["token"])
        return APIResponse.success(message="Email verified successfully.")


@extend_schema(tags=["Authentication"])
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "password_reset"

    @extend_schema(summary="Request password reset email", request=ForgotPasswordSerializer)
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.forgot_password(serializer.validated_data["email"])
        return APIResponse.success(
            message="If an account with that email exists, a reset link has been sent."
        )


@extend_schema(tags=["Authentication"])
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "password_reset"

    @extend_schema(summary="Reset password with token", request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.reset_password(
            token=serializer.validated_data["token"],
            new_password=serializer.validated_data["new_password"],
        )
        return APIResponse.success(message="Password has been reset successfully.")


@extend_schema(tags=["User Profile"])
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get current user profile", responses={200: UserSerializer})
    def get(self, request):
        return APIResponse.success(data=UserSerializer(request.user).data)

    @extend_schema(summary="Update current user profile", request=UserProfileUpdateSerializer)
    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = services.update_profile(request.user, serializer.validated_data)
        return APIResponse.success(
            data=UserSerializer(user).data,
            message="Profile updated successfully.",
        )


@extend_schema(tags=["User Profile"])
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Change password", request=ChangePasswordSerializer)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )
        return APIResponse.success(message="Password changed successfully.")
