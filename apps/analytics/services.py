"""Analytics aggregation logic using optimized Django queries."""
import logging
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncMonth

User = get_user_model()
logger = logging.getLogger("kvs")


def get_user_growth_analytics():
    """Monthly user registration breakdown."""
    growth = (
        User.objects.annotate(month=TruncMonth("date_joined"))
        .values("month")
        .annotate(
            total=Count("id"),
            students=Count("id", filter=Q(role="student")),
            mentors=Count("id", filter=Q(role="mentor")),
        )
        .order_by("month")
    )
    return [
        {
            "month": item["month"].strftime("%Y-%m") if item["month"] else "Unknown",
            "total": item["total"],
            "students": item["students"],
            "mentors": item["mentors"],
        }
        for item in growth
    ]


def get_course_analytics():
    from apps.courses.models import Course, Enrollment
    popular_courses = (
        Course.objects.annotate(total_enrollments=Count("enrollments"))
        .values("id", "title", "total_enrollments")
        .order_by("-total_enrollments")[:10]
    )
    return {
        "popular_courses": list(popular_courses),
        "total_enrollments": Enrollment.objects.count(),
        "total_completions": Enrollment.objects.filter(completed_at__isnull=False).count(),
    }


def get_career_analytics():
    from apps.careers.models import CareerPath, StudentCareerProgress
    popular_careers = (
        CareerPath.objects.annotate(total_enrolled=Count("enrolled_students"))
        .values("id", "title", "total_enrolled")
        .order_by("-total_enrolled")[:10]
    )
    return {
        "popular_careers": list(popular_careers),
        "total_enrolled_careers": StudentCareerProgress.objects.count(),
    }


def get_job_application_analytics():
    from apps.jobs.models import Application
    by_status = (
        Application.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    by_type = (
        Application.objects.values("opportunity_type")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    return {
        "total_applications": Application.objects.count(),
        "by_status": list(by_status),
        "by_type": list(by_type),
    }
