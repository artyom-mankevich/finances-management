import uuid
from decimal import Decimal
from random import choice

from django.db import models, transaction
from django.utils import timezone

from decorations.models import Color, Icon


class Currency(models.Model):
    code = models.CharField(unique=True, primary_key=True, max_length=10)
    name = models.CharField(max_length=64)


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
    balance = models.DecimalField(max_digits=30, decimal_places=10)
    name = models.CharField(max_length=128)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    goal = models.DecimalField(
        max_digits=30, decimal_places=10, blank=True, null=True, default=None
    )
    last_updated = models.DateTimeField(auto_now=True)

    @transaction.atomic
    def withdraw(self, amount: Decimal) -> None:
        Wallet.objects.select_for_update().filter(id=self.id).update(
            balance=models.F("balance") - amount,
            last_updated=timezone.now(),
        )
        self.refresh_from_db()

    @transaction.atomic
    def deposit(self, amount: Decimal) -> None:
        Wallet.objects.select_for_update().filter(id=self.id).update(
            balance=models.F("balance") + amount,
            last_updated=timezone.now(),
        )
        self.refresh_from_db()

    @transaction.atomic
    def save(self, *args, **kwargs):
        update = Wallet.objects.filter(pk=self.pk).exists()
        if update:
            old_obj = Wallet.objects.get(pk=self.pk)
            if not self.debt_set.exists() and old_obj.balance != self.balance:
                Transaction.create_balance_transaction(self, old_obj)

        super().save(*args, **kwargs)


class WalletLog(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=30, decimal_places=10)
    currency = models.CharField(max_length=10)
    date = models.DateField(auto_now_add=True)

    CHART_PERIOD_7_DAYS = "7d"
    CHART_PERIOD_1_MONTH = "1mo"
    CHART_PERIOD_3_MONTHS = "3mo"
    CHART_PERIOD_1_YEAR = "1y"

    CHART_PERIODS = [
        CHART_PERIOD_7_DAYS,
        CHART_PERIOD_1_MONTH,
        CHART_PERIOD_3_MONTHS,
        CHART_PERIOD_1_YEAR,
    ]


class Debt(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    expires_at = models.DateField()

    @transaction.atomic
    def delete(self, using=None, keep_parents=False):
        self.wallet.delete()
        super().delete(using, keep_parents)


class Transaction(models.Model):
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(source_amount__gt=0),
                name="transaction_source_amount_positive",
            ),
            models.CheckConstraint(
                check=models.Q(target_amount__gt=0),
                name="transaction_target_amount_positive",
            ),
        ]

    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    category = models.ForeignKey(
        "TransactionCategory", on_delete=models.CASCADE, null=True
    )
    source_amount = models.DecimalField(max_digits=30, decimal_places=10, null=True)
    target_amount = models.DecimalField(max_digits=30, decimal_places=10, null=True)
    source_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        null=True,
        related_name="source_wallet_transactions"
    )
    target_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        null=True,
        related_name="target_wallet_transactions"
    )
    description = models.CharField(max_length=256, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @transaction.atomic
    def save(self, *args, **kwargs):
        update = Transaction.objects.filter(pk=self.pk).exists()

        source_amount = self.source_amount
        target_amount = self.target_amount
        if update:
            old_obj = Transaction.objects.select_for_update().get(pk=self.pk)

            if (
                old_obj.source_wallet == self.source_wallet
                and old_obj.target_wallet == self.target_wallet
            ):
                source_amount, target_amount = self._get_update_source_and_target_amount(
                    old_obj, source_amount, target_amount
                )
            else:
                old_obj.source_wallet.deposit(old_obj.source_amount)
                old_obj.target_wallet.withdraw(old_obj.target_amount)

        if self.source_wallet and not self.target_wallet:
            self.source_wallet.withdraw(source_amount)
        elif self.target_wallet and not self.source_wallet:
            self.target_wallet.deposit(target_amount)
        elif self.source_wallet and self.target_wallet:
            self.source_wallet.withdraw(source_amount)
            self.target_wallet.deposit(target_amount)

        super().save(*args, **kwargs)

    @staticmethod
    def _get_update_source_and_target_amount(old_obj, source_amount, target_amount):
        if old_obj.source_amount != source_amount:
            source_amount = source_amount - old_obj.source_amount
        else:
            source_amount = 0
        if old_obj.target_amount != target_amount:
            target_amount = target_amount - old_obj.target_amount
        else:
            target_amount = 0
        return source_amount, target_amount

    @transaction.atomic
    def delete(self, *args, **kwargs):
        if self.source_wallet and not self.target_wallet:
            self.source_wallet.deposit(self.source_amount)
        elif self.target_wallet and not self.source_wallet:
            self.target_wallet.withdraw(self.target_amount)
        elif self.source_wallet and self.target_wallet:
            self.source_wallet.deposit(self.source_amount)
            self.target_wallet.withdraw(self.target_amount)

        super().delete(*args, **kwargs)

    @classmethod
    @transaction.atomic
    def create_balance_transaction(cls, wallet_new, wallet_old):
        other_category, created = TransactionCategory.objects.get_or_create(
            name="Other", user_id=wallet_new.user_id, defaults={
                "icon": Icon.objects.get(code="paid"),
                "color": Color.objects.get(
                    pk=choice(Color.objects.values_list("pk", flat=True))
                ),
            }
        )
        if wallet_old.balance > wallet_new.balance:
            cls.objects.create(
                user_id=wallet_new.user_id,
                category=other_category,
                source_amount=wallet_old.balance - wallet_new.balance,
                source_wallet=wallet_new,
                description="Balance adjustment",
            )
        else:
            cls.objects.create(
                user_id=wallet_new.user_id,
                category=other_category,
                target_amount=wallet_new.balance - wallet_old.balance,
                target_wallet=wallet_new,
                description="Balance adjustment",
            )


class TransactionCategory(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    name = models.CharField(max_length=128)
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
