"""General-purpose utilities shared across apps."""
import json
import logging
import random
import string
import uuid
from datetime import datetime, timezone as dt_timezone

from django.utils import timezone


class JSONLogFormatter(logging.Formatter):
    """
    Structured JSON logs for file handlers, so logs are easy to ship to
    ELK/CloudWatch/Datadog later without a reformatting step. Deliberately
    excludes request bodies / headers / user PII - only IDs and high-level
    context are logged (see apps.common.middleware for what gets attached).
    """

    def format(self, record):
        payload = {
            "timestamp": datetime.fromtimestamp(record.created, tz=dt_timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        for key in ("request_id", "user_id", "view", "path", "method", "status_code"):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def generate_request_id() -> str:
    return uuid.uuid4().hex


def generate_unique_code(length: int = 8) -> str:
    """Alphanumeric code generator, e.g. for certificate/verification codes."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choices(alphabet, k=length))


def mask_email(email: str) -> str:
    """For logs: user@example.com -> u***@example.com. Never log raw PII."""
    try:
        local, domain = email.split("@", 1)
    except (ValueError, AttributeError):
        return "***"
    if len(local) <= 1:
        return f"{local}***@{domain}"
    return f"{local[0]}***@{domain}"


def utc_now():
    return timezone.now()
