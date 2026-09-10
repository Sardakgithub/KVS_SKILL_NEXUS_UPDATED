"""
Root URL configuration.

All domain APIs are namespaced under /api/v1/ so a future v2 can be
introduced without breaking existing clients. Each app is expected to expose
its own `urls.py` and get included here as it is implemented (Module 2+).
"""
from django.conf import settings
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

api_v1_patterns = [
    path("health/", include("apps.common.health.urls")),
    path("auth/", include("apps.accounts.urls")),
    path("students/", include("apps.students.urls")),
    path("mentors/", include("apps.mentors.urls")),
    path("careers/", include("apps.careers.urls")),
    path("courses/", include("apps.courses.urls")),
    path("assessments/", include("apps.assessments.urls")),
    path("resumes/", include("apps.resumes.urls")),
    path("jobs/", include("apps.jobs.urls")),
    path("certificates/", include("apps.certificates.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("admin-panel/", include("apps.admin_panel.urls")),
    path("analytics/", include("apps.analytics.urls")),
]

urlpatterns = [
    # Redirect root '/' directly to Swagger API docs
    path("", lambda request: redirect("swagger-ui", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
    # OpenAPI schema + interactive documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    if "debug_toolbar" in settings.INSTALLED_APPS:
        urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]