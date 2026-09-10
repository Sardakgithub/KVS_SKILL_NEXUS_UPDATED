"""
Certificate model with unique verification code.
"""
from django.db import models
from apps.common.models import UUIDBaseModel
from apps.common.utils import generate_unique_code


class Certificate(UUIDBaseModel):
    CERTIFICATE_TYPES = [
        ("course", "Course Completion"),
        ("assessment", "Skill Assessment"),
        ("career", "Career Path Completion"),
    ]

    student = models.ForeignKey("students.StudentProfile", on_delete=models.CASCADE, related_name="certificates")
    certificate_type = models.CharField(max_length=20, choices=CERTIFICATE_TYPES, default="course")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    verification_code = models.CharField(max_length=12, unique=True, db_index=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "certificates"
        ordering = ["-issued_at"]

    def __str__(self):
        return f"Certificate ({self.verification_code}): {self.title} for {self.student}"

    def save(self, *args, **kwargs):
        if not self.verification_code:
            self.verification_code = generate_unique_code(10)
        super().save(*args, **kwargs)
