from django.urls import path, include, re_path
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from accounts.views import AccountSettingsViewSet
from crypto.views import EthKeysViewSet
from decorations.views import IconViewSet, ColorViewSet
from investments.views import InvestmentViewSet, StockViewSet
from project import settings
from wallets.views import (
    WalletViewSet,
    CurrencyViewSet,
    TransactionViewSet,
    TransactionTypeViewSet,
    TransactionCategoryViewSet
)

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

router.register(r"account-settings", AccountSettingsViewSet)
router.register(r"eth-keys", EthKeysViewSet)
router.register(r"icon", IconViewSet)
router.register(r"color", ColorViewSet)
router.register(r"investment", InvestmentViewSet)
router.register(r"stock", StockViewSet)
router.register(r"currency", CurrencyViewSet)
router.register(r"wallet", WalletViewSet)
router.register(r"transaction", TransactionViewSet)
router.register(r"transaction-type", TransactionTypeViewSet)
router.register(r"transaction-category", TransactionCategoryViewSet)

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
