from rest_framework import viewsets

from crypto.models import EthKeys
from crypto.serializers import EthKeysSerializer


class EthKeysViewSet(viewsets.ModelViewSet):
    queryset = EthKeys.objects.all()
    serializer_class = EthKeysSerializer
