from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination

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


class TransactionViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = TransactionSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("category", "target_wallet", "source_wallet")
    pagination_class = PageNumberPagination
    pagination_class.page_size = 15

    def get_queryset(self) -> QuerySet[Transaction]:
        return Transaction.objects.filter(user_id=self.request.user).prefetch_related(
            "category", "target_wallet", "source_wallet"
        ).order_by("-created_at")


class TransactionCategoryViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = TransactionCategorySerializer

    def get_queryset(self):
        return TransactionCategory.objects.filter(user_id=self.request.user)
