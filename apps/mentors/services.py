"""Business logic for mentor module — booking state machine, reviews, etc."""
import logging
from django.db import transaction
from django.db.models import Q

from apps.common.exceptions import ApplicationError, ConflictError, ResourceNotFoundError
from apps.mentors.models import (
    Booking, BookingStatusHistory, MentorAvailability,
    MentorProfile, Review,
)

logger = logging.getLogger("kvs")

# Valid booking state transitions
BOOKING_TRANSITIONS = {
    "pending": ["accepted", "rejected", "cancelled"],
    "accepted": ["completed", "cancelled"],
    "rejected": [],
    "completed": [],
    "cancelled": [],
}


def get_or_create_mentor_profile(user):
    profile, created = MentorProfile.objects.get_or_create(user=user)
    if created:
        logger.info("Created mentor profile for user id=%s", user.id)
    return profile


def update_mentor_profile(user, validated_data):
    profile = get_or_create_mentor_profile(user)
    for field, value in validated_data.items():
        setattr(profile, field, value)
    profile.save(update_fields=list(validated_data.keys()))
    return profile


def list_approved_mentors(filters=None):
    """List approved and active mentors with optional filters."""
    qs = MentorProfile.objects.filter(is_approved=True, is_active=True).select_related("user")

    if filters:
        if filters.get("expertise"):
            qs = qs.filter(expertise__contains=[filters["expertise"]])
        if filters.get("min_rating"):
            qs = qs.filter(average_rating__gte=filters["min_rating"])
        if filters.get("is_available") is not None:
            qs = qs.filter(is_available=filters["is_available"])
        if filters.get("search"):
            search = filters["search"]
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(company__icontains=search) |
                Q(job_title__icontains=search)
            )
    return qs


def set_availability(mentor_profile, slots_data):
    """Replace all availability slots for a mentor."""
    with transaction.atomic():
        mentor_profile.availability_slots.all().delete()
        slots = []
        for slot in slots_data:
            slots.append(MentorAvailability(mentor=mentor_profile, **slot))
        MentorAvailability.objects.bulk_create(slots)
    return mentor_profile.availability_slots.all()


def add_availability_slot(mentor_profile, slot_data):
    """Create a single availability slot for a mentor."""
    slot, _ = MentorAvailability.objects.get_or_create(
        mentor=mentor_profile,
        day_of_week=slot_data["day_of_week"],
        start_time=slot_data["start_time"],
        end_time=slot_data["end_time"],
        defaults={"is_available": slot_data.get("is_available", True)}
    )
    return slot


def add_availability_slots(mentor_profile, slots_data):
    """Bulk create availability slots for a mentor."""
    slots = []
    for data in slots_data:
        slot, _ = MentorAvailability.objects.get_or_create(
            mentor=mentor_profile,
            day_of_week=data["day_of_week"],
            start_time=data["start_time"],
            end_time=data["end_time"],
            defaults={"is_available": data.get("is_available", True)}
        )
        slots.append(slot)
    return slots


def delete_availability_slot(mentor_profile, slot_id):
    """Delete a mentor availability slot."""
    try:
        slot = mentor_profile.availability_slots.get(id=slot_id)
    except MentorAvailability.DoesNotExist:
        raise ResourceNotFoundError("Availability slot not found.")
    slot.delete()
    return True


def create_booking(student_profile, validated_data):
    """Create a booking request from a student to a mentor."""
    try:
        mentor = MentorProfile.objects.get(id=validated_data["mentor_id"], is_approved=True)
    except MentorProfile.DoesNotExist:
        raise ResourceNotFoundError("Mentor not found or not approved.")

    if not mentor.is_available:
        raise ApplicationError("This mentor is not currently accepting bookings.")

    # Check for conflicting bookings
    conflict = Booking.objects.filter(
        mentor=mentor,
        date=validated_data["date"],
        status__in=["pending", "accepted"],
    ).filter(
        Q(start_time__lt=validated_data["end_time"]) &
        Q(end_time__gt=validated_data["start_time"])
    ).exists()

    if conflict:
        raise ConflictError("This time slot is already booked.")

    booking = Booking.objects.create(
        student=student_profile,
        mentor=mentor,
        date=validated_data["date"],
        start_time=validated_data["start_time"],
        end_time=validated_data["end_time"],
        notes=validated_data.get("notes", ""),
    )

    BookingStatusHistory.objects.create(
        booking=booking,
        from_status="",
        to_status="pending",
        changed_by=student_profile.user,
    )

    logger.info("Booking created: id=%s student=%s mentor=%s", booking.id, student_profile.id, mentor.id)
    return booking


def update_booking_status(booking_id, new_status, user, notes="", meeting_link="", cancellation_reason=""):
    """Transition booking to a new status if the transition is valid."""
    try:
        booking = Booking.objects.select_related("student", "mentor").get(id=booking_id)
    except Booking.DoesNotExist:
        raise ResourceNotFoundError("Booking not found.")

    allowed = BOOKING_TRANSITIONS.get(booking.status, [])
    if new_status not in allowed:
        raise ApplicationError(
            f"Cannot transition from '{booking.status}' to '{new_status}'.",
            status_code=400,
        )

    old_status = booking.status
    booking.status = new_status
    if meeting_link:
        booking.meeting_link = meeting_link
    if cancellation_reason:
        booking.cancellation_reason = cancellation_reason
    booking.save()

    BookingStatusHistory.objects.create(
        booking=booking,
        from_status=old_status,
        to_status=new_status,
        changed_by=user,
        notes=notes,
    )

    # Update mentor total sessions on completion
    if new_status == "completed":
        mentor = booking.mentor
        mentor.total_sessions += 1
        mentor.save(update_fields=["total_sessions"])

    logger.info("Booking %s status: %s -> %s by user %s", booking.id, old_status, new_status, user.id)
    return booking


def create_review(student_profile, validated_data):
    """Create a review for a completed booking."""
    try:
        booking = Booking.objects.get(
            id=validated_data["booking_id"],
            student=student_profile,
            status="completed",
        )
    except Booking.DoesNotExist:
        raise ApplicationError("You can only review completed sessions that belong to you.")

    if hasattr(booking, "review"):
        raise ConflictError("You have already reviewed this session.")

    review = Review.objects.create(
        student=student_profile,
        mentor=booking.mentor,
        booking=booking,
        rating=validated_data["rating"],
        comment=validated_data.get("comment", ""),
    )
    logger.info("Review created: id=%s booking=%s rating=%s", review.id, booking.id, review.rating)
    return review
