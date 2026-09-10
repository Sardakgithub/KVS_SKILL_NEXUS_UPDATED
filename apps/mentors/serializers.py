"""Serializers for mentor module."""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.mentors.models import (
    Booking, BookingStatusHistory, MentorAvailability,
    MentorProfile, Review,
)


class MentorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MentorProfile
        fields = [
            "id", "user", "expertise", "specializations", "bio", "education",
            "company", "job_title", "years_experience", "hourly_rate",
            "session_duration", "languages_spoken", "linkedin_url", "github_url",
            "twitter_url", "website_url", "is_approved", "is_available",
            "total_sessions", "average_rating", "total_reviews", "created_at",
        ]
        read_only_fields = [
            "id", "is_approved", "total_sessions", "average_rating",
            "total_reviews", "created_at",
        ]


class MentorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorProfile
        fields = [
            "expertise", "specializations", "bio", "education",
            "company", "job_title", "years_experience", "hourly_rate",
            "session_duration", "languages_spoken", "linkedin_url",
            "github_url", "twitter_url", "website_url", "is_available",
        ]
        extra_kwargs = {
            "bio": {"allow_blank": True, "required": False},
            "education": {"allow_blank": True, "required": False},
            "company": {"allow_blank": True, "required": False},
            "job_title": {"allow_blank": True, "required": False},
            "linkedin_url": {"allow_blank": True, "required": False},
            "github_url": {"allow_blank": True, "required": False},
            "twitter_url": {"allow_blank": True, "required": False},
            "website_url": {"allow_blank": True, "required": False},
        }


class MentorAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = MentorAvailability
        fields = ["id", "day_of_week", "day_name", "start_time", "end_time", "is_available"]
        read_only_fields = ["id"]


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)
    mentor_name = serializers.CharField(source="mentor.user.get_full_name", read_only=True)
    student = serializers.SerializerMethodField()
    mentor = serializers.SerializerMethodField()

    def get_student(self, obj):
        return {
            "id": str(obj.student.id),
            "full_name": obj.student.user.get_full_name(),
            "email": obj.student.user.email,
        }

    def get_mentor(self, obj):
        return {
            "id": str(obj.mentor.id),
            "full_name": obj.mentor.user.get_full_name(),
            "company": obj.mentor.company,
            "job_title": obj.mentor.job_title,
        }

    class Meta:
        model = Booking
        fields = [
            "id", "student", "mentor", "student_name", "mentor_name",
            "date", "start_time", "end_time", "status", "meeting_link",
            "notes", "cancellation_reason", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class BookingCreateSerializer(serializers.Serializer):
    mentor_id = serializers.IntegerField()
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    notes = serializers.CharField(required=False, default="")

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})
        return data


class BookingStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["accepted", "rejected", "completed", "cancelled"])
    notes = serializers.CharField(required=False, default="")
    meeting_link = serializers.URLField(required=False, default="")
    cancellation_reason = serializers.CharField(required=False, default="")


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingStatusHistory
        fields = ["from_status", "to_status", "changed_by", "notes", "created_at"]


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "student_name", "booking", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReviewCreateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, default="")


class MentorListFilterSerializer(serializers.Serializer):
    """Query params for filtering mentor list."""
    expertise = serializers.CharField(required=False)
    min_rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    is_available = serializers.BooleanField(required=False)
    search = serializers.CharField(required=False)
