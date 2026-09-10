"""URL patterns for accounts/authentication — mounted at /api/v1/auth/."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", views.CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("verify-email/", views.EmailVerifyView.as_view(), name="verify-email"),
    path("forgot-password/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
]
