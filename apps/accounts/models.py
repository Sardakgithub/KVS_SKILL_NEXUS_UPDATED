"""
Custom User model for the KVS Skill Nexus platform.

Uses email as the login identifier instead of username. Supports role-based
access control via a `role` choices field. Every other app in the project
references this model through `settings.AUTH_USER_MODEL`.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class Roles(models.TextChoices):
    STUDENT = "student", "Student"
    MENTOR = "mentor", "Mentor"
    ADMIN = "admin", "Admin"


class UserManager(BaseUserManager):
    """Custom manager: email is the unique identifier, not username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email address is required.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Roles.ADMIN)
        extra_fields.setdefault("is_email_verified", True)
        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Platform user. Authenticated via email + password (JWT).
    Role determines which dashboards, endpoints, and data the user can access.
    """

    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.STUDENT)
    phone = models.CharField(max_length=20, blank=True, default="")
    avatar = models.ImageField(upload_to="avatars/%Y/%m/", blank=True, null=True)
    bio = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

    @property
    def is_student(self):
        return self.role == Roles.STUDENT

    @property
    def is_mentor(self):
        return self.role == Roles.MENTOR

    @property
    def is_admin_user(self):
        return self.role == Roles.ADMIN
