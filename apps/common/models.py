"""
Abstract base models reused by every domain app.

Every concrete model in the project should inherit from `BaseModel` (or
`UUIDBaseModel` where a non-guessable public identifier is required, e.g.
resources exposed in public URLs such as certificates or job postings)
rather than re-declaring timestamp / active-status / soft-delete fields.
This keeps the schema consistent and avoids duplicated migration logic.
"""
import uuid

from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Adds created_at / updated_at, automatically maintained."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(is_deleted=False)

    def dead(self):
        return self.filter(is_deleted=True)

    def delete(self):
        """Bulk soft-delete instead of removing rows."""
        return self.update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()


class SoftDeleteManager(models.Manager):
    """Default manager only ever returns non-deleted rows.

    Use `all_objects` on a model when deleted rows must be visible (e.g.
    admin audit views).
    """

    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class AllObjectsManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db)


class SoftDeleteModel(models.Model):
    """Marks a row inactive instead of physically deleting it.

    Preserves referential/audit history, which matters for models tied to
    bookings, applications, payments, or anything an admin audit log needs
    to reconstruct later.
    """

    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False, hard=False):
        if hard:
            return super().delete(using=using, keep_parents=keep_parents)
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])
        return None

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=["is_deleted", "deleted_at"])


class BaseModel(TimeStampedModel, SoftDeleteModel):
    """Standard base for the vast majority of domain models.

    Combines timestamps, soft delete, and an `is_active` toggle (distinct
    from soft-delete: `is_active` is a business-level flag an admin can
    control - e.g. deactivating a course - while `is_deleted` represents
    removal from the system).
    """

    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class UUIDBaseModel(BaseModel):
    """Base for models that need a non-sequential public identifier.

    Use for anything referenced in public-facing URLs or shared externally
    (certificates, resumes, job postings) so internal auto-increment IDs are
    never leaked or guessable.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
