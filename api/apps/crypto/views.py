from rest_framework.generics import RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.viewsets import GenericViewSet

from crypto.models import EthKeys
from crypto.serializers import EthKeysSerializer


class EthKeysViewSet(GenericViewSet, RetrieveUpdateDestroyAPIView, CreateAPIView):
    queryset = EthKeys.objects.all()
    serializer_class = EthKeysSerializer
