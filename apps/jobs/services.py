"""Business logic for jobs & internships module."""
import logging
from apps.common.exceptions import ApplicationError, ConflictError, ResourceNotFoundError
from apps.jobs.models import Application, ApplicationStatusHistory, Bookmark, Internship, Job

logger = logging.getLogger("kvs")


def apply_for_opportunity(student_profile, validated_data):
    opp_type = validated_data["opportunity_type"]
    opp_id = validated_data["opportunity_id"]

    job = None
    internship = None

    if opp_type == "job":
        try:
            job = Job.objects.get(id=opp_id, is_active=True)
        except Job.DoesNotExist:
            raise ResourceNotFoundError("Job posting not found.")
        if Application.objects.filter(student=student_profile, job=job).exists():
            raise ConflictError("You have already applied for this job.")
    else:
        try:
            internship = Internship.objects.get(id=opp_id, is_active=True)
        except Internship.DoesNotExist:
            raise ResourceNotFoundError("Internship posting not found.")
        if Application.objects.filter(student=student_profile, internship=internship).exists():
            raise ConflictError("You have already applied for this internship.")

    app = Application.objects.create(
        student=student_profile,
        opportunity_type=opp_type,
        job=job,
        internship=internship,
        cover_letter=validated_data.get("cover_letter", ""),
        resume_url=validated_data.get("resume_url", ""),
    )

    ApplicationStatusHistory.objects.create(
        application=app,
        from_status="",
        to_status="applied",
    )

    return app


def toggle_bookmark(student_profile, opp_type, opp_id):
    job = None
    internship = None

    if opp_type == "job":
        job = Job.objects.get(id=opp_id)
        bookmark, created = Bookmark.objects.get_or_create(student=student_profile, opportunity_type=opp_type, job=job)
    else:
        internship = Internship.objects.get(id=opp_id)
        bookmark, created = Bookmark.objects.get_or_create(student=student_profile, opportunity_type=opp_type, internship=internship)

    if not created:
        bookmark.delete()
        return False
    return True
