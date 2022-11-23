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
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer


class DebtViewSet(viewsets.ModelViewSet):
    queryset = Debt.objects.all()
    serializer_class = DebtSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class TransactionTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer


class TransactionCategoryViewSet(viewsets.ModelViewSet):
    queryset = TransactionCategory.objects.all()
    serializer_class = TransactionCategorySerializer
