"""Serializers for admin panel management."""
from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.mentors.serializers import MentorProfileSerializer


class AdminDashboardSummarySerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_mentors = serializers.IntegerField()
    pending_mentor_approvals = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    total_careers = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    total_applications = serializers.IntegerField()


class MentorApprovalActionSerializer(serializers.Serializer):
    approve = serializers.BooleanField()
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class AdminCreateMentorSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    password = serializers.CharField(min_length=8, write_only=True)
    company = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    position = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    bio = serializers.CharField(required=False, allow_blank=True, default="")
    hourly_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=50.00)
    expertise = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class SystemHealthSerializer(serializers.Serializer):
    db_status = serializers.CharField()
    cache_status = serializers.CharField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    pending_mentors = serializers.IntegerField()
    server_time = serializers.CharField()


class UserStatusToggleSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=False)
    is_email_verified = serializers.BooleanField(required=False)


class BroadcastNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    target_role = serializers.ChoiceField(choices=["all", "student", "mentor", "admin"], default="all")



