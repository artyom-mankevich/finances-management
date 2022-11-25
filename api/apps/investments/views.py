from rest_framework import viewsets

from investments.models import Investment, Stock
from investments.serializers import InvestmentSerializer, StockSerializer


class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        return Investment.objects.all().filter(user_id=self.request.user)


class StockViewSet(viewsets.ModelViewSet):
    serializer_class = StockSerializer

    def get_queryset(self):
        return Stock.objects.all().filter(user_id=self.request.user)
