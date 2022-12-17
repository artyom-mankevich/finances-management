from django.http import Http404
from rest_framework.decorators import action
from rest_framework.mixins import (
    RetrieveModelMixin,
    DestroyModelMixin
)
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from accounts.views import SetUserIdFromTokenOnCreateMixin
from apps.base.views import RawListModelMixin
from crypto.models import EthKeys
from crypto.serializers import EthKeysSerializer
from crypto.utils import (
    validate_transfer_args,
    transfer_eth,
    get_eth_transactions_for_addresses,
    set_eth_balance_for_addresses
)

from base.utils import raw_get_object_or_404


class EthKeysViewSet(
    GenericViewSet,
    RetrieveModelMixin,
    DestroyModelMixin,
    RawListModelMixin,
    SetUserIdFromTokenOnCreateMixin
):
    serializer_class = EthKeysSerializer

    def get_queryset(self):
        return EthKeys.objects.raw(
            f"SELECT * FROM {EthKeys._meta.db_table} WHERE user_id=%s",
            [str(self.request.user)]
        )

    def get_rawqueryset(self):
        return EthKeys.objects.raw(f"SELECT * FROM {EthKeys._meta.db_table} WHERE user_id=%s", [str(self.request.user)])

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        set_eth_balance_for_addresses(response.data)

        return response

    @action(detail=False, methods=["POST"], url_path="transfer", url_name="transfer")
    def transfer(self, request, *args, **kwargs):
        password = request.data.get("password")
        eth_keys_id = request.data.get("eth_keys_id")
        to_address = request.data.get("to_address")
        amount = request.data.get("amount")

        validate_transfer_args(password, eth_keys_id, to_address, amount)
        eth_keys = raw_get_object_or_404(EthKeys, field='id', id=eth_keys_id)

        _hash = transfer_eth(password, eth_keys, to_address, amount)
        return Response({"hash": _hash})

    @action(
        detail=False, methods=["GET"], url_path="transactions", url_name="transactions"
    )
    def transactions(self, request, *args, **kwargs):
        addresses = [wallet.address for wallet in EthKeys.objects.raw(
            f"SELECT id, address FROM {EthKeys._meta.db_table} WHERE user_id=%s", [str(self.request.user)])]
        transactions = get_eth_transactions_for_addresses(addresses)

        return Response(transactions, 200)

    def get_object(self):
        try:
            id = self.kwargs.get("pk")
            if not id:
                raise IndexError
            return EthKeys.objects.raw(f'SELECT * FROM {EthKeys._meta.db_table} WHERE id=%s', [id])[0]
        except IndexError:
            raise Http404("Couldn't find object")
