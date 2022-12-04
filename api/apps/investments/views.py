from rest_framework import viewsets

from accounts.views import SetUserIdFromTokenOnCreateMixin
from investments.models import Stock
from investments.serializers import StockSerializer


class StockViewSet(viewsets.ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = StockSerializer

    def get_queryset(self):
        return Stock.objects.all().filter(user_id=self.request.user)
