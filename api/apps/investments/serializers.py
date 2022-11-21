from rest_framework import serializers

from investments.models import Investment, Stock


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
