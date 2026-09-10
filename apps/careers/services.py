"""Business logic for careers module."""
import logging
from django.utils import timezone
from apps.common.exceptions import ApplicationError, ConflictError, ResourceNotFoundError
from apps.careers.models import (
    CareerCategory, CareerPath, FavoriteCareer, Skill, StudentCareerProgress, StageMilestone
)

logger = logging.getLogger("kvs")


def enroll_in_career_path(student_profile, career_path_id):
    try:
        career_path = CareerPath.objects.get(id=career_path_id, is_active=True)
    except CareerPath.DoesNotExist:
        raise ResourceNotFoundError("Career path not found.")

    first_stage = career_path.stages.first()
    progress, created = StudentCareerProgress.objects.get_or_create(
        student=student_profile,
        career_path=career_path,
        defaults={"current_stage": first_stage},
    )
    if not created:
        raise ConflictError("You are already enrolled in this career path.")

    from apps.students.services import add_learning_event
    add_learning_event(
        student_profile,
        event_type="career_started",
        title=f"Started {career_path.title}",
        description=f"Enrolled in career path: {career_path.title}",
    )
    return progress


def toggle_favorite_career(student_profile, career_path_id):
    try:
        career_path = CareerPath.objects.get(id=career_path_id)
    except CareerPath.DoesNotExist:
        raise ResourceNotFoundError("Career path not found.")

    fav, created = FavoriteCareer.objects.get_or_create(
        student=student_profile,
        career_path=career_path,
    )
    if not created:
        fav.delete()
        return False  # Unfavorited
    return True  # Favorited


def complete_milestone(student_profile, career_path_id, milestone_id):
    try:
        progress = StudentCareerProgress.objects.get(student=student_profile, career_path_id=career_path_id)
    except StudentCareerProgress.DoesNotExist:
        raise ApplicationError("You are not enrolled in this career path.")

    try:
        milestone = StageMilestone.objects.get(id=milestone_id, stage__career_path_id=career_path_id)
    except StageMilestone.DoesNotExist:
        raise ResourceNotFoundError("Milestone not found in this career path.")

    progress.completed_milestones.add(milestone)

    # Check if all milestones for current stage are done -> advance stage
    if progress.current_stage:
        stage_milestones = progress.current_stage.milestones.all()
        completed_stage_milestones = progress.completed_milestones.filter(stage=progress.current_stage)
        if stage_milestones.count() == completed_stage_milestones.count():
            next_stage = progress.career_path.stages.filter(order__gt=progress.current_stage.order).first()
            progress.current_stage = next_stage
            if not next_stage:
                progress.completed_at = timezone.now()
            progress.save()

    return progress
