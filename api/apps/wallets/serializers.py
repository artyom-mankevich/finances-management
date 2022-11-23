from rest_framework import serializers

from wallets.models import (
    Currency, Wallet, Transaction, TransactionType, TransactionCategory, Debt
)


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        read_only_fields = ("code", "name", "icon")
        fields = read_only_fields


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + (
            "currency", "balance", "name", "description", "color", "goal",
        )


class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        read_only_fields = ("id", "user_id", "wallet")
        fields = read_only_fields + ("expires_at",)


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


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        read_only_fields = ("income", "icon",)
        fields = read_only_fields


class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + ("name", "icon", "color", "currency",)
