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
        )

    created_at = serializers.SerializerMethodField()
    amount = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )

    def to_representation(self, instance):
        ticker_code = instance.ticker_id
        data = super().to_representation(instance)
        data["ticker"] = ticker_code
        return data

    def get_created_at(self, obj):
        return obj.created_at.timestamp() * 1000

    def create(self, validated_data):
        ticker = self.validate_ticker(self.initial_data["ticker"])
        validated_data["ticker"] = ticker

        return super().create(validated_data)

    def update(self, instance, validated_data):
        ticker = self.validate_ticker(self.initial_data["ticker"])
        validated_data["ticker"] = ticker

        return super().update(instance, validated_data)

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

        if len(value) > 5:
            raise serializers.ValidationError("Ticker is too long")

        with connection.cursor() as cursor:
            cursor.execute(
                f"INSERT INTO {Ticker._meta.db_table} VALUES(%s) "
                f"ON CONFLICT DO NOTHING",
                [value.upper()]
            )

        value = Ticker.objects.raw(
            f"SELECT * FROM {Ticker._meta.db_table} WHERE code=%s LIMIT 1",
            [value.upper()]
        )[0]
        return value


class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        read_only_fields = ("id", "user_id", "created_at")
        fields = read_only_fields + (
            "balance", "percent", "name", "description"
        )

    created_at = serializers.FloatField(read_only=True)
    balance = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    percent = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    name = serializers.CharField(required=True)
    description = serializers.CharField(required=False)

    def to_representation(self, instance):
        wallet = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
            [instance.wallet_id]
        )[0]
        instance.wallet = wallet
        data = {
            "id": instance.id,
            "user_id": instance.user_id,
            "balance": instance.wallet.balance,
            "currency": instance.wallet.currency_id,
            "percent": instance.percent,
            "color": instance.wallet.color_id,
            "name": instance.wallet.name,
            "description": instance.wallet.description,
            "created_at": timezone.datetime.combine(
                instance.created_at, timezone.datetime.min.time()
            ).timestamp() * 1000,
        }
        return data

    @transaction.atomic
    def create(self, validated_data):
        currency = self.validate_currency(self.initial_data.get("currency"))
        currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code=%s LIMIT 1",
            [currency]
        )[0]

        balance = validated_data.pop("balance")
        name = validated_data.pop("name")
        percent = validated_data.get("percent")
        user_id = str(self.context["request"].user)
        color = self.validate_color(self.initial_data.get("color"))
        color = Color.objects.raw(
            f"SELECT * FROM {Color._meta.db_table} WHERE hex_code=%s LIMIT 1",
            [color]
        )[0]
        description = validated_data.pop("description", "")

        if percent <= 0:
            raise exceptions.ValidationError("Percent must be greater than 0")

        wallet = Wallet(
            user_id=user_id,
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
        currency = self.validate_currency(self.initial_data.get("currency"))
        currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code=%s LIMIT 1",
            [currency]
        )[0]
        balance = validated_data.pop("balance", instance.wallet.balance)
        name = validated_data.pop("name", instance.wallet.name)
        percent = validated_data.get("percent", instance.percent)
        color = self.validate_color(self.initial_data.get("color"))
        color = Color.objects.raw(
            f"SELECT * FROM {Color._meta.db_table} WHERE hex_code=%s LIMIT 1",
            [color]
        )[0]
        description = validated_data.pop("description", instance.wallet.description)

        if percent <= 0:
            raise exceptions.ValidationError("Percent must be greater than 0")

        instance.wallet.currency = currency
        instance.wallet.balance = balance
        instance.wallet.name = name
        instance.wallet.color = color
        instance.wallet.description = description
        instance.wallet.save()

        return super().update(instance, validated_data)

    def validate_currency(self, value):
        if not value:
            raise exceptions.ValidationError("Currency is required")
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT EXISTS(SELECT 1 FROM {Currency._meta.db_table} WHERE code=%s);",
                [value]
            )
            exists = cursor.fetchone()[0]
        if not exists:
            raise exceptions.ValidationError("Invalid currency")
        return value

    def validate_color(self, value):
        if not value:
            raise exceptions.ValidationError("Color is required")
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT EXISTS(SELECT 1 FROM {Color._meta.db_table} WHERE hex_code=%s);",
                [value]
            )
            exists = cursor.fetchone()[0]
        if not exists:
            raise exceptions.ValidationError("Invalid color")
        return value
