"""
Career Path, Category, Roadmap, Skill, and Student Progress models.
"""
from django.db import models
from apps.common.models import BaseModel, UUIDBaseModel


class CareerCategory(BaseModel):
    """Broad category for grouping career paths (e.g. Software Engineering, Data Science)."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="briefcase")

    class Meta:
        db_table = "career_categories"
        verbose_name_plural = "Career Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Skill(BaseModel):
    """Master repository of skills."""

    name = models.CharField(max_length=100, unique=True, db_index=True)
    category = models.CharField(max_length=100, blank=True, default="General")
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "skills"
        ordering = ["name"]

    def __str__(self):
        return self.name


class CareerPath(UUIDBaseModel):
    """Detailed career path definition."""

    DIFFICULTY_LEVELS = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ForeignKey(
        CareerCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="career_paths",
    )
    description = models.TextField()
    overview_summary = models.TextField(blank=True, default="", help_text="Detailed career review, why to choose, and skill growth analysis.")
    skill_growth_highlights = models.JSONField(default=list, blank=True, help_text="Key skill benefits and career growth points.")
    required_skills = models.ManyToManyField(Skill, related_name="career_paths", blank=True)
    estimated_duration = models.CharField(max_length=50, help_text="e.g. 6 Months, 1 Year")
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default="intermediate")
    is_featured = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, blank=True, default="compass")

    class Meta:
        db_table = "career_paths"
        ordering = ["title"]

    def __str__(self):
        return self.title


class CareerRoadmapStage(BaseModel):
    """Sequential stage/step in a career path roadmap."""

    career_path = models.ForeignKey(
        CareerPath,
        on_delete=models.CASCADE,
        related_name="stages",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)
    estimated_duration = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        db_table = "career_roadmap_stages"
        ordering = ["career_path", "order"]
        unique_together = ["career_path", "order"]

    def __str__(self):
        return f"{self.career_path.title} - Stage {self.order}: {self.title}"


class StageMilestone(BaseModel):
    """Actionable milestone item inside a roadmap stage."""

    stage = models.ForeignKey(
        CareerRoadmapStage,
        on_delete=models.CASCADE,
        related_name="milestones",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "stage_milestones"
        ordering = ["stage", "order"]

    def __str__(self):
        return f"{self.stage.title} - Milestone: {self.title}"


class StudentCareerProgress(BaseModel):
    """Tracks a student's enrolled career path progress."""

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="career_progress",
    )
    career_path = models.ForeignKey(
        CareerPath,
        on_delete=models.CASCADE,
        related_name="enrolled_students",
    )
    current_stage = models.ForeignKey(
        CareerRoadmapStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    completed_milestones = models.ManyToManyField(StageMilestone, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "student_career_progress"
        unique_together = ["student", "career_path"]

    def __str__(self):
        return f"{self.student} on {self.career_path.title}"


class FavoriteCareer(BaseModel):
    """Bookmarked/favorite career paths for a student."""

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="favorite_careers",
    )
    career_path = models.ForeignKey(
        CareerPath,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )

    class Meta:
        db_table = "favorite_careers"
        unique_together = ["student", "career_path"]
