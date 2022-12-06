from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination

from accounts.views import SetUserIdFromTokenOnCreateMixin
from investments.models import Stock
from investments.serializers import StockSerializer


class StockViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = StockSerializer

    pagination_class = PageNumberPagination
    pagination_class.page_size = 10

    def get_queryset(self):
        return Stock.objects.all().filter(user_id=self.request.user)
