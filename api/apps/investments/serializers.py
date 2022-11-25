from rest_framework import serializers

from investments.models import Investment, Stock
from wallets.serializers import WalletSerializer


class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        read_only_fields = (
            "id",
            "user_id",
        )
        fields = read_only_fields + (
            "wallet",
            "start_amount",
            "current_amount",
            "percent",
            "name",
            "description",
            "color",
            "currency",
        )

    wallet = WalletSerializer(read_only=True)
    start_amount = serializers.DecimalField(
        max_digits=20, decimal_places=2, coerce_to_string=False
    )
    current_amount = serializers.DecimalField(
        max_digits=20, decimal_places=2, coerce_to_string=False
    )
    percent = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False
    )


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        read_only_fields = (
            "id",
            "user_id",
        )
        fields = read_only_fields + (
            "amount",
            "company",
            "color",
            "description",
            "currency",
        )

    amount = serializers.DecimalField(
        max_digits=20, decimal_places=2, coerce_to_string=False
    )
