"""
Request logging middleware.

Attaches a request ID to every request (also echoed back in the response
header `X-Request-ID` so it can be correlated with frontend error reports),
and logs method/path/status/duration for every request at INFO level.
Nothing about the request body, query params, or headers is logged - only
metadata - to avoid leaking sensitive user information into log files.
"""
import logging
import time

from apps.common.utils import generate_request_id

logger = logging.getLogger("kvs")

SENSITIVE_PATHS_NOT_LOGGED_VERBOSELY = ("/api/v1/auth/",)


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = generate_request_id()
        start_time = time.monotonic()

        response = self.get_response(request)

        duration_ms = round((time.monotonic() - start_time) * 1000, 2)
        response["X-Request-ID"] = request.request_id

        user_id = getattr(getattr(request, "user", None), "id", None)
        logger.info(
            "%s %s -> %s (%sms)",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
            extra={
                "request_id": request.request_id,
                "user_id": user_id,
                "path": request.path,
                "method": request.method,
                "status_code": response.status_code,
            },
        )
        return response
