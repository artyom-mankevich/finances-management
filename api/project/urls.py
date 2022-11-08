from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework import routers
from rest_framework.schemas import get_schema_view

from project import settings

router = routers.SimpleRouter()
router.include_root_view = False

urlpatterns = [
    path("v2/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += [
        path(
            "openapi-schema/",
            get_schema_view(
                title="Finances API",
                description="API for all things …",
                version="1.0.0",
                permission_classes=[],
                authentication_classes=[],
            ),
            name="openapi-schema",
        ),
        path(
            "swagger-ui/",
            TemplateView.as_view(
                template_name="templates/swagger-ui.html",
                extra_context={"schema_url": "openapi-schema"}
            ),
            name="swagger-ui"
        ),
    ]
