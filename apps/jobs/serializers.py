"""Serializers for jobs & internships module."""
from rest_framework import serializers

from apps.careers.serializers import SkillSerializer
from apps.jobs.models import (
    Application, ApplicationStatusHistory, Bookmark, Company, Internship, Job
)


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "description", "website", "logo", "location", "industry", "size"]


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "company", "title", "description", "location",
            "job_type", "experience_level", "salary_range",
            "skills_required", "deadline", "is_active", "created_at",
        ]


class InternshipSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Internship
        fields = [
            "id", "company", "title", "description", "location",
            "duration", "stipend", "is_remote", "skills_required",
            "deadline", "is_active", "created_at",
        ]


class ApplicationCreateSerializer(serializers.Serializer):
    opportunity_type = serializers.ChoiceField(choices=["job", "internship"])
    opportunity_id = serializers.UUIDField()
    cover_letter = serializers.CharField(required=False, default="")
    resume_url = serializers.URLField(required=False, default="")


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    internship = InternshipSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "opportunity_type", "job", "internship",
            "cover_letter", "resume_url", "status", "applied_at",
        ]


class BookmarkSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    internship = InternshipSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "opportunity_type", "job", "internship", "created_at"]
