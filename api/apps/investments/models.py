import uuid

from django.db import models

from decorations.models import Color
from wallets.models import Wallet, Currency



class Investment(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    start_amount = models.DecimalField(max_digits=20, decimal_places=2)
    current_amount = models.DecimalField(max_digits=20, decimal_places=2)
    percent = models.DecimalField(max_digits=6, decimal_places=2)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=256, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)


class Stock(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    company = models.CharField(max_length=10)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    description = models.CharField(max_length=256, blank=True)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
