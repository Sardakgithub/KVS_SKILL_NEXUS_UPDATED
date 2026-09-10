"""
Pagination classes. All list endpoints use `StandardResultsPagination` by
default (wired in REST_FRAMEWORK settings); a larger page size variant is
available for lightweight resources (e.g. notifications, skills lookup).
"""
from rest_framework.pagination import PageNumberPagination

from apps.common.responses import APIResponse


class StandardResultsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return APIResponse.success(
            data=data,
            message="Success",
            meta={
                "pagination": {
                    "count": self.page.paginator.count,
                    "total_pages": self.page.paginator.num_pages,
                    "current_page": self.page.number,
                    "page_size": self.get_page_size(self.request),
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                }
            },
        )


class LargeResultsPagination(StandardResultsPagination):
    page_size = 50
    max_page_size = 200
