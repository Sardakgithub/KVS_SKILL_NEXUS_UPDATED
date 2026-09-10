"""
Student profile and related models.
"""
from django.conf import settings
from django.db import models

from apps.common.models import BaseModel


class StudentProfile(BaseModel):
    """Extended student profile — one-to-one with User (role=student)."""

    EDUCATION_LEVELS = [
        ("high_school", "High School"),
        ("undergraduate", "Undergraduate"),
        ("graduate", "Graduate"),
        ("postgraduate", "Postgraduate"),
        ("phd", "PhD"),
        ("other", "Other"),
    ]

    JOB_HUNT_CHOICES = [
        ("actively_looking", "Actively Looking"),
        ("hiring", "Hiring (Recruiter / HR)"),
        ("working", "Working / Employed"),
        ("open_to_offers", "Open to Offers"),
        ("not_looking", "Not Looking"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    headline = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    location = models.CharField(max_length=150, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    date_of_birth = models.DateField(null=True, blank=True)
    education_level = models.CharField(max_length=30, choices=EDUCATION_LEVELS, blank=True, default="")
    major_or_stream = models.CharField(max_length=150, blank=True, default="")
    institution = models.CharField(max_length=255, blank=True, default="")
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    academic_score = models.CharField(max_length=50, blank=True, default="")
    job_hunt_status = models.CharField(max_length=30, choices=JOB_HUNT_CHOICES, default="actively_looking")
    notice_period = models.CharField(max_length=50, blank=True, default="Immediate")
    expected_salary = models.CharField(max_length=100, blank=True, default="")
    preferred_locations = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    career_goals = models.JSONField(default=list, blank=True)
    interests = models.JSONField(default=list, blank=True)
    languages_spoken = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    projects_highlights = models.TextField(blank=True, default="")
    achievements = models.TextField(blank=True, default="")
    projects = models.JSONField(default=list, blank=True, help_text="List of student project objects")
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    portfolio_url = models.URLField(blank=True, default="")
    twitter_url = models.URLField(blank=True, default="")
    resume_file = models.FileField(upload_to="resumes/", null=True, blank=True)

    class Meta:
        db_table = "student_profiles"
        verbose_name = "Student Profile"

    def __str__(self):
        return f"Student: {self.user.get_full_name()}"


class LearningHistory(BaseModel):
    """Tracks notable learning events (course completion, assessment, etc.)."""

    EVENT_TYPES = [
        ("course_enrolled", "Course Enrolled"),
        ("course_completed", "Course Completed"),
        ("assessment_completed", "Assessment Completed"),
        ("career_started", "Career Path Started"),
        ("milestone_reached", "Milestone Reached"),
        ("certificate_earned", "Certificate Earned"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="learning_history",
    )
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "learning_history"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event_type}: {self.title}"


class StudentSetting(BaseModel):
    """Per-student notification and privacy preferences."""

    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="settings",
    )
    email_notifications = models.BooleanField(default=True)
    booking_reminders = models.BooleanField(default=True)
    course_updates = models.BooleanField(default=True)
    job_alerts = models.BooleanField(default=True)
    profile_visibility = models.CharField(
        max_length=20,
        choices=[("public", "Public"), ("private", "Private"), ("mentors_only", "Mentors Only")],
        default="public",
    )

    class Meta:
        db_table = "student_settings"

    def __str__(self):
        return f"Settings for {self.student}"
