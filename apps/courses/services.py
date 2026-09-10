"""Business logic for course module."""
import logging
from django.utils import timezone
from apps.common.exceptions import ApplicationError, ConflictError, ResourceNotFoundError
from apps.courses.models import Course, CourseProgress, Enrollment, LearningResource

logger = logging.getLogger("kvs")


def enroll_in_course(student_profile, course_id):
    try:
        course = Course.objects.get(id=course_id, status="published")
    except Course.DoesNotExist:
        raise ResourceNotFoundError("Course not found or not published.")

    enrollment, created = Enrollment.objects.get_or_create(
        student=student_profile,
        course=course,
    )
    if not created:
        raise ConflictError("You are already enrolled in this course.")

    from apps.students.services import add_learning_event
    add_learning_event(
        student_profile,
        event_type="course_enrolled",
        title=f"Enrolled in {course.title}",
        description=f"Enrolled in course: {course.title}",
    )
    return enrollment


def mark_resource_completed(student_profile, course_id, resource_id):
    try:
        enrollment = Enrollment.objects.get(student=student_profile, course_id=course_id)
    except Enrollment.DoesNotExist:
        raise ApplicationError("You are not enrolled in this course.")

    try:
        resource = LearningResource.objects.get(id=resource_id, course_id=course_id)
    except LearningResource.DoesNotExist:
        raise ResourceNotFoundError("Learning resource not found in this course.")

    progress, _ = CourseProgress.objects.get_or_create(
        enrollment=enrollment,
        resource=resource,
    )
    progress.is_completed = True
    progress.completed_at = timezone.now()
    progress.save()

    enrollment.update_progress()
    return progress
