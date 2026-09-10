"""Business logic for student module."""
import logging
from django.db import transaction

from apps.students.models import LearningHistory, StudentProfile, StudentSetting
from apps.common.exceptions import ResourceNotFoundError

logger = logging.getLogger("kvs")


def get_or_create_student_profile(user):
    """Return the student profile, creating it if it doesn't exist."""
    profile, created = StudentProfile.objects.get_or_create(user=user)
    if created:
        StudentSetting.objects.get_or_create(student=profile)
        logger.info("Created student profile for user id=%s", user.id)
    return profile


def update_student_profile(user, validated_data):
    profile = get_or_create_student_profile(user)
    for field, value in validated_data.items():
        setattr(profile, field, value)
    profile.save(update_fields=list(validated_data.keys()))
    return profile


def delete_student_resume_file(user):
    """Delete uploaded resume file for a student profile and resume profile."""
    profile = get_or_create_student_profile(user)
    if profile.resume_file:
        try:
            profile.resume_file.delete(save=False)
        except Exception:
            pass
        profile.resume_file = None
        profile.save(update_fields=["resume_file"])

    try:
        from apps.resumes.models import ResumeProfile
        resume_profile = ResumeProfile.objects.filter(student=profile).first()
        if resume_profile and resume_profile.resume_file:
            try:
                resume_profile.resume_file.delete(save=False)
            except Exception:
                pass
            resume_profile.resume_file = None
            resume_profile.save(update_fields=["resume_file"])
    except Exception:
        pass

    return profile


def get_student_dashboard(user):
    """Aggregate dashboard stats for a student."""
    profile = get_or_create_student_profile(user)

    # Counts — safely handle missing modules with getattr / try
    enrolled_courses = 0
    completed_courses = 0
    assessments_taken = 0
    upcoming_sessions = 0
    active_applications = 0
    unread_notifications = 0

    try:
        from apps.courses.models import Enrollment
        enrolled_courses = Enrollment.objects.filter(student=profile).count()
        completed_courses = Enrollment.objects.filter(student=profile, completed_at__isnull=False).count()
    except Exception:
        pass

    try:
        from apps.assessments.models import AssessmentAttempt
        assessments_taken = AssessmentAttempt.objects.filter(student=profile).count()
    except Exception:
        pass

    try:
        from apps.mentors.models import Booking
        upcoming_sessions = Booking.objects.filter(
            student=profile, status="accepted"
        ).count()
    except Exception:
        pass

    try:
        from apps.jobs.models import Application
        active_applications = Application.objects.filter(
            student=profile, status__in=["applied", "reviewing", "shortlisted", "interview"]
        ).count()
    except Exception:
        pass

    try:
        from apps.notifications.models import Notification
        unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
    except Exception:
        pass

    recent_history = LearningHistory.objects.filter(student=profile)[:10]

    return {
        "profile": profile,
        "enrolled_courses_count": enrolled_courses,
        "completed_courses_count": completed_courses,
        "assessments_taken": assessments_taken,
        "upcoming_sessions": upcoming_sessions,
        "active_applications": active_applications,
        "unread_notifications": unread_notifications,
        "recent_history": recent_history,
    }


def get_student_settings(user):
    profile = get_or_create_student_profile(user)
    settings, _ = StudentSetting.objects.get_or_create(student=profile)
    return settings


def update_student_settings(user, validated_data):
    settings = get_student_settings(user)
    for field, value in validated_data.items():
        setattr(settings, field, value)
    settings.save(update_fields=list(validated_data.keys()))
    return settings


def add_learning_event(student_profile, event_type, title, description="", metadata=None):
    """Helper to record a learning event — called from other modules."""
    return LearningHistory.objects.create(
        student=student_profile,
        event_type=event_type,
        title=title,
        description=description,
        metadata=metadata or {},
    )
