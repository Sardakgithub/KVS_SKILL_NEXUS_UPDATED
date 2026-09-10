"""
Assessment, Question, Option, AssessmentAssignment, Attempt, Answer, and Recommendation models.
"""
from django.conf import settings
from django.db import models
from apps.common.models import BaseModel, UUIDBaseModel


class Assessment(UUIDBaseModel):
    DIFFICULTY_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    ASSIGNMENT_TYPES = [
        ("all", "All Platform Students"),
        ("individual", "Individual Students"),
        ("course", "Course Enrolled"),
    ]

    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default="")
    instructions = models.TextField(blank=True, default="")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_assessments",
    )
    skill = models.ForeignKey(
        "careers.Skill",
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default="intermediate")
    time_limit_minutes = models.PositiveIntegerField(default=30)
    passing_score = models.PositiveIntegerField(default=70, help_text="Passing percentage threshold (e.g. 70%)")
    total_questions = models.PositiveIntegerField(default=0)
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default="all")
    due_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "assessments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.skill.name})"


class Question(BaseModel):
    QUESTION_TYPES = [
        ("mcq", "Multiple Choice (Single)"),
        ("multi_select", "Multiple Choice (Multiple)"),
        ("true_false", "True / False"),
        ("text", "Short Text / Essay"),
        ("coding", "Coding Test"),
    ]

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default="mcq")
    points = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)

    # Coding question specific fields
    starter_code = models.TextField(blank=True, default="")
    programming_language = models.CharField(max_length=50, default="python", blank=True)
    test_cases = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "assessment_questions"
        ordering = ["assessment", "order"]

    def __str__(self):
        return f"Q{self.order} [{self.question_type}]: {self.text[:50]}"


class Option(BaseModel):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="options",
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "question_options"
        ordering = ["question", "order"]

    def __str__(self):
        return f"{self.text} {'(Correct)' if self.is_correct else ''}"


class AssessmentAssignment(UUIDBaseModel):
    ASSIGNMENT_TYPES = [
        ("all", "All Platform Students"),
        ("individual", "Individual Student"),
        ("course", "Course Enrolled"),
    ]

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="given_assignments",
    )
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="assigned_assessments",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="assessment_assignments",
    )
    target_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default="all")
    due_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "assessment_assignments"
        ordering = ["-created_at"]

    def __str__(self):
        target = self.student or self.course or "All Platform Students"
        return f"{self.assessment.title} -> {target}"


class AssessmentAttempt(UUIDBaseModel):
    STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("submitted", "Submitted"),
        ("graded", "Graded"),
    ]

    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="assessment_attempts",
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    assignment = models.ForeignKey(
        AssessmentAssignment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attempts",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    passed = models.BooleanField(default=False)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_progress")
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="graded_attempts",
    )

    class Meta:
        db_table = "assessment_attempts"
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.student} - {self.assessment.title} ({self.score_percentage}%)"


class AttemptAnswer(BaseModel):
    attempt = models.ForeignKey(
        AssessmentAttempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True, blank=True)
    selected_options = models.ManyToManyField(Option, blank=True, related_name="attempt_answers")
    text_response = models.TextField(blank=True, default="")
    code_submission = models.TextField(blank=True, default="")
    language = models.CharField(max_length=50, blank=True, default="python")
    test_cases_passed = models.PositiveIntegerField(default=0)
    test_cases_total = models.PositiveIntegerField(default=0)
    points_awarded = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_correct = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, default="")

    class Meta:
        db_table = "attempt_answers"
        unique_together = ["attempt", "question"]


class SkillRecommendation(BaseModel):
    attempt = models.OneToOneField(
        AssessmentAttempt,
        on_delete=models.CASCADE,
        related_name="recommendation",
    )
    skill = models.ForeignKey("careers.Skill", on_delete=models.CASCADE)
    score_level = models.CharField(max_length=50)
    recommendation_text = models.TextField()
    recommended_courses = models.ManyToManyField("courses.Course", blank=True)

    class Meta:
        db_table = "skill_recommendations"

