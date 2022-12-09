from django.db.models import QuerySet
from django_filters import CharFilter
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from accounts.views import SetUserIdFromTokenOnCreateMixin
from wallets.models import (
    Currency,
    Wallet,
    Transaction,
    TransactionCategory,
    Debt
)
from wallets.serializers import (
    CurrencySerializer,
    ExtendedWalletSerializer,
    TransactionSerializer,
    TransactionCategorySerializer,
    DebtSerializer,
)
from wallets.utils import get_top_categories


class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer


class WalletViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = ExtendedWalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(user_id=self.request.user)


class DebtViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = DebtSerializer

    def get_queryset(self):
        return Debt.objects.filter(user_id=self.request.user)


class TransactionFilter(FilterSet):
    type = CharFilter(method="filter_type")

    class Meta:
        model = Transaction
        fields = ("category", "target_wallet", "source_wallet", "type")

    def filter_type(self, queryset, name, value):
        if value == "income":
            return queryset.filter(source_wallet=None)
        elif value == "expense":
            return queryset.filter(target_wallet=None)
        elif value == "transfer":
            return queryset.filter(
                source_wallet__isnull=False, target_wallet__isnull=False
            )


class TransactionViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = TransactionSerializer

    filter_backends = (DjangoFilterBackend,)
    filterset_class = TransactionFilter

    pagination_class = PageNumberPagination

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pagination_class.page_size = 15

    def get_queryset(self) -> QuerySet[Transaction]:
        return Transaction.objects.filter(user_id=self.request.user).prefetch_related(
            "category", "target_wallet", "source_wallet"
        ).order_by("-created_at")


class TransactionCategoryViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = TransactionCategorySerializer

    def get_queryset(self):
        return TransactionCategory.objects.filter(user_id=self.request.user).order_by(
            "-created_at"
        )

    @action(detail=False, methods=["GET"], url_path="top", url_name="top")
    def top(self, request, *args, **kwargs):
        response = get_top_categories(self.get_queryset())
        return Response(response)
