"""
Custom JWT Authentication class supporting both HTTP Bearer headers and HTTP-Only Cookies.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class JWTCookieAuthentication(JWTAuthentication):
    """
    Custom authentication class that falls back to checking HTTP cookies
    if no Authorization header is present in the request.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token

        raw_token = request.COOKIES.get("access_token")
        if raw_token is not None:
            try:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, AuthenticationFailed):
                return None

        return None


class JWTCookieAuthenticationScheme(OpenApiAuthenticationExtension):
    """
    Tells drf-spectacular how to document JWTCookieAuthentication in OpenAPI/Swagger.
    """
    target_class = JWTCookieAuthentication
    name = "JWTCookieAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": "access_token",
            "description": "JWT access token passed via HTTP-only cookie `access_token` or `Authorization: Bearer <token>` header",
        }