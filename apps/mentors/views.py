"""Views for mentor module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent, IsMentor, IsMentorOrAdmin, ReadOnlyOrIsAdmin
from apps.common.responses import APIResponse
from apps.common.pagination import StandardResultsPagination
from apps.mentors import services
from apps.mentors.serializers import (
    BookingCreateSerializer, BookingSerializer, BookingStatusHistorySerializer,
    BookingStatusUpdateSerializer, MentorAvailabilitySerializer,
    MentorProfileSerializer, MentorProfileUpdateSerializer,
    ReviewCreateSerializer, ReviewSerializer,
)
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Mentors"])
class MentorListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List approved mentors", responses={200: MentorProfileSerializer(many=True)})
    def get(self, request):
        filters = {
            "expertise": request.query_params.get("expertise"),
            "min_rating": request.query_params.get("min_rating"),
            "is_available": request.query_params.get("is_available"),
            "search": request.query_params.get("search"),
        }
        filters = {k: v for k, v in filters.items() if v is not None}
        mentors = services.list_approved_mentors(filters)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(mentors, request)
        data = MentorProfileSerializer(page, many=True).data
        return paginator.get_paginated_response(data)


@extend_schema(tags=["Mentors"])
class MentorProfileView(APIView):
    permission_classes = [IsAuthenticated, IsMentor]

    @extend_schema(summary="Get mentor profile", responses={200: MentorProfileSerializer})
    def get(self, request):
        profile = services.get_or_create_mentor_profile(request.user)
        return APIResponse.success(data=MentorProfileSerializer(profile).data)

    @extend_schema(summary="Update mentor profile", request=MentorProfileUpdateSerializer)
    def patch(self, request):
        serializer = MentorProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = services.update_mentor_profile(request.user, serializer.validated_data)
        return APIResponse.success(
            data=MentorProfileSerializer(profile).data,
            message="Profile updated successfully.",
        )


@extend_schema(tags=["Mentors"])
class MentorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get mentor detail by ID", responses={200: MentorProfileSerializer})
    def get(self, request, mentor_id):
        from apps.mentors.models import MentorProfile
        from apps.common.exceptions import ResourceNotFoundError
        try:
            mentor = MentorProfile.objects.select_related("user").get(id=mentor_id, is_approved=True)
        except MentorProfile.DoesNotExist:
            raise ResourceNotFoundError("Mentor not found.")
        return APIResponse.success(data=MentorProfileSerializer(mentor).data)


@extend_schema(tags=["Mentors"])
class MentorAvailabilityView(APIView):
    permission_classes = [IsAuthenticated, IsMentor]

    @extend_schema(summary="Get mentor availability", responses={200: MentorAvailabilitySerializer(many=True)})
    def get(self, request):
        profile = services.get_or_create_mentor_profile(request.user)
        slots = profile.availability_slots.all()
        return APIResponse.success(data=MentorAvailabilitySerializer(slots, many=True).data)

    @extend_schema(summary="Set mentor availability", request=MentorAvailabilitySerializer(many=True))
    def put(self, request):
        serializer = MentorAvailabilitySerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        profile = services.get_or_create_mentor_profile(request.user)
        slots = services.set_availability(profile, serializer.validated_data)
        return APIResponse.success(
            data=MentorAvailabilitySerializer(slots, many=True).data,
            message="Availability updated.",
        )

    @extend_schema(summary="Add mentor availability slot", request=MentorAvailabilitySerializer)
    def post(self, request):
        profile = services.get_or_create_mentor_profile(request.user)
        is_many = isinstance(request.data, list)
        serializer = MentorAvailabilitySerializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        if is_many:
            slots = services.add_availability_slots(profile, serializer.validated_data)
            return APIResponse.created(
                data=MentorAvailabilitySerializer(slots, many=True).data,
                message="Availability slots added.",
            )
        else:
            slot = services.add_availability_slot(profile, serializer.validated_data)
            return APIResponse.created(
                data=MentorAvailabilitySerializer(slot).data,
                message="Availability slot added.",
            )


@extend_schema(tags=["Mentors"])
class MentorAvailabilityDetailView(APIView):
    permission_classes = [IsAuthenticated, IsMentor]

    @extend_schema(summary="Delete mentor availability slot")
    def delete(self, request, slot_id):
        profile = services.get_or_create_mentor_profile(request.user)
        services.delete_availability_slot(profile, slot_id)
        return APIResponse.success(message="Availability slot deleted.")



@extend_schema(tags=["Mentors"])
class MentorAvailabilityPublicView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get a mentor's availability by ID")
    def get(self, request, mentor_id):
        from apps.mentors.models import MentorProfile
        from apps.common.exceptions import ResourceNotFoundError
        try:
            profile = MentorProfile.objects.get(id=mentor_id, is_approved=True)
        except MentorProfile.DoesNotExist:
            raise ResourceNotFoundError("Mentor not found.")
        slots = profile.availability_slots.filter(is_available=True)
        return APIResponse.success(data=MentorAvailabilitySerializer(slots, many=True).data)


@extend_schema(tags=["Bookings"])
class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Create a booking", request=BookingCreateSerializer)
    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = get_or_create_student_profile(request.user)
        booking = services.create_booking(student, serializer.validated_data)
        return APIResponse.created(data=BookingSerializer(booking).data, message="Booking request sent.")


@extend_schema(tags=["Bookings"])
class BookingListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List bookings for the authenticated user")
    def get(self, request):
        from apps.mentors.models import Booking
        user = request.user
        if user.role == "student":
            profile = get_or_create_student_profile(user)
            bookings = Booking.objects.filter(student=profile)
        elif user.role == "mentor":
            profile = services.get_or_create_mentor_profile(user)
            bookings = Booking.objects.filter(mentor=profile)
        else:
            bookings = Booking.objects.all()

        status_filter = request.query_params.get("status")
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        bookings = bookings.select_related("student__user", "mentor__user")
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(bookings, request)
        data = BookingSerializer(page, many=True).data
        return paginator.get_paginated_response(data)


@extend_schema(tags=["Bookings"])
class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get booking detail")
    def get(self, request, booking_id):
        from apps.mentors.models import Booking
        from apps.common.exceptions import ResourceNotFoundError
        try:
            booking = Booking.objects.select_related("student__user", "mentor__user").get(id=booking_id)
        except Booking.DoesNotExist:
            raise ResourceNotFoundError("Booking not found.")
        return APIResponse.success(data=BookingSerializer(booking).data)


@extend_schema(tags=["Bookings"])
class BookingStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Update booking status", request=BookingStatusUpdateSerializer)
    def patch(self, request, booking_id):
        serializer = BookingStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = services.update_booking_status(
            booking_id=booking_id,
            new_status=serializer.validated_data["status"],
            user=request.user,
            notes=serializer.validated_data.get("notes", ""),
            meeting_link=serializer.validated_data.get("meeting_link", ""),
            cancellation_reason=serializer.validated_data.get("cancellation_reason", ""),
        )
        return APIResponse.success(
            data=BookingSerializer(booking).data,
            message=f"Booking {serializer.validated_data['status']}.",
        )


@extend_schema(tags=["Bookings"])
class MentorBookingActionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Perform action (confirm/cancel/decline) on booking")
    def post(self, request, booking_id, action):
        action_map = {
            "confirm": "accepted",
            "accept": "accepted",
            "decline": "rejected",
            "cancel": "cancelled",
            "reject": "rejected",
        }
        target_status = action_map.get(action.lower())
        if not target_status:
            from apps.common.exceptions import ApplicationError
            raise ApplicationError("Invalid booking action.")

        booking = services.update_booking_status(
            booking_id=booking_id,
            new_status=target_status,
            user=request.user,
        )
        return APIResponse.success(
            data=BookingSerializer(booking).data,
            message=f"Booking {action}ed successfully.",
        )



@extend_schema(tags=["Bookings"])
class BookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get booking status history")
    def get(self, request, booking_id):
        from apps.mentors.models import BookingStatusHistory
        history = BookingStatusHistory.objects.filter(booking_id=booking_id)
        return APIResponse.success(data=BookingStatusHistorySerializer(history, many=True).data)


@extend_schema(tags=["Reviews"])
class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Create a review for a completed session", request=ReviewCreateSerializer)
    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = get_or_create_student_profile(request.user)
        review = services.create_review(student, serializer.validated_data)
        return APIResponse.created(data=ReviewSerializer(review).data, message="Review submitted.")


@extend_schema(tags=["Reviews"])
class MentorReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List reviews for a mentor")
    def get(self, request, mentor_id):
        from apps.mentors.models import Review
        reviews = Review.objects.filter(mentor_id=mentor_id).select_related("student__user")
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(reviews, request)
        return paginator.get_paginated_response(ReviewSerializer(page, many=True).data)
