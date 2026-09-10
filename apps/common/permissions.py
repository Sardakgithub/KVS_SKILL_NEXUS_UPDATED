"""
Reusable permission classes shared across every app.

Role-based classes assume `request.user.role` (a string/choices field on the
custom user model landing in Module 2, e.g. "student" | "mentor" | "admin").
Building them against a plain attribute - rather than e.g. `is_staff` - is
what lets new roles (Recruiter, Company, College, Super Admin) be added
later purely by extending the `Roles` choices, with zero changes required
here.

Object-level ownership checks (`IsOwner`) are generic: they work for any
model that exposes a `student`, `user`, or `owner` field pointing back to
the requesting user, which is the pattern every domain app in this project
follows.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAuthenticatedAndActive(BasePermission):
    """Baseline permission: authenticated AND not deactivated by an admin."""

    message = "Your account is not active. Please contact support."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_active", True))


class HasRole(BasePermission):
    """
    Generic role-gate. Subclass with `allowed_roles = ("student",)` etc.,
    or instantiate via the `role_required()` factory below.
    """

    allowed_roles: tuple = ()
    message = "You do not have permission to access this resource."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        role = getattr(user, "role", None)
        if user.is_superuser:
            return True
        return role in self.allowed_roles


def role_required(*roles):
    """Factory: `permission_classes = [role_required("student", "mentor")]`."""

    class _RoleRequired(HasRole):
        allowed_roles = roles

    return _RoleRequired


class IsStudent(HasRole):
    allowed_roles = ("student",)


class IsMentor(HasRole):
    allowed_roles = ("mentor",)


class IsAdmin(HasRole):
    allowed_roles = ("admin",)


class IsMentorOrAdmin(HasRole):
    allowed_roles = ("mentor", "admin")


class ReadOnlyOrIsAdmin(BasePermission):
    """Anyone authenticated can read (list/retrieve); only admins can write.

    Common shape for catalog-style resources managed by admins but browsed
    by students/mentors: career paths, courses, jobs, internships, skills.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or getattr(request.user, "role", None) == "admin")
        )


class IsOwner(BasePermission):
    """
    Object-level check: the requesting user must own the object. Checks, in
    order, `obj.user`, `obj.student.user`, `obj.mentor.user`, `obj.owner`.
    Superusers/admins always pass.
    """

    owner_fields = ("user", "student__user", "mentor__user", "owner")
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or getattr(user, "role", None) == "admin":
            return True

        for field_path in self.owner_fields:
            target = obj
            found = True
            for part in field_path.split("__"):
                target = getattr(target, part, None)
                if target is None:
                    found = False
                    break
            if found:
                return target == user
        return False


class IsOwnerOrReadOnly(IsOwner):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return super().has_object_permission(request, view, obj)
