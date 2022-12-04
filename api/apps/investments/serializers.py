from rest_framework import serializers

from investments.models import Stock


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        read_only_fields = (
            "id",
            "user_id",
            "created_at",
        )
        fields = read_only_fields + (
            "amount",
            "ticker",
            "color",
            "description",
        )

    created_at = serializers.SerializerMethodField()
    amount = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )

    def get_created_at(self, obj):
        return obj.created_at.timestamp() * 1000
