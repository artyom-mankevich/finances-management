from rest_framework.decorators import action
from rest_framework.mixins import (
    RetrieveModelMixin,
    DestroyModelMixin,
    ListModelMixin
)
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from accounts.views import SetUserIdFromTokenOnCreateMixin
from crypto.models import EthKeys
from crypto.serializers import EthKeysSerializer
from crypto.utils import validate_transfer_args, transfer_eth


class EthKeysViewSet(
    GenericViewSet,
    RetrieveModelMixin,
    DestroyModelMixin,
    ListModelMixin,
    SetUserIdFromTokenOnCreateMixin
):
    serializer_class = EthKeysSerializer

    def get_queryset(self):
        return EthKeys.objects.filter(user_id=self.request.user)

    @action(detail=False, methods=["POST"], url_path="transfer", url_name="transfer")
    def transfer(self, request, *args, **kwargs):
        password = request.data.get("password")
        eth_keys_id = request.data.get("eth_keys_id")
        to_address = request.data.get("to_address")
        amount = request.data.get("amount")

        validate_transfer_args(password, eth_keys_id, to_address, amount)
        eth_keys = self.get_queryset().filter(id=eth_keys_id).first()
        if not eth_keys:
            return Response({"error": "EthKeys not found"}, 404)

        transfer_eth(password, eth_keys, to_address, amount)
        return Response({"message": "Transfer successful"}, 200)
