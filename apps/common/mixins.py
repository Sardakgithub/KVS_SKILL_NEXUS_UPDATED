"""
Reusable mixins for views/viewsets. Views should stay thin: validate the
request via a serializer, delegate the actual work to a service function,
and format the result with APIResponse. These mixins remove the response
boilerplate so that pattern is easy to follow consistently across apps.
"""
from rest_framework import status
from rest_framework.viewsets import GenericViewSet

from apps.common.responses import APIResponse


class APIResponseMixin:
    """
    Overrides ModelViewSet's default actions to return the standard
    envelope. Pair with `StandardResultsPagination` (already the DRF
    default) so list endpoints are enveloped consistently too.
    """

    success_messages = {
        "create": "Created successfully",
        "list": "Fetched successfully",
        "retrieve": "Fetched successfully",
        "update": "Updated successfully",
        "partial_update": "Updated successfully",
        "destroy": "Deleted successfully",
    }

    def _message(self, action):
        return self.success_messages.get(action, "Success")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return APIResponse.created(data=serializer.data, message=self._message("create"))

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message=self._message("list"))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(data=serializer.data, message=self._message("retrieve"))

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        action = "partial_update" if partial else "update"
        return APIResponse.success(data=serializer.data, message=self._message(action))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return APIResponse.no_content(message=self._message("destroy"))


class BaseModelViewSet(APIResponseMixin, GenericViewSet):
    """Compose with the relevant DRF mixins, e.g.:

        class SkillViewSet(BaseModelViewSet, mixins.ListModelMixin,
                            mixins.CreateModelMixin, mixins.RetrieveModelMixin):
            ...

    Kept as composition rather than inheriting ModelViewSet directly so each
    app only exposes the actions its business rules actually allow (e.g.
    students should never get a bare `destroy` on assessment results).
    """

    pass


class QueryOptimizationMixin:
    """
    Declarative select_related/prefetch_related so N+1 queries are avoided
    by convention rather than by remembering to do it per-view.

    class MentorViewSet(QueryOptimizationMixin, BaseModelViewSet, ...):
        select_related_fields = ("user",)
        prefetch_related_fields = ("skills", "availability_slots")
    """

    select_related_fields: tuple = ()
    prefetch_related_fields: tuple = ()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.select_related_fields:
            queryset = queryset.select_related(*self.select_related_fields)
        if self.prefetch_related_fields:
            queryset = queryset.prefetch_related(*self.prefetch_related_fields)
        return queryset


class SoftDeleteDestroyMixin:
    """Override destroy behavior to soft-delete instead of removing rows."""

    def perform_destroy(self, instance):
        instance.delete()  # BaseModel.delete() soft-deletes by default


class CreatedByMixin:
    """Auto-stamp the authenticated user on create, e.g. for audit-logged resources."""

    created_by_field = "created_by"

    def perform_create(self, serializer):
        serializer.save(**{self.created_by_field: self.request.user})
