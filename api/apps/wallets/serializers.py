from datetime import datetime

from django.db.models import Q
from rest_framework import serializers

from wallets.models import (
    Currency, Wallet, Transaction, TransactionType, TransactionCategory, Debt
)


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        read_only_fields = ("code", "name",)
        fields = read_only_fields


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + ("currency", "balance", "name", "color", "goal",)

    currency = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(), required=True
    )
    balance = serializers.DecimalField(
        max_digits=20, decimal_places=2, coerce_to_string=False
    )
    goal = serializers.DecimalField(
        max_digits=20, decimal_places=2, coerce_to_string=False, required=False
    )


class ExtendedWalletSerializer(WalletSerializer):
    class Meta(WalletSerializer.Meta):
        read_only_fields = WalletSerializer.Meta.read_only_fields + ("last_updated",)
        fields = read_only_fields + WalletSerializer.Meta.fields

    last_updated = serializers.SerializerMethodField()

    def get_last_updated(self, obj: Wallet) -> float | None:
        latest_transaction = Transaction.objects.filter(
            Q(source_wallet=obj) | Q(target_wallet=obj)
        ).latest("created_at")
        if latest_transaction:
            return latest_transaction.created_at.timestamp()

        return None


class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        read_only_fields = ("id", "user_id", "wallet")
        fields = read_only_fields + ("expires_at",)

    wallet = WalletSerializer(read_only=True)
    expires_at = serializers.SerializerMethodField()

    def get_expires_at(self, obj: Debt) -> float:
        return datetime.combine(obj.expires_at, datetime.min.time()).timestamp()


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        read_only_fields = ("id", "income", "icon",)
        fields = read_only_fields


class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + ("name", "icon", "color", "currency",)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        read_only_fields = ("id", "user_id", "created_at",)
        fields = read_only_fields + (
            "type",
            "category",
            "amount",
            "currency",
            "source_wallet",
            "target_wallet",
            "description",
        )

    created_at = serializers.SerializerMethodField()
    type = TransactionTypeSerializer()
    category = TransactionCategorySerializer()
    amount = serializers.DecimalField(
        max_digits=20, decimal_places=2, coerce_to_string=False
    )
    source_wallet = WalletSerializer()
    target_wallet = WalletSerializer()

    def get_created_at(self, obj: Transaction) -> float:
        return datetime.combine(obj.created_at, datetime.min.time()).timestamp()
