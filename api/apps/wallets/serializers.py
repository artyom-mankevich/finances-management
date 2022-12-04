from datetime import datetime

from rest_framework import serializers

from wallets.models import (
    Currency, Wallet, Transaction, TransactionCategory, Debt
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
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    goal = serializers.DecimalField(
        max_digits=30,
        decimal_places=10,
        coerce_to_string=False,
        required=False,
        allow_null=True
    )


class ExtendedWalletSerializer(WalletSerializer):
    class Meta(WalletSerializer.Meta):
        read_only_fields = WalletSerializer.Meta.read_only_fields + ("last_updated",)
        fields = read_only_fields + WalletSerializer.Meta.fields

    last_updated = serializers.SerializerMethodField()

    def get_last_updated(self, obj: Wallet) -> float | None:
        if obj.last_updated:
            return obj.last_updated.timestamp() * 1000

        return None


class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        read_only_fields = ("id", "user_id", "wallet")
        fields = read_only_fields + ("expires_at",)

    wallet = WalletSerializer(read_only=True)
    expires_at = serializers.SerializerMethodField()

    def get_expires_at(self, obj: Debt) -> float:
        return datetime.combine(obj.expires_at, datetime.min.time()).timestamp() * 1000


class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + ("name", "icon", "color",)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        read_only_fields = ("id", "user_id", "created_at",)
        fields = read_only_fields + (
            "category",
            "source_amount",
            "target_amount",
            "source_wallet",
            "target_wallet",
            "description",
        )

    created_at = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    source_amount = serializers.DecimalField(
        max_digits=30,
        decimal_places=10,
        coerce_to_string=False,
        required=False,
        allow_null=True
    )
    target_amount = serializers.DecimalField(
        max_digits=30,
        decimal_places=10,
        coerce_to_string=False,
        required=False,
        allow_null=True
    )
    source_wallet = serializers.SerializerMethodField()
    target_wallet = serializers.SerializerMethodField()

    def get_created_at(self, obj: Transaction) -> float:
        return datetime.combine(obj.created_at, datetime.min.time()).timestamp() * 1000

    def get_category(self, obj):
        if obj.category:
            return TransactionCategorySerializer(obj.category).data
        return None

    def get_source_wallet(self, obj):
        if obj.source_wallet:
            return WalletSerializer(obj.source_wallet).data
        return None

    def get_target_wallet(self, obj):
        if obj.target_wallet:
            return WalletSerializer(obj.target_wallet).data
        return None

    def create(self, validated_data):
        if self.initial_data.get("category"):
            validated_data["category"] = TransactionCategory.objects.get(
                pk=self.initial_data["category"]
            )
        if self.initial_data.get("source_wallet"):
            validated_data["source_wallet"] = Wallet.objects.get(
                pk=self.initial_data["source_wallet"]
            )
        if self.initial_data.get("target_wallet"):
            validated_data["target_wallet"] = Wallet.objects.get(
                pk=self.initial_data["target_wallet"]
            )

        return super().create(validated_data)

    def validate(self, data):
        if not (
            self.initial_data.get("source_wallet")
            or self.initial_data.get("target_wallet")
        ):
            raise serializers.ValidationError(
                {
                    "source_wallet": "At least one wallet should be specified",
                    "target_wallet": "At least one wallet should be specified"
                }
            )

        if not (
            self.initial_data.get("source_amount")
            or self.initial_data.get("target_amount")
        ):
            raise serializers.ValidationError(
                {
                    "source_amount": "At least one amount should be specified",
                    "target_amount": "At least one amount should be specified"
                }
            )

        self._validate_expense()
        self._validate_income()
        self._validate_transfer()

        return data

    def validate_source_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Source amount must be greater than 0")

        return value

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0")

        return value

    def validate_source_wallet(self, value):
        user_id = self.context["request"].user

        if not Wallet.objects.filter(pk=value, user_id=user_id).exists():
            raise serializers.ValidationError(
                {"source_wallet": f"Wallet '{value}' does not exist"}
            )

        return value

    def validate_target_wallet(self, value):
        user_id = self.context["request"].user

        if not Wallet.objects.filter(pk=value, user_id=user_id).exists():
            raise serializers.ValidationError(
                {"target_wallet": f"Wallet '{value}' does not exist"}
            )

        return value

    def validate_category(self, value):
        user_id = self.context["request"].user

        if not TransactionCategory.objects.filter(pk=value, user_id=user_id).exists():
            raise serializers.ValidationError(
                {"category": f"Transaction category '{value}' does not exist"}
            )

        return value

    def _validate_expense(self):
        if (
            self.initial_data.get("source_wallet")
            and not self.initial_data.get("source_amount")
        ):
            raise serializers.ValidationError(
                {"source_amount": "Source amount should be specified"}
            )
        if (
            self.initial_data.get("source_amount")
            and not self.initial_data.get("source_wallet")
        ):
            raise serializers.ValidationError(
                {"source_wallet": "Source wallet should be specified"}
            )
        if (
            self.initial_data.get("source_wallet")
            and not self.initial_data.get("target_wallet")
            and not self.initial_data.get("category")
        ):
            raise serializers.ValidationError(
                {"category": "Category should be specified"}
            )

    def _validate_income(self):
        if (
            self.initial_data.get("target_wallet")
            and not self.initial_data.get("target_amount")
        ):
            raise serializers.ValidationError(
                {"target_amount": "Target amount should be specified"}
            )
        if (
            self.initial_data.get("target_amount")
            and not self.initial_data.get("target_wallet")
        ):
            raise serializers.ValidationError(
                {"target_wallet": "Target wallet should be specified"}
            )
        if (
            self.initial_data.get("target_wallet")
            and not self.initial_data.get("source_wallet")
            and not self.initial_data.get("category")
        ):
            raise serializers.ValidationError(
                {"category": "Category should be specified"}
            )

    def _validate_transfer(self):
        if (
            self.initial_data.get("source_wallet")
            and self.initial_data.get("target_wallet")
            and not self.initial_data.get("source_amount")
            and not self.initial_data.get("target_amount")
        ):
            raise serializers.ValidationError(
                {
                    "source_amount": "Source amount should be specified",
                    "target_amount": "Target amount should be specified"
                }
            )
        if (
            self.initial_data.get("source_wallet")
            and self.initial_data.get("target_wallet")
            and self.initial_data["source_wallet"] == self.initial_data["target_wallet"]
        ):
            raise serializers.ValidationError(
                {
                    "source_wallet": "Source wallet should not be equal to target wallet",
                    "target_wallet": "Target wallet should not be equal to source wallet"
                }
            )
        if (
            self.initial_data.get("source_wallet")
            and self.initial_data.get("target_wallet")
            and self.initial_data.get("category")
        ):
            raise serializers.ValidationError(
                {"category": "Category should not be specified during transfer"}
            )
