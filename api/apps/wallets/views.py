from decimal import Decimal

from django.db import connection

from base.utils import raw_get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

import base.views
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


class CurrencyViewSet(viewsets.GenericViewSet, base.views.RawListModelMixin):
    serializer_class = CurrencySerializer

    def get_rawqueryset(self):
        return Currency.objects.raw(f"SELECT * FROM {Currency._meta.db_table};")


class WalletViewSet(base.views.RawModelViewSet):
    serializer_class = ExtendedWalletSerializer

    def get_rawqueryset(self):
        return Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} ww"
            f" LEFT JOIN {Debt._meta.db_table} wd ON ww.id = wd.wallet_id"
            f" WHERE ww.user_id=%s AND wd.id IS NULL;",
            [str(self.request.user)]
        )

    def get_object(self):
        return raw_get_object_or_404(Wallet, field='id', value=self.kwargs['pk'])

    @action(detail=False, methods=["GET"], url_path="chart-data", url_name="chart_data")
    def chart_data(self, request, *args, **kwargs):
        period = request.query_params.get("period", "7d")
        if period not in WalletLog.CHART_PERIODS:
            return Response(
                {"error": f"Invalid period: {period}"}, status=400
            )

        response = get_wallets_chart_data(period, str(self.request.user))
        return Response(response)


class DebtViewSet(base.views.RawModelViewSet):
    serializer_class = DebtSerializer

    def get_rawqueryset(self):
        return Debt.objects.raw(
            f"SELECT * FROM {Debt._meta.db_table} WHERE user_id=%s;",
            [str(self.request.user)]
        )

    def get_object(self):
        return raw_get_object_or_404(Debt, field='id', value=self.kwargs['pk'])

    @action(
        detail=False,
        methods=["POST"],
        url_path="transactions",
        url_name="transactions"
    )
    def transactions(self, request, *args, **kwargs):
        debt_id = request.data.get("id")
        debt = raw_get_object_or_404(Debt, field="id", value=debt_id)

        amount = request.data.get("amount")
        if amount is None:
            return Response({"amount": "This field is required"}, status=400)
        if type(amount) != float and type(amount) != int:
            return Response({"amount": "This field must be a number"}, status=400)
        if amount <= 0:
            return Response({"amount": "This field must be greater than 0"}, status=400)

        amount = Decimal(str(amount))

        pay_debt(debt, amount)
        debt = raw_get_object_or_404(Debt, field="id", value=debt_id)

        return Response(DebtSerializer(debt).data)


class TransactionViewSet(base.views.RawModelViewSet):
    serializer_class = TransactionSerializer

    def _filter(self, sql_string, _type):
        if _type == "income":
            sql_string += " AND source_wallet_id IS NULL"
        elif _type == "expense":
            sql_string += " AND target_wallet_id IS NULL"
        elif _type == "transfer":
            sql_string += " AND source_wallet_id IS NOT NULL" \
                          " AND target_wallet_id IS NOT NULL"
        return sql_string

    def _paginate(self, sql_string, page):
        if page is None:
            return sql_string + " LIMIT 15;"
        if page < 1:
            page = 1
        limit = 15
        offset = (page - 1) * limit
        sql_string += f" LIMIT {limit} OFFSET {offset};"
        return sql_string

    def get_rawqueryset(self):
        _type = self.request.query_params.get("type")
        page = self.request.query_params.get("page")
        if page is not None:
            page = int(page)

        sql_string = f"SELECT * FROM {Transaction._meta.db_table} WHERE user_id=%s"

        sql_string = self._filter(sql_string, _type)
        sql_string += " ORDER BY created_at DESC"
        sql_string = self._paginate(sql_string, page)

        results = Transaction.objects.raw(sql_string, [str(self.request.user)])

        return results

    def format_list_response(self, page, results, _filter):
        if page is None:
            page = 1

        with connection.cursor() as cursor:
            if _filter == "income":
                filter_str = " AND source_wallet_id IS NULL"
            elif _filter == "expense":
                filter_str = " AND target_wallet_id IS NULL"
            elif _filter == "transfer":
                filter_str = " AND source_wallet_id IS NOT NULL" \
                             " AND target_wallet_id IS NOT NULL"
            else:
                filter_str = ""

            cursor.execute(
                f"SELECT COUNT(*) FROM {Transaction._meta.db_table} WHERE user_id=%s"
                + filter_str + ";",
                [str(self.request.user)]
            )
            count = cursor.fetchone()[0]

        if count > page * 15:
            next_page = self.reverse_action("list") + f"?page={page + 1}"
            next_page += f"&type={_filter}" if _filter else ""
        else:
            next_page = None

        if page > 1:
            previous_page = self.reverse_action("list") + f"?page={page - 1}"
            previous_page += f"&type={_filter}" if _filter else ""
        else:
            previous_page = None
        response = {
            "count": count,
            "next": next_page,
            "previous": previous_page,
            "results": results
        }
        return response

    def get_object(self):
        return raw_get_object_or_404(Transaction, field='id', value=self.kwargs['pk'])

    def list(self, request, *args, **kwargs):
        page = request.query_params.get("page")
        _type = request.query_params.get("type")
        if page is not None:
            try:
                page = int(page)
            except ValueError:
                return Response({"error": "Invalid page number"}, status=400)

        results = super().list(request, *args, **kwargs)
        response = self.format_list_response(page, results.data, _type)

        return Response(response)

    @action(detail=False, methods=["GET"], url_path="chart-data", url_name="chart_data")
    def chart_data(self, request, *args, **kwargs):
        response = get_transactions_chart_data(str(self.request.user))
        return Response(response)


class TransactionCategoryViewSet(base.views.RawModelViewSet):
    serializer_class = TransactionCategorySerializer

    def get_rawqueryset(self):
        return TransactionCategory.objects.raw(
            f"SELECT * FROM {TransactionCategory._meta.db_table} WHERE user_id=%s "
            f" ORDER BY created_at DESC;",
            [str(self.request.user)]
        )

    def get_object(self):
        return raw_get_object_or_404(
            TransactionCategory, field='id', value=self.kwargs['pk']
        )

    @action(detail=False, methods=["GET"], url_path="top", url_name="top")
    def top(self, request, *args, **kwargs):
        response = get_top_categories(str(self.request.user))
        return Response(response)
