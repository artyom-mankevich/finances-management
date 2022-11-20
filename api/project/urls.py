from django.urls import path, include, re_path
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from project import settings

schema_view = get_schema_view(
    openapi.Info(
        title="Finances API",
        default_version='v2',
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

router = routers.SimpleRouter()
router.include_root_view = False

urlpatterns = [
    path("v2/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(r'^swagger-ui/$', schema_view.with_ui('swagger', cache_timeout=0),
                name='schema-swagger-ui'),
        re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0),
                name='schema-redoc'),
    ]
