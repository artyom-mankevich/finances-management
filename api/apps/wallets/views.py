from decimal import Decimal

from django.db.models import QuerySet
from django_filters import CharFilter
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from accounts.views import SetUserIdFromTokenOnCreateMixin
from wallets.models import (
    Currency,
    Wallet,
    Transaction,
    TransactionCategory,
    Debt,
    WalletLog
)
from wallets.serializers import (
    CurrencySerializer,
    ExtendedWalletSerializer,
    TransactionSerializer,
    TransactionCategorySerializer,
    DebtSerializer,
)
from wallets.utils import (
    get_top_categories,
    get_wallets_chart_data,
    get_transactions_chart_data,
    pay_debt
)


class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer


class WalletViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = ExtendedWalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(user_id=self.request.user, debt__isnull=True)

    @action(detail=False, methods=["GET"], url_path="chart-data", url_name="chart_data")
    def chart_data(self, request, *args, **kwargs):
        period = request.query_params.get("period", "7d")
        if period not in WalletLog.CHART_PERIODS:
            return Response(
                {"error": f"Invalid period: {period}"}, status=400
            )

        response = get_wallets_chart_data(period, str(self.request.user))
        return Response(response)


class DebtViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = DebtSerializer

    def get_queryset(self):
        return Debt.objects.filter(user_id=self.request.user)

    @action(
        detail=False,
        methods=["POST"],
        url_path="transactions",
        url_name="transactions"
    )
    def transactions(self, request, *args, **kwargs):
        debt_id = request.data.get("id")
        debt = get_object_or_404(Debt, id=debt_id, user_id=self.request.user)

        amount = request.data.get("amount")
        if amount is None:
            return Response({"amount": "This field is required"}, status=400)
        if type(amount) != float and type(amount) != int:
            return Response({"amount": "This field must be a number"}, status=400)
        if amount <= 0:
            return Response({"amount": "This field must be greater than 0"}, status=400)

        amount = Decimal(str(amount))

        pay_debt(debt, amount)
        debt.refresh_from_db()

        return Response(DebtSerializer(debt).data)


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

    @action(detail=False, methods=["GET"], url_path="chart-data", url_name="chart_data")
    def chart_data(self, request, *args, **kwargs):
        response = get_transactions_chart_data(str(self.request.user))
        return Response(response)


class TransactionCategoryViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = TransactionCategorySerializer

    def get_queryset(self):
        return TransactionCategory.objects.filter(user_id=self.request.user).order_by(
            "-created_at"
        )

    @action(detail=False, methods=["GET"], url_path="top", url_name="top")
    def top(self, request, *args, **kwargs):
        response = get_top_categories(self.get_queryset(), str(self.request.user))
        return Response(response)
