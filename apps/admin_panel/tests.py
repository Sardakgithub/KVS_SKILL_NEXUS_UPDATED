from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.mentors.models import MentorProfile

User = get_user_model()


class AdminPanelTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "Password123!"

        # Admin user
        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            password=self.password,
            first_name="Admin",
            last_name="User",
            role="admin",
            is_email_verified=True,
        )

        # Student user
        self.student = User.objects.create_user(
            email="student@example.com",
            password=self.password,
            first_name="John",
            last_name="Student",
            role="student",
            is_email_verified=True,
        )

        # Mentor user
        self.mentor_user = User.objects.create_user(
            email="mentor@example.com",
            password=self.password,
            first_name="Jane",
            last_name="Mentor",
            role="mentor",
            is_email_verified=True,
        )
        self.mentor_profile = MentorProfile.objects.create(
            user=self.mentor_user,
            company="Tech Corp",
            job_title="Lead Architect",
            is_approved=False,
        )

        # Authenticate as admin
        self.client.force_authenticate(user=self.admin)

    def test_admin_dashboard_metrics(self):
        response = self.client.get("/api/v1/admin-panel/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("data", response.data)
        self.assertEqual(response.data["data"]["total_users"], 3)

    def test_system_health_endpoint(self):
        response = self.client.get("/api/v1/admin-panel/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["db_status"], "healthy")

    def test_admin_user_list_and_search(self):
        response = self.client.get("/api/v1/admin-panel/users/?search=John")
        self.assertEqual(response.status_code, 200)
        results = response.data["data"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["email"], "student@example.com")

    def test_toggle_user_status(self):
        response = self.client.patch(
            f"/api/v1/admin-panel/users/{self.student.id}/status/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_active)

    def test_send_broadcast_notification(self):
        response = self.client.post(
            "/api/v1/admin-panel/broadcast/",
            {"title": "Platform Maintenance", "message": "System update scheduled tonight.", "target_role": "all"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
