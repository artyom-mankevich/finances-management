from django.db import models

from decorations.models import Color, Icon


class Currency(models.Model):
    code = models.CharField(unique=True, primary_key=True, max_length=10)
    name = models.CharField(max_length=32)
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user_id = models.CharField(max_length=64, db_index=True)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
    balance = models.DecimalField(max_digits=20, decimal_places=2)
    name = models.CharField(max_length=128, blank=True)
    description = models.CharField(max_length=256, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    goal = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    is_debt = models.BooleanField(default=False)


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user_id = models.CharField(max_length=64, db_index=True)
    type = models.ForeignKey("TransactionType", on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey("TransactionCategory", on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
    source_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="source_wallet")
    target_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="target_wallet")
    description = models.CharField(max_length=256, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class TransactionType(models.Model):
    income = models.BooleanField()
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)


class TransactionCategory(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user_id = models.CharField(max_length=64, db_index=True)
    name = models.CharField(max_length=128)
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
