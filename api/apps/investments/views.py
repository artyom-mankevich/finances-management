from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination

from accounts.views import SetUserIdFromTokenOnCreateMixin
from investments.models import Stock
from investments.serializers import StockSerializer
from investments.utils import set_stock_prices


class StockViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = StockSerializer

    pagination_class = PageNumberPagination

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pagination_class.page_size = 5

    def get_queryset(self):
        return Stock.objects.all().filter(user_id=self.request.user).order_by(
            "-created_at"
        )

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        set_stock_prices(response.data["results"])

        return response
