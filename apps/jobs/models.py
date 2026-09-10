"""
Company, Job, Internship, Bookmark, Application, ApplicationStatusHistory models.
"""
from django.db import models
from apps.common.models import BaseModel, UUIDBaseModel


class Company(UUIDBaseModel):
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    logo = models.ImageField(upload_to="companies/logos/", blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, default="")
    industry = models.CharField(max_length=100, blank=True, default="")
    size = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        db_table = "companies"
        verbose_name_plural = "Companies"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Job(UUIDBaseModel):
    JOB_TYPES = [
        ("full_time", "Full Time"),
        ("part_time", "Part Time"),
        ("contract", "Contract"),
        ("remote", "Remote"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES, default="full_time")
    experience_level = models.CharField(max_length=50, default="Entry Level")
    salary_range = models.CharField(max_length=100, blank=True, default="")
    skills_required = models.ManyToManyField("careers.Skill", blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "jobs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company.name}"


class Internship(UUIDBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="internships")
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    duration = models.CharField(max_length=50, help_text="e.g. 3 Months")
    stipend = models.CharField(max_length=100, blank=True, default="")
    is_remote = models.BooleanField(default=False)
    skills_required = models.ManyToManyField("careers.Skill", blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "internships"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Internship: {self.title} at {self.company.name}"


class Application(UUIDBaseModel):
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("reviewing", "Reviewing"),
        ("shortlisted", "Shortlisted"),
        ("interview", "Interview Scheduled"),
        ("offered", "Offer Extended"),
        ("rejected", "Rejected"),
        ("withdrawn", "Withdrawn"),
    ]
    OPPORTUNITY_TYPES = [
        ("job", "Job"),
        ("internship", "Internship"),
    ]

    student = models.ForeignKey("students.StudentProfile", on_delete=models.CASCADE, related_name="applications")
    opportunity_type = models.CharField(max_length=20, choices=OPPORTUNITY_TYPES, default="job")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True, related_name="applications")
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, null=True, blank=True, related_name="applications")
    cover_letter = models.TextField(blank=True, default="")
    resume_url = models.URLField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied", db_index=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "job_applications"
        ordering = ["-applied_at"]

    def __str__(self):
        opp_title = self.job.title if self.job else (self.internship.title if self.internship else "Opportunity")
        return f"Application by {self.student} for {opp_title}"


class ApplicationStatusHistory(BaseModel):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True, default="")

    class Meta:
        db_table = "application_status_history"
        ordering = ["-created_at"]


class Bookmark(BaseModel):
    student = models.ForeignKey("students.StudentProfile", on_delete=models.CASCADE, related_name="bookmarks")
    opportunity_type = models.CharField(max_length=20, choices=[("job", "Job"), ("internship", "Internship")])
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = "opportunity_bookmarks"
