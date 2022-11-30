import uuid

from django.db import models

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


class Debt(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    expires_at = models.DateField()


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    type = models.ForeignKey("TransactionType", on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey("TransactionCategory", on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=30, decimal_places=10)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
    source_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.SET_NULL,
        null=True,
        related_name="source_wallet_transactions"
    )
    target_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.SET_NULL,
        null=True,
        related_name="target_wallet_transactions"
    )
    description = models.CharField(max_length=256, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class TransactionType(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    income = models.BooleanField()
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)


class TransactionCategory(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    name = models.CharField(max_length=128)
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
