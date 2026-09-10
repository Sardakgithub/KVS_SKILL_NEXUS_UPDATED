"""
Centralized exception handling.

Wired via REST_FRAMEWORK["EXCEPTION_HANDLER"] in settings so every view in
every app gets consistent error responses for free, without repeating
try/except blocks. Unhandled exceptions are logged with full context and
returned to the client as a generic message - internals (stack traces, SQL,
exception class names) are never exposed to the client.
"""
import logging
import uuid

from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.db import DatabaseError, IntegrityError
from django.http import Http404
from rest_framework import exceptions as drf_exceptions
from rest_framework.views import exception_handler as drf_default_exception_handler

from apps.common.responses import APIResponse

logger = logging.getLogger("kvs")


class ApplicationError(Exception):
    """Base class for deliberate, business-logic-raised errors.

    Services should raise subclasses of this (or this directly) instead of
    generic exceptions so the exception handler can present a clean,
    predictable message to the client. Example:

        raise ApplicationError("Booking is no longer available for cancellation.")
    """

    def __init__(self, message, status_code=400, errors=None):
        self.message = message
        self.status_code = status_code
        self.errors = errors
        super().__init__(message)


class ResourceNotFoundError(ApplicationError):
    def __init__(self, message="Resource not found"):
        super().__init__(message, status_code=404)


class ConflictError(ApplicationError):
    """Use for state-conflict situations, e.g. double-booking, duplicate application."""

    def __init__(self, message="This action conflicts with the resource's current state"):
        super().__init__(message, status_code=409)


def _flatten_drf_validation_detail(detail):
    """DRF validation error `detail` can be a dict, list, or string - normalize it."""
    if isinstance(detail, dict):
        return detail
    if isinstance(detail, list):
        return {"non_field_errors": [str(item) for item in detail]}
    return {"detail": [str(detail)]}


def custom_exception_handler(exc, context):
    """
    Single entry point for turning any exception raised inside a DRF view
    into the project's standard error envelope (see apps.common.responses).
    """
    request = context.get("request")
    view = context.get("view")

    # --- Business/application errors raised deliberately by services ---
    if isinstance(exc, ApplicationError):
        return APIResponse.error(message=exc.message, errors=exc.errors, status_code=exc.status_code)

    # --- Let DRF build its default response first for known DRF exceptions ---
    response = drf_default_exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, drf_exceptions.ValidationError):
            return APIResponse.validation_error(errors=_flatten_drf_validation_detail(exc.detail))
        if isinstance(exc, drf_exceptions.AuthenticationFailed) or isinstance(exc, drf_exceptions.NotAuthenticated):
            return APIResponse.unauthorized(message=str(exc.detail))
        if isinstance(exc, drf_exceptions.PermissionDenied):
            return APIResponse.forbidden(message=str(exc.detail))
        if isinstance(exc, drf_exceptions.NotFound):
            return APIResponse.not_found(message=str(exc.detail))
        if isinstance(exc, drf_exceptions.Throttled):
            wait = getattr(exc, "wait", None)
            message = "Too many requests. Please try again later."
            if wait:
                message = f"Too many requests. Please try again in {int(wait)} seconds."
            return APIResponse.error(message=message, status_code=429)

        # Any other recognized DRF exception (MethodNotAllowed, etc.)
        return APIResponse.error(
            message=str(getattr(exc, "detail", exc)),
            status_code=response.status_code,
        )

    # --- Django-level exceptions DRF doesn't translate on its own ---
    if isinstance(exc, Http404):
        return APIResponse.not_found()

    if isinstance(exc, PermissionDenied):
        return APIResponse.forbidden()

    if isinstance(exc, DjangoValidationError):
        errors = exc.message_dict if hasattr(exc, "message_dict") else {"non_field_errors": exc.messages}
        return APIResponse.validation_error(errors=errors)

    if isinstance(exc, IntegrityError):
        error_id = uuid.uuid4()
        logger.error("Database integrity error [%s]", error_id, exc_info=True, extra={"view": str(view)})
        return APIResponse.error(
            message="This operation could not be completed due to a data conflict.",
            status_code=409,
        )

    if isinstance(exc, DatabaseError):
        error_id = uuid.uuid4()
        logger.error("Database error [%s]", error_id, exc_info=True, extra={"view": str(view)})
        return APIResponse.server_error()

    # --- Truly unexpected exception: log full traceback, never leak it ---
    error_id = uuid.uuid4()
    logger.error(
        "Unhandled exception [%s] on %s %s",
        error_id,
        getattr(request, "method", "?"),
        getattr(request, "path", "?"),
        exc_info=True,
        extra={"view": str(view)},
    )
    return APIResponse.server_error(
        message=f"An unexpected error occurred. Reference ID: {error_id}."
    )
