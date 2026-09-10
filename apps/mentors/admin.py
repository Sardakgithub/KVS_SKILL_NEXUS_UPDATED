from django.contrib import admin
from apps.mentors.models import MentorProfile, MentorAvailability, Booking, BookingStatusHistory, Review


@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "company", "job_title", "is_approved", "is_available", "average_rating", "total_sessions")
    list_filter = ("is_approved", "is_available")
    search_fields = ("user__email", "user__first_name", "company", "job_title")
    raw_id_fields = ("user",)


@admin.register(MentorAvailability)
class MentorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("mentor", "day_of_week", "start_time", "end_time", "is_available")
    list_filter = ("day_of_week", "is_available")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("student", "mentor", "date", "start_time", "end_time", "status", "created_at")
    list_filter = ("status", "date")
    search_fields = ("student__user__email", "mentor__user__email")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("student", "mentor", "rating", "created_at")
    list_filter = ("rating",)
