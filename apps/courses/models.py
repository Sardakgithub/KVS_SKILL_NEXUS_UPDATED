"""
Course, Category, Learning Resource, Enrollment, and Progress models.
"""
from django.db import models
from apps.common.models import BaseModel, UUIDBaseModel


class CourseCategory(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "course_categories"
        verbose_name_plural = "Course Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(UUIDBaseModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    ]
    DIFFICULTY_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=270, unique=True)
    category = models.ForeignKey(
        CourseCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="courses",
    )
    instructor = models.ForeignKey(
        "mentors.MentorProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="courses",
    )
    description = models.TextField()
    duration_hours = models.PositiveIntegerField(default=0)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default="beginner")
    learning_objectives = models.JSONField(default=list, blank=True)
    thumbnail = models.ImageField(upload_to="courses/thumbnails/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft", db_index=True)
    career_paths = models.ManyToManyField("careers.CareerPath", related_name="courses", blank=True)

    class Meta:
        db_table = "courses"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class LearningResource(BaseModel):
    RESOURCE_TYPES = [
        ("video", "Video"),
        ("article", "Article"),
        ("pdf", "PDF Document"),
        ("quiz", "Quiz"),
        ("assignment", "Assignment"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="resources",
    )
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default="video")
    content_url = models.URLField(blank=True, default="")
    content_text = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "learning_resources"
        ordering = ["course", "order"]

    def __str__(self):
        return f"{self.course.title} - {self.order}. {self.title}"


class Enrollment(BaseModel):
    student = models.ForeignKey(
        "students.StudentProfile",
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    class Meta:
        db_table = "course_enrollments"
        unique_together = ["student", "course"]
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.student} enrolled in {self.course.title}"

    def update_progress(self):
        total_resources = self.course.resources.count()
        if total_resources == 0:
            self.progress_percentage = 100.00
        else:
            completed_count = self.resource_progress.filter(is_completed=True).count()
            self.progress_percentage = round((completed_count / total_resources) * 100, 2)

        if self.progress_percentage >= 100.00 and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()

            # Trigger auto-certificate issuance if applicable
            from apps.students.services import add_learning_event
            add_learning_event(
                self.student,
                event_type="course_completed",
                title=f"Completed {self.course.title}",
                description=f"Successfully completed the course: {self.course.title}",
            )

        self.save(update_fields=["progress_percentage", "completed_at"])


class CourseProgress(BaseModel):
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="resource_progress",
    )
    resource = models.ForeignKey(
        LearningResource,
        on_delete=models.CASCADE,
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "course_resource_progress"
        unique_together = ["enrollment", "resource"]

    def __str__(self):
        return f"{self.enrollment.student} - {self.resource.title}: {'Done' if self.is_completed else 'Pending'}"
