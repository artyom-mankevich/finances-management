from rest_framework import serializers

from investments.models import Stock, Ticker


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
        )

    created_at = serializers.SerializerMethodField()
    amount = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    ticker = serializers.CharField(max_length=10)

    def to_representation(self, instance):
        ticker_code = instance.ticker.code
        data = super().to_representation(instance)
        data["ticker"] = ticker_code
        return data

    def get_created_at(self, obj):
        return obj.created_at.timestamp() * 1000

    def validate_amount(self, value):
        if value is None:
            raise serializers.ValidationError("Amount cannot be null")

        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")

        return value

    def validate_ticker(self, value):
        if value is None:
            raise serializers.ValidationError("Ticker cannot be null")
        value = Ticker.objects.get_or_create(code=value.upper())[0]

        return value
