from base.utils import dictfetchall, raw_get_object_or_404
from django.db import connection
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

import base
from base.views import SetUserIdFromTokenOnCreateMixin
from investments.models import Stock, Investment
from investments.serializers import StockSerializer, InvestmentSerializer
from investments.utils import set_stock_prices, get_stocks_chart_data


class StockViewSet(base.views.RawModelViewSet):
    serializer_class = StockSerializer

    def get_rawqueryset(self):
        page = self.request.query_params.get("page")
        if page is not None:
            page = int(page)

        sql_string = f"SELECT * FROM {Stock._meta.db_table} WHERE user_id=%s" \
                     f" ORDER BY created_at DESC"
        sql_string = self._paginate(sql_string, page)

        results = Stock.objects.raw(sql_string, [str(self.request.user)])

        return results

    def get_object(self):
        return raw_get_object_or_404(Stock, field='id', value=self.kwargs['pk'])

    def format_list_response(self, page, results):
        if page is None:
            page = 1

        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*) FROM {Stock._meta.db_table} WHERE user_id=%s;",
                [str(self.request.user)]
            )
            count = cursor.fetchone()[0]

        if count > page * 5:
            next_page = self.reverse_action("list") + f"?page={page + 1}"
        else:
            next_page = None

        if page > 1:
            previous_page = self.reverse_action("list") + f"?page={page - 1}"
        else:
            previous_page = None

        response = {
            "count": count,
            "next": next_page,
            "previous": previous_page,
            "results": results
        }
        return response

    def _paginate(self, sql_string, page):
        limit = 5
        if page is None:
            return sql_string + f" LIMIT {limit};"
        if page < 1:
            page = 1
        offset = (page - 1) * limit
        sql_string += f" LIMIT {limit} OFFSET {offset};"
        return sql_string

    def list(self, request, *args, **kwargs):
        page = request.query_params.get("page")
        if page is not None:
            try:
                page = int(page)
            except ValueError:
                return Response({"error": "Invalid page number"}, status=400)

        results = super().list(request, *args, **kwargs)
        response = self.format_list_response(page, results.data)

        if response["results"]:
            set_stock_prices(response["results"], str(request.user))

        return Response(response)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        set_stock_prices([response.data], str(request.user))

        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        set_stock_prices([response.data], str(request.user))

        return response

    @action(detail=False, methods=["get"], url_path="chart-data", url_name="chart-data")
    def chart_data(self, request, *args, **kwargs):
        period = request.query_params.get("period", Stock.CHART_PERIOD_7_DAYS)
        if period not in Stock.CHART_PERIODS:
            return Response(
                {"error": f"Period {period} is not allowed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT ist.ticker_id as ticker, SUM(ist.amount) as amount"
                f" FROM {Stock._meta.db_table} ist"
                f" WHERE user_id=%s"
                f" GROUP BY ist.ticker_id;",
                [str(self.request.user)],
            )
            stocks = dictfetchall(cursor)

        if stocks:
            stocks_dict = {stock["ticker"]: stock["amount"] for stock in stocks}
            return Response(
                data=get_stocks_chart_data(stocks_dict, period, str(request.user))
            )

        return Response(data={})


class InvestmentViewSet(base.views.RawModelViewSet):
    serializer_class = InvestmentSerializer

    def get_rawqueryset(self):
        return Investment.objects.raw(
            f"SELECT * FROM {Investment._meta.db_table} WHERE user_id=%s"
            f" ORDER BY created_at DESC;",
            [str(self.request.user)]
        )

    def get_object(self):
        return raw_get_object_or_404(Investment, field='id', value=self.kwargs['pk'])
