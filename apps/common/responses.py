"""
Standard API response envelope.

Every endpoint in the project returns responses shaped by these helpers so
frontend clients can rely on one consistent contract instead of parsing
per-endpoint shapes:

Success:
{
    "success": true,
    "message": "Human readable message",
    "data": {...} | [...] | null,
    "errors": null,
    "meta": {...} | null            # pagination info, etc.
}

Error:
{
    "success": false,
    "message": "Human readable message",
    "data": null,
    "errors": {"field": ["msg"]} | "string" | null,
    "meta": null
}
"""
from rest_framework import status
from rest_framework.response import Response


class APIResponse:
    """Factory for consistently-shaped DRF Response objects."""

    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK, meta=None):
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
                "errors": None,
                "meta": meta,
            },
            status=status_code,
        )

    @staticmethod
    def created(data=None, message="Created successfully"):
        return APIResponse.success(data=data, message=message, status_code=status.HTTP_201_CREATED)

    @staticmethod
    def no_content(message="Deleted successfully"):
        return Response(
            {"success": True, "message": message, "data": None, "errors": None, "meta": None},
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def error(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        return Response(
            {
                "success": False,
                "message": message,
                "data": None,
                "errors": errors,
                "meta": None,
            },
            status=status_code,
        )

    @staticmethod
    def validation_error(errors, message="Validation failed"):
        return APIResponse.error(message=message, errors=errors, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    @staticmethod
    def not_found(message="Resource not found"):
        return APIResponse.error(message=message, status_code=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def forbidden(message="You do not have permission to perform this action"):
        return APIResponse.error(message=message, status_code=status.HTTP_403_FORBIDDEN)

    @staticmethod
    def unauthorized(message="Authentication credentials were not provided or are invalid"):
        return APIResponse.error(message=message, status_code=status.HTTP_401_UNAUTHORIZED)

    @staticmethod
    def server_error(message="An unexpected error occurred. Please try again later."):
        return APIResponse.error(message=message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
