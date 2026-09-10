"""Serializers for resume builder module."""
from rest_framework import serializers

from apps.resumes.models import (
    Achievement, Certification, Education, Experience, Language, Project,
    ResumeProfile, ResumeSkill,
)


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "institution", "degree", "field_of_study", "start_date", "end_date", "gpa", "description"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "company", "position", "location", "start_date", "end_date", "is_current", "description"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "title", "description", "project_url", "technologies"]


class ResumeSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSkill
        fields = ["id", "skill_name", "proficiency_level"]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "name", "issuer", "date_obtained", "credential_url"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "title", "description", "date"]


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["id", "language", "proficiency"]


class FullResumeSerializer(serializers.ModelSerializer):
    educations = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    skills = ResumeSkillSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)

    class Meta:
        model = ResumeProfile
        fields = [
            "id", "title", "summary", "resume_file", "educations", "experiences",
            "projects", "skills", "certifications", "achievements", "languages",
        ]
