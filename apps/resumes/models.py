"""
Resume Profile, Education, Experience, Skill, Project, Certification, Achievement, Language, Reference models.
"""
from django.db import models
from apps.common.models import BaseModel, UUIDBaseModel


class ResumeProfile(UUIDBaseModel):
    """Container for student resume details."""

    student = models.OneToOneField(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="resume",
    )
    title = models.CharField(max_length=200, default="My Resume")
    summary = models.TextField(blank=True, default="")
    resume_file = models.FileField(upload_to="resumes/", null=True, blank=True)

    class Meta:
        db_table = "resume_profiles"

    def __str__(self):
        return f"Resume: {self.student}"


class Education(BaseModel):
    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="educations")
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255, blank=True, default="")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    gpa = models.CharField(max_length=20, blank=True, default="")
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "resume_educations"
        ordering = ["-start_date"]


class Experience(BaseModel):
    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="experiences")
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, default="")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "resume_experiences"
        ordering = ["-start_date"]


class Project(BaseModel):
    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=255)
    description = models.TextField()
    project_url = models.URLField(blank=True, default="")
    technologies = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        db_table = "resume_projects"


class ResumeSkill(BaseModel):
    PROFICIENCY_LEVELS = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
        ("expert", "Expert"),
    ]

    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="skills")
    skill_name = models.CharField(max_length=100)
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS, default="intermediate")

    class Meta:
        db_table = "resume_skills"


class Certification(BaseModel):
    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="certifications")
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    date_obtained = models.DateField()
    credential_url = models.URLField(blank=True, default="")

    class Meta:
        db_table = "resume_certifications"


class Achievement(BaseModel):
    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "resume_achievements"


class Language(BaseModel):
    resume = models.ForeignKey(ResumeProfile, on_delete=models.CASCADE, related_name="languages")
    language = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=100, default="Fluent")

    class Meta:
        db_table = "resume_languages"
