"""
In-app notification model.
"""
from django.conf import settings
from django.db import models
from apps.common.models import BaseModel


class Notification(BaseModel):
    NOTIFICATION_TYPES = [
        ("registration", "Registration"),
        ("booking", "Booking Update"),
        ("mentor_approval", "Mentor Approval"),
        ("assessment", "Assessment Result"),
        ("job_status", "Job Status"),
        ("certificate", "Certificate Issued"),
        ("admin_announcement", "Admin Announcement"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default="admin_announcement")
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    link = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.user}: {self.title}"
