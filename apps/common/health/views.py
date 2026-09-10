"""
Health check endpoints for load balancers, uptime monitors, and container
orchestrators (Docker/Kubernetes liveness & readiness probes).

- /api/v1/health/live/   : process is up. No dependency checks. Used for
                            liveness probes - should basically never fail.
- /api/v1/health/ready/  : process AND its dependencies (DB, cache/Redis)
                            are reachable. Used for readiness probes /
                            uptime monitors before routing real traffic.
"""
import logging

from django.db import connections
from django.db.utils import OperationalError
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.common.responses import APIResponse

logger = logging.getLogger("kvs")


class LivenessView(APIView):
    """Basic process liveness - no external dependency checks."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        summary="Liveness probe",
        description="Returns 200 if the application process is running. Does not check dependencies.",
        responses={200: dict},
        tags=["Health"],
    )
    def get(self, request):
        return APIResponse.success(data={"status": "alive"}, message="Service is alive")


class ReadinessView(APIView):
    """Checks the application AND its critical dependencies (DB, cache)."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        summary="Readiness probe",
        description=(
            "Returns 200 only if the database and cache (Redis) are reachable. "
            "Used by load balancers/orchestrators to decide whether to route traffic."
        ),
        responses={200: dict, 503: dict},
        tags=["Health"],
    )
    def get(self, request):
        checks = {
            "database": self._check_database(),
            "cache": self._check_cache(),
        }
        all_healthy = all(check["healthy"] for check in checks.values())

        if all_healthy:
            return APIResponse.success(data={"status": "ready", "checks": checks}, message="Service is ready")

        logger.error("Readiness check failed", extra={"checks": checks})
        return APIResponse.error(
            message="Service is not ready",
            errors={"checks": checks},
            status_code=503,
        )

    @staticmethod
    def _check_database():
        try:
            conn = connections["default"]
            conn.cursor().execute("SELECT 1")
            return {"healthy": True}
        except OperationalError:
            return {"healthy": False, "detail": "Database unreachable"}
        except Exception:
            return {"healthy": False, "detail": "Database unreachable"}

    @staticmethod
    def _check_cache():
        try:
            cache.set("health_check_probe", "ok", timeout=5)
            return {"healthy": cache.get("health_check_probe") == "ok"}
        except Exception:
            return {"healthy": False, "detail": "Cache unreachable"}
