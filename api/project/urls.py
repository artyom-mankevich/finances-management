from django.urls import path, include, re_path
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from accounts.views import AccountSettingsViewSet, ChartSettingsViewSet
from crypto.views import EthKeysViewSet
from decorations.views import IconViewSet, ColorViewSet
from investments.views import InvestmentViewSet, StockViewSet
from news.views import NewsFilterViewSet, NewsIndustryViewSet
from project import settings
from wallets.views import (
    WalletViewSet,
    CurrencyViewSet,
    TransactionViewSet,
    TransactionCategoryViewSet,
    DebtViewSet
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

router.register(r"account-settings", AccountSettingsViewSet, basename="account-settings")
router.register(r"chart-settings", ChartSettingsViewSet, basename="chart-settings")

router.register(r"eth-keys", EthKeysViewSet, basename="eth-keys")

router.register(r"icons", IconViewSet, basename="icons")
router.register(r"colors", ColorViewSet, basename="colors")

router.register(r"investments", InvestmentViewSet, basename="investments")
router.register(r"stocks", StockViewSet, basename="stocks")

router.register(r"news-filters", NewsFilterViewSet, basename="news-filters")
router.register(r"news-industries", NewsIndustryViewSet, basename="news-industries")

router.register(r"currencies", CurrencyViewSet, basename="currencies")
router.register(r"wallets", WalletViewSet, basename="wallets")
router.register(r"debts", DebtViewSet, basename="debts")
router.register(r"transactions", TransactionViewSet, basename="transactions")
router.register(
    r"transaction-categories",
    TransactionCategoryViewSet,
    basename="transaction-categories"
)

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
