"""
Mentor profile, availability, booking, and review models.
"""
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import BaseModel


class MentorProfile(BaseModel):
    """Extended mentor profile — one-to-one with User (role=mentor)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mentor_profile",
    )
    expertise = models.JSONField(default=list, blank=True, help_text="List of expertise areas")
    specializations = models.JSONField(default=list, blank=True, help_text="Specific session focus areas")
    bio = models.TextField(blank=True, default="")
    education = models.CharField(max_length=255, blank=True, default="")
    company = models.CharField(max_length=255, blank=True, default="")
    job_title = models.CharField(max_length=255, blank=True, default="")
    years_experience = models.PositiveIntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    session_duration = models.PositiveIntegerField(default=45, help_text="Session duration in minutes")
    languages_spoken = models.JSONField(default=list, blank=True)
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    twitter_url = models.URLField(blank=True, default="")
    website_url = models.URLField(blank=True, default="")
    is_approved = models.BooleanField(default=False, db_index=True)
    is_available = models.BooleanField(default=True)
    total_sessions = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "mentor_profiles"
        ordering = ["-average_rating", "-total_sessions"]

    def __str__(self):
        return f"Mentor: {self.user.get_full_name()}"

    def update_rating(self):
        """Recalculate average rating from reviews."""
        reviews = self.reviews.all()
        if reviews.exists():
            from django.db.models import Avg
            avg = reviews.aggregate(avg=Avg("rating"))["avg"]
            self.average_rating = round(avg, 2)
            self.total_reviews = reviews.count()
            self.save(update_fields=["average_rating", "total_reviews"])


class MentorAvailability(BaseModel):
    """Recurring weekly availability slots for a mentor."""

    DAY_CHOICES = [
        (0, "Monday"), (1, "Tuesday"), (2, "Wednesday"),
        (3, "Thursday"), (4, "Friday"), (5, "Saturday"), (6, "Sunday"),
    ]

    mentor = models.ForeignKey(
        MentorProfile,
        on_delete=models.CASCADE,
        related_name="availability_slots",
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = "mentor_availability"
        ordering = ["day_of_week", "start_time"]
        unique_together = ["mentor", "day_of_week", "start_time", "end_time"]

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time}–{self.end_time}"


class Booking(BaseModel):
    """Mentoring session booking between a student and mentor."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    mentor = models.ForeignKey(
        MentorProfile,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True)
    meeting_link = models.URLField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    cancellation_reason = models.TextField(blank=True, default="")

    class Meta:
        db_table = "bookings"
        ordering = ["-date", "-start_time"]

    def __str__(self):
        return f"Booking: {self.student} with {self.mentor} on {self.date}"


class BookingStatusHistory(BaseModel):
    """Audit trail for booking state changes."""

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        db_table = "booking_status_history"
        ordering = ["-created_at"]


class Review(BaseModel):
    """Student review/rating of a mentor after a completed session."""

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    mentor = models.ForeignKey(
        MentorProfile,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="review",
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, default="")

    class Meta:
        db_table = "reviews"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review: {self.rating}/5 for {self.mentor}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.mentor.update_rating()
