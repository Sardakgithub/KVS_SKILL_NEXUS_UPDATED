"""Serializers for student profile, learning history, settings, and dashboard."""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.students.models import LearningHistory, StudentProfile, StudentSetting


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "headline", "phone", "location", "bio",
            "date_of_birth", "education_level", "major_or_stream", "institution", "graduation_year",
            "academic_score", "job_hunt_status", "notice_period", "expected_salary", "preferred_locations",
            "skills", "career_goals", "interests", "languages_spoken", "certifications",
            "projects_highlights", "achievements", "projects", "linkedin_url", "github_url", "portfolio_url", "twitter_url",
            "resume_file", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    linkedin_url = serializers.CharField(required=False, allow_blank=True, default="")
    github_url = serializers.CharField(required=False, allow_blank=True, default="")
    portfolio_url = serializers.CharField(required=False, allow_blank=True, default="")
    twitter_url = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = StudentProfile
        fields = [
            "headline", "phone", "location", "bio",
            "date_of_birth", "education_level", "major_or_stream", "institution", "graduation_year",
            "academic_score", "job_hunt_status", "notice_period", "expected_salary", "preferred_locations",
            "skills", "career_goals", "interests", "languages_spoken", "certifications",
            "projects_highlights", "achievements", "projects", "linkedin_url", "github_url", "portfolio_url", "twitter_url",
            "resume_file",
        ]

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        elif isinstance(data, dict):
            data = dict(data)
        
        if "date_of_birth" in data and (data["date_of_birth"] == "" or data["date_of_birth"] is None):
            data["date_of_birth"] = None
        if "graduation_year" in data and (data["graduation_year"] == "" or data["graduation_year"] is None):
            data["graduation_year"] = None
        return super().to_internal_value(data)


class LearningHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningHistory
        fields = ["id", "event_type", "title", "description", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class StudentSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSetting
        fields = [
            "email_notifications", "booking_reminders", "course_updates",
            "job_alerts", "profile_visibility",
        ]


class StudentDashboardSerializer(serializers.Serializer):
    """Read-only dashboard summary for the authenticated student."""
    profile = StudentProfileSerializer(read_only=True)
    enrolled_courses_count = serializers.IntegerField()
    completed_courses_count = serializers.IntegerField()
    assessments_taken = serializers.IntegerField()
    upcoming_sessions = serializers.IntegerField()
    active_applications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    recent_history = LearningHistorySerializer(many=True, read_only=True)
