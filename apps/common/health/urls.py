from django.urls import path

from apps.common.health.views import LivenessView, ReadinessView

app_name = "health"

urlpatterns = [
    path("live/", LivenessView.as_view(), name="liveness"),
    path("ready/", ReadinessView.as_view(), name="readiness"),
]
