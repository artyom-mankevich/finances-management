from datetime import datetime

from django.db import transaction, connection
from django.utils import timezone

from decorations.models import Color, Icon
from rest_framework import serializers, exceptions

from wallets.models import Currency, Wallet, Transaction, TransactionCategory, Debt


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        read_only_fields = ("code", "name",)
        fields = read_only_fields


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + (
            "balance", "name", "color", "goal", "description"
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["currency"] = instance.currency_id
        return data

    def create(self, validated_data):
        currency = self.validate_currency(self.initial_data["currency"])
        currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code=%s LIMIT 1",
            [currency]
        )[0]
        validated_data["currency"] = currency

        return super().create(validated_data)

    def update(self, instance, validated_data):
        currency = self.validate_currency(self.initial_data["currency"])
        currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code=%s LIMIT 1",
            [currency]
        )[0]
        validated_data["currency"] = currency

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
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + (
            "expires_at", "balance", "name", "goal", "description"
        )

    expires_at = serializers.FloatField(required=True)
    balance = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    name = serializers.CharField(required=True)
    goal = serializers.DecimalField(
        max_digits=30, decimal_places=10, coerce_to_string=False
    )
    description = serializers.CharField(required=False, allow_blank=True)

    def to_representation(self, instance):
        wallet = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
            [instance.wallet_id]
        )[0]
        instance.wallet = wallet
        data = {
            "id": instance.id,
            "user_id": instance.user_id,
            "expires_at": instance.expires_at,
            "currency": instance.wallet.currency_id,
            "balance": instance.wallet.balance,
            "name": instance.wallet.name,
            "goal": instance.wallet.goal,
            "description": instance.wallet.description,
        }
        if instance.expires_at:
            data["expires_at"] = timezone.datetime.combine(
                instance.expires_at, timezone.datetime.min.time()
            ).timestamp() * 1000
        return data

    @transaction.atomic
    def create(self, validated_data):
        currency = self.validate_currency(self.initial_data["currency"])
        currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code=%s LIMIT 1",
            [currency]
        )[0]
        balance = validated_data.pop("balance")
        name = validated_data.pop("name")
        goal = validated_data.pop("goal")
        description = validated_data.pop("description", "")
        user_id = str(self.context["request"].user)

        if goal <= 0:
            raise exceptions.ValidationError("Goal must be greater than 0")

        color = Color.objects.raw(
            f"SELECT * FROM {Color._meta.db_table} LIMIT 1",
        )[0]

        wallet = Wallet.objects.create(
            user_id=user_id,
            currency=currency,
            balance=balance,
            name=name,
            goal=goal,
            color=color,
            description=description,
        )
        validated_data["wallet"] = wallet

        validated_data["expires_at"] = timezone.datetime.fromtimestamp(
            validated_data["expires_at"] / 1000
        ).date()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        currency = self.validate_currency(self.initial_data["currency"])
        currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code=%s LIMIT 1",
            [currency]
        )[0]
        balance = validated_data.pop("balance", instance.wallet.balance)
        name = validated_data.pop("name", instance.wallet.name)
        goal = validated_data.pop("goal", instance.wallet.goal)
        description = validated_data.pop("description", instance.wallet.description)

        instance.wallet.currency = currency
        instance.wallet.balance = balance
        instance.wallet.name = name
        instance.wallet.goal = goal
        instance.wallet.description = description
        instance.wallet.save()

        validated_data["expires_at"] = timezone.datetime.fromtimestamp(
            validated_data["expires_at"] / 1000
        ).date()

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


class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + ("name",)

    def to_representation(self, instance):
        data = {
            "id": instance.id,
            "user_id": instance.user_id,
            "name": instance.name,
            "icon": instance.icon_id,
            "color": instance.color_id,
        }
        return data

    def create(self, validated_data):
        icon = self.validate_icon(self.initial_data["icon"])
        icon = Icon.objects.raw(
            f"SELECT * FROM {Icon._meta.db_table} WHERE code=%s LIMIT 1",
            [icon]
        )[0]
        color = self.validate_color(self.initial_data["color"])
        color = Color.objects.raw(
            f"SELECT * FROM {Color._meta.db_table} WHERE hex_code=%s LIMIT 1",
            [color]
        )[0]

        validated_data["icon"] = icon
        validated_data["color"] = color

        return super().create(validated_data)

    def update(self, instance, validated_data):
        icon = self.validate_icon(self.initial_data["icon"])
        icon = Icon.objects.raw(
            f"SELECT * FROM {Icon._meta.db_table} WHERE code=%s LIMIT 1",
            [icon]
        )[0]
        color = self.validate_color(self.initial_data["color"])
        color = Color.objects.raw(
            f"SELECT * FROM {Color._meta.db_table} WHERE hex_code=%s LIMIT 1",
            [color]
        )[0]

        instance.icon = icon
        instance.color = color
        instance.save()

        return super().update(instance, validated_data)

    def validate_icon(self, value):
        if not value:
            raise exceptions.ValidationError("Icon is required")
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT EXISTS(SELECT 1 FROM {Icon._meta.db_table} WHERE code=%s);",
                [value]
            )
            exists = cursor.fetchone()[0]
        if not exists:
            raise exceptions.ValidationError("Invalid icon")
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


class ExtendedTransactionCategorySerializer(TransactionCategorySerializer):
    class Meta(TransactionCategorySerializer.Meta):
        read_only_fields = TransactionCategorySerializer.Meta.read_only_fields + (
            "total",
        )
        fields = read_only_fields + TransactionCategorySerializer.Meta.fields

    total = serializers.SerializerMethodField()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["total"] = self.get_total(instance)
        return data

    def get_total(self, obj: TransactionCategory) -> float:
        if getattr(obj, "total", None) is not None:
            return obj.total


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        read_only_fields = ("id", "user_id", "created_at",)
        fields = read_only_fields + (
            "source_amount",
            "target_amount",
            "description",
        )

    created_at = serializers.FloatField(read_only=True)
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

    def to_representation(self, instance):
        instance.created_at = datetime.combine(
            instance.created_at, datetime.min.time()
        ).timestamp() * 1000 if instance.created_at else None
        data = super().to_representation(instance)

        if instance.category_id:
            instance.category = TransactionCategory.objects.raw(
                f"SELECT * FROM {TransactionCategory._meta.db_table} WHERE id=%s LIMIT 1",
                [instance.category_id]
            )[0]
        data["category"] = TransactionCategorySerializer(
            instance.category
        ).data if instance.category else None

        instance.source_wallet = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
            [instance.source_wallet_id]
        )[0] if instance.source_wallet_id else None
        data["source_wallet"] = WalletSerializer(
            instance.source_wallet
        ).data if instance.source_wallet else None

        instance.target_wallet = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
            [instance.target_wallet_id]
        )[0] if instance.target_wallet_id else None
        data["target_wallet"] = WalletSerializer(
            instance.target_wallet
        ).data if instance.target_wallet else None

        return data

    def create(self, validated_data):
        source_wallet = self.validate_source_wallet(
            self.initial_data["source_wallet"]
        )
        if source_wallet:
            source_wallet = Wallet.objects.raw(
                f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
                [source_wallet]
            )[0]
            validated_data["source_wallet"] = source_wallet

        target_wallet = self.validate_target_wallet(
            self.initial_data["target_wallet"]
        )
        if target_wallet:
            target_wallet = Wallet.objects.raw(
                f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
                [target_wallet]
            )[0]
            validated_data["target_wallet"] = target_wallet

        category = self.validate_category(self.initial_data["category"])
        if category:
            category = TransactionCategory.objects.raw(
                f"SELECT * FROM {TransactionCategory._meta.db_table} WHERE id=%s LIMIT 1",
                [category]
            )[0]
            validated_data["category"] = category

        return super().create(validated_data)


    def update(self, instance, validated_data):
        self._reject_type_change(instance, validated_data)
        source_wallet = self.validate_source_wallet(self.initial_data["source_wallet"])
        if source_wallet:
            source_wallet = Wallet.objects.raw(
                f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
                [source_wallet]
            )[0]
        target_wallet = self.validate_target_wallet(self.initial_data["target_wallet"])
        if target_wallet:
            target_wallet = Wallet.objects.raw(
                f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
                [target_wallet]
            )[0]

        category = self.validate_category(self.initial_data["category"])
        if category:
            category = TransactionCategory.objects.raw(
                f"SELECT * FROM {TransactionCategory._meta.db_table} WHERE id=%s LIMIT 1",
                [category]
            )[0]

        instance.source_wallet = source_wallet
        instance.target_wallet = target_wallet
        instance.category = category
        instance.save()

        return super().update(instance, validated_data)

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
        if value is not None and value <= 0:
            raise serializers.ValidationError("Source amount must be greater than 0")

        return value

    def validate_target_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0")

        return value

    def validate_source_wallet(self, value):
        user_id = str(self.context["request"].user)

        if value is None:
            return None

        wallet = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
            [value]
        )
        if not wallet:
            raise exceptions.ValidationError("Invalid target wallet")
        else:
            wallet = wallet[0]

        if not wallet.user_id == user_id:
            raise exceptions.PermissionDenied(
                "You do not have permission to perform this action."
            )

        return value

    def validate_target_wallet(self, value):
        user_id = str(self.context["request"].user)

        if value is None:
            return None

        wallet = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} WHERE id=%s LIMIT 1",
            [value]
        )
        if not wallet:
            raise exceptions.ValidationError("Invalid target wallet")
        else:
            wallet = wallet[0]

        if not wallet.user_id == user_id:
            raise exceptions.PermissionDenied(
                "You do not have permission to perform this action."
            )

        return value

    def validate_category(self, value):
        user_id = str(self.context["request"].user)

        if value is None:
            return None

        category = TransactionCategory.objects.raw(
            f"SELECT * FROM {TransactionCategory._meta.db_table} WHERE id=%s LIMIT 1",
            [value]
        )
        if not category:
            raise exceptions.ValidationError("Invalid category")
        else:
            category = category[0]

        if not category.user_id == user_id:
            raise exceptions.PermissionDenied(
                "You do not have permission to perform this action."
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

    def _reject_type_change(self, instance, validated_data):
        type_changed = (
            (
                instance.source_wallet is None
                and self.initial_data.get("source_wallet") is not None
            ) or (
                instance.source_wallet is not None
                and self.initial_data.get("source_wallet") is None
            ) or (
                instance.target_wallet is None
                and self.initial_data.get("target_wallet") is not None
            ) or (
                instance.target_wallet is not None
                and self.initial_data.get("target_wallet") is None
            )
        )

        if type_changed:
            raise exceptions.ValidationError(
                {
                    "source_wallet": "Transaction type cannot be changed after creation",
                    "target_wallet": "Transaction type cannot be changed after creation"
                }
            )
