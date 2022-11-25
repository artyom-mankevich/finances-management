from rest_framework import viewsets

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
    WalletSerializer,
    TransactionSerializer,
    TransactionTypeSerializer,
    TransactionCategorySerializer,
    DebtSerializer
)


class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer


class WalletViewSet(viewsets.ModelViewSet):
    serializer_class = WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(user_id=self.request.user)


class DebtViewSet(viewsets.ModelViewSet):
    serializer_class = DebtSerializer

    def get_queryset(self):
        return Debt.objects.filter(user_id=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user_id=self.request.user)


class TransactionTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer


class TransactionCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionCategorySerializer

    def get_queryset(self):
        return TransactionCategory.objects.filter(user_id=self.request.user)
