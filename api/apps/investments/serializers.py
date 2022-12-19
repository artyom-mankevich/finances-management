from django.db import transaction, connection
from django.utils import timezone

from decorations.models import Color
from rest_framework import serializers, exceptions
from wallets.models import Currency, Wallet

from investments.models import Stock, Ticker, Investment


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
            raise serializers.ValidationError(
                "Amount must be greater than zero")

        return value

    def validate_ticker(self, value):
        if value is None:
            raise serializers.ValidationError("Ticker cannot be null")

        with connection.cursor() as cursor:
            cursor.execute(f"INSERT INTO {Ticker._meta.db_table} VALUES(%s) "
                           f"ON CONFLICT DO NOTHING", [value.upper()]
                           )

        value = Ticker.objects.raw(f"SELECT * FROM {Ticker._meta.db_table} "
                                   f"WHERE code=%s LIMIT 1", [value.upper()])[0]
        return value


class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        read_only_fields = ("id", "user_id", "created_at")
        fields = read_only_fields + (
            "balance", "currency", "percent", "color", "name", "description"
        )

    created_at = serializers.FloatField(read_only=True)
    balance = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), required=True
    )
    percent = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    color = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), required=False
    )
    name = serializers.CharField(required=True)
    description = serializers.CharField(required=False)

    def to_representation(self, instance):
        data = {
            "id": instance.id,
            "user_id": instance.user_id,
            "balance": instance.wallet.balance,
            "currency": instance.wallet.currency.code,
            "percent": instance.percent,
            "color": instance.wallet.color.hex_code,
            "name": instance.wallet.name,
            "description": instance.wallet.description,
            "created_at": timezone.datetime.combine(
                instance.created_at, timezone.datetime.min.time()
            ).timestamp() * 1000,
        }
        return data

    @transaction.atomic
    def create(self, validated_data):
        currency = validated_data.pop("currency")
        balance = validated_data.pop("balance")
        name = validated_data.pop("name")
        percent = validated_data.get("percent")
        user_id = str(self.context["request"].user)
        color = validated_data.pop("color",
                                   Color.objects.raw(
                                       f"SELECT * FROM {Color._meta.db_table} "
                                       f"LIMIT 1")[0]
                                   )
        description = validated_data.pop("description", "")

        if percent <= 0:
            raise exceptions.ValidationError("Percent must be greater than 0")

        wallet = Wallet(user_id=user_id,
                        currency=currency,
                        balance=balance,
                        name=name,
                        color=color,
                        description=description,
                        )
        wallet.save()
        validated_data["wallet"] = wallet

        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        currency = validated_data.pop("currency", instance.wallet.currency)
        balance = validated_data.pop("balance", instance.wallet.balance)
        name = validated_data.pop("name", instance.wallet.name)
        percent = validated_data.get("percent", instance.percent)
        color = validated_data.pop("color", instance.wallet.color)
        description = validated_data.pop("description",
                                         instance.wallet.description)

        if percent <= 0:
            raise exceptions.ValidationError("Percent must be greater than 0")

        instance.wallet.currency = currency
        instance.wallet.balance = balance
        instance.wallet.name = name
        instance.wallet.color = color
        instance.wallet.description = description
        instance.wallet.save()

        return super().update(instance, validated_data)
