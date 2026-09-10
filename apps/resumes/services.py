"""Business logic for resume builder."""
import logging
from apps.resumes.models import ResumeProfile

logger = logging.getLogger("kvs")


def get_or_create_resume(student_profile):
    resume, created = ResumeProfile.objects.get_or_create(student=student_profile)
    return resume


def update_resume_summary(student_profile, title, summary):
    resume = get_or_create_resume(student_profile)
    if title:
        resume.title = title
    if summary is not None:
        resume.summary = summary
    resume.save()
    return resume
