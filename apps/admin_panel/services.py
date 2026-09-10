"""Business logic for admin management panel."""
import logging
from django.contrib.auth import get_user_model
from apps.common.exceptions import ResourceNotFoundError
from apps.mentors.models import MentorProfile
from apps.notifications.services import create_notification

User = get_user_model()
logger = logging.getLogger("kvs")


def get_admin_dashboard_metrics():
    from apps.courses.models import Course
    from apps.careers.models import CareerPath
    from apps.mentors.models import Booking
    from apps.jobs.models import Application

    return {
        "total_users": User.objects.count(),
        "total_students": User.objects.filter(role="student").count(),
        "total_mentors": User.objects.filter(role="mentor").count(),
        "pending_mentor_approvals": MentorProfile.objects.filter(is_approved=False).count(),
        "total_courses": Course.objects.count(),
        "total_careers": CareerPath.objects.count(),
        "total_bookings": Booking.objects.count(),
        "total_applications": Application.objects.count(),
    }


def approve_or_reject_mentor(mentor_id, approve, notes=""):
    try:
        mentor = MentorProfile.objects.select_related("user").get(id=mentor_id)
    except MentorProfile.DoesNotExist:
        raise ResourceNotFoundError("Mentor profile not found.")

    mentor.is_approved = approve
    mentor.save(update_fields=["is_approved"])

    status_str = "approved" if approve else "rejected"
    create_notification(
        user=mentor.user,
        notification_type="mentor_approval",
        title=f"Mentor Application {status_str.title()}",
        message=f"Your mentor profile application has been {status_str}. {notes}",
    )

    logger.info("Mentor %s %s by admin.", mentor.id, status_str)
    return mentor


def create_mentor_by_admin(validated_data):
    from apps.accounts.models import Roles
    email = validated_data["email"].lower().strip()
    bio_text = validated_data.get("bio", "")
    job_title = validated_data.get("position") or validated_data.get("job_title", "")
    
    existing_user = User.objects.filter(email=email).first()
    if existing_user:
        user = existing_user
        user.role = Roles.MENTOR
        user.first_name = validated_data["first_name"]
        user.last_name = validated_data["last_name"]
        if bio_text:
            user.bio = bio_text
        user.set_password(validated_data["password"])
        user.is_email_verified = True
        user.save()
    else:
        user = User.objects.create_user(
            email=email,
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=Roles.MENTOR,
            is_email_verified=True,
            bio=bio_text,
        )

    mentor_profile, created = MentorProfile.objects.get_or_create(
        user=user,
        defaults={
            "company": validated_data.get("company", ""),
            "job_title": job_title,
            "hourly_rate": validated_data.get("hourly_rate", 50.00),
            "expertise": validated_data.get("expertise", []),
            "is_approved": True,
        }
    )
    if not created:
        if "company" in validated_data and validated_data["company"]:
            mentor_profile.company = validated_data["company"]
        if job_title:
            mentor_profile.job_title = job_title
        if "hourly_rate" in validated_data:
            mentor_profile.hourly_rate = validated_data["hourly_rate"]
        if "expertise" in validated_data and validated_data["expertise"]:
            mentor_profile.expertise = validated_data["expertise"]
        mentor_profile.is_approved = True
        mentor_profile.save()

    create_notification(
        user=user,
        notification_type="system",
        title="Mentor Account Ready",
        message="Your mentor account credentials have been configured by the administrator. Welcome to KVS Skill Nexus!",
    )

    return mentor_profile


def delete_mentor_by_admin(mentor_id):
    try:
        mentor = MentorProfile.objects.select_related("user").get(id=mentor_id)
    except MentorProfile.DoesNotExist:
        raise ResourceNotFoundError("Mentor profile not found.")

    user = mentor.user
    mentor.delete()
    user.delete()
    logger.info("Mentor %s and associated user %s deleted by admin.", mentor_id, user.id)
    return True


def get_system_health():
    from django.db import connection
    from django.core.cache import cache
    from django.utils import timezone

    db_status = "healthy"
    try:
        connection.ensure_connection()
    except Exception:
        db_status = "unhealthy"

    cache_status = "healthy"
    try:
        cache.set("admin_health_ping", "ok", timeout=5)
        if cache.get("admin_health_ping") != "ok":
            cache_status = "degraded"
    except Exception:
        cache_status = "unhealthy"

    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    pending_mentors = MentorProfile.objects.filter(is_approved=False).count()

    return {
        "db_status": db_status,
        "cache_status": cache_status,
        "total_users": total_users,
        "active_users": active_users,
        "pending_mentors": pending_mentors,
        "server_time": timezone.now().isoformat(),
    }


def get_all_users_admin(query=None, role=None, is_active=None):
    from django.db.models import Q
    qs = User.objects.all().order_by("-date_joined")
    if query:
        qs = qs.filter(
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )
    if role:
        qs = qs.filter(role=role)
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    return qs


def toggle_user_status(user_id, is_active=None, is_email_verified=None):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ResourceNotFoundError("User not found.")

    updated_fields = []
    if is_active is not None:
        user.is_active = is_active
        updated_fields.append("is_active")
    if is_email_verified is not None:
        user.is_email_verified = is_email_verified
        updated_fields.append("is_email_verified")

    if updated_fields:
        user.save(update_fields=updated_fields)

    return user


def send_broadcast_notification(title, message, target_role="all"):
    users = User.objects.filter(is_active=True)
    if target_role and target_role != "all":
        users = users.filter(role=target_role)

    count = 0
    for user in users:
        create_notification(
            user=user,
            notification_type="system",
            title=title,
            message=message,
        )
        count += 1

    logger.info("Admin sent broadcast notification '%s' to %d users (target_role=%s).", title, count, target_role)
    return count


