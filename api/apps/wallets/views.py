from rest_framework import viewsets

from accounts.views import SetUserIdFromTokenOnCreateMixin
from wallets.models import (
    Currency,
    Wallet,
    Transaction,
    TransactionType,
    TransactionCategory,
    Debt
)
from wallets.serializers import (
    CurrencySerializer,
    ExtendedWalletSerializer,
    TransactionSerializer,
    TransactionTypeSerializer,
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

    def get_queryset(self):
        return Transaction.objects.filter(user_id=self.request.user)


class TransactionTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer


class TransactionCategoryViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = TransactionCategorySerializer

    def get_queryset(self):
        return TransactionCategory.objects.filter(user_id=self.request.user)
