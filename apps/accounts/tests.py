from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class JWTCookieAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "Password123!"
        self.student = User.objects.create_user(
            email="student@example.com",
            password=self.password,
            first_name="Test",
            last_name="Student",
            role="student",
            is_email_verified=True,
        )
        self.mentor = User.objects.create_user(
            email="mentor@example.com",
            password=self.password,
            first_name="Test",
            last_name="Mentor",
            role="mentor",
            is_email_verified=True,
        )

    def test_login_sets_cookies(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "student@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)
        self.assertIn("user_role", response.cookies)
        self.assertEqual(response.cookies["user_role"].value, "student")

    def test_authenticated_profile_access_with_cookie(self):
        login_res = self.client.post(
            "/api/v1/auth/login/",
            {"email": "mentor@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(login_res.status_code, 200)

        # Send request without Authorization header, relying on cookie set during login
        profile_res = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(profile_res.status_code, 200)
        self.assertEqual(profile_res.data["data"]["email"], "mentor@example.com")
        self.assertEqual(profile_res.data["data"]["role"], "mentor")

    def test_token_refresh_using_cookie(self):
        login_res = self.client.post(
            "/api/v1/auth/login/",
            {"email": "student@example.com", "password": self.password},
            format="json",
        )
        self.assertEqual(login_res.status_code, 200)

        refresh_res = self.client.post("/api/v1/auth/token/refresh/", {}, format="json")
        self.assertEqual(refresh_res.status_code, 200)
        self.assertIn("access_token", refresh_res.cookies)

    def test_logout_clears_cookies(self):
        self.client.post(
            "/api/v1/auth/login/",
            {"email": "student@example.com", "password": self.password},
            format="json",
        )
        logout_res = self.client.post("/api/v1/auth/logout/", {}, format="json")
        self.assertEqual(logout_res.status_code, 200)

        profile_res = self.client.get("/api/v1/auth/profile/")
        self.assertEqual(profile_res.status_code, 401)
