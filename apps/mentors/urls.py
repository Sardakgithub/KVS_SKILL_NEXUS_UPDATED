"""URL patterns for mentors — mounted at /api/v1/mentors/."""
from django.urls import path

from apps.mentors import views

app_name = "mentors"

urlpatterns = [
    # Mentor listing & detail
    path("", views.MentorListView.as_view(), name="list"),
    path("<int:mentor_id>/", views.MentorDetailView.as_view(), name="detail"),
    path("<int:mentor_id>/availability/", views.MentorAvailabilityPublicView.as_view(), name="public-availability"),
    path("<int:mentor_id>/reviews/", views.MentorReviewsView.as_view(), name="reviews"),

    # Mentor's own profile & availability
    path("profile/", views.MentorProfileView.as_view(), name="profile"),
    path("availability/", views.MentorAvailabilityView.as_view(), name="availability"),
    path("availability/<int:slot_id>/", views.MentorAvailabilityDetailView.as_view(), name="availability-detail"),

    # Bookings
    path("bookings/", views.BookingListView.as_view(), name="booking-list"),
    path("bookings/my/", views.BookingListView.as_view(), name="booking-my"),
    path("bookings/create/", views.BookingCreateView.as_view(), name="booking-create"),
    path("bookings/<int:booking_id>/", views.BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<int:booking_id>/status/", views.BookingStatusUpdateView.as_view(), name="booking-status"),
    path("bookings/<int:booking_id>/<str:action>/", views.MentorBookingActionView.as_view(), name="booking-action"),
    path("bookings/<int:booking_id>/history/", views.BookingHistoryView.as_view(), name="booking-history"),

    # Reviews
    path("reviews/create/", views.ReviewCreateView.as_view(), name="review-create"),
]
