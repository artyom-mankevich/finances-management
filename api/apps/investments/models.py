import uuid

from django.db import models, transaction

from decorations.models import Color
from news.models import NewsFilter
from wallets.models import Wallet, Currency


class Stock(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    amount = models.DecimalField(max_digits=30, decimal_places=10)
    ticker = models.CharField(max_length=10)
    color = models.ForeignKey(Color, on_delete=models.SET_DEFAULT, default="000000")
    description = models.CharField(max_length=256, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @transaction.atomic
    def save(self, *args, **kwargs):
        update = Stock.objects.filter(id=self.id).exists()

        if not update:
            NewsFilter.add_ticker(self.user_id, self.ticker)
        else:
            obj_old = Stock.objects.select_for_update().get(id=self.id)

            if obj_old.ticker != self.ticker:
                NewsFilter.update_ticker(self.user_id, obj_old.ticker, self.ticker)

        super().save(*args, **kwargs)
