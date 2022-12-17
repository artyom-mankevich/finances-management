import uuid

from django.db import models, transaction

from decorations.models import Color
from news.models import NewsFilter
from wallets.models import Wallet, Currency


class Stock(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    amount = models.DecimalField(max_digits=30, decimal_places=10)
    ticker = models.ForeignKey("Ticker", null=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

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

    @transaction.atomic
    def save(self, *args, **kwargs):
        update = Stock.objects.filter(id=self.id).exists()

        if not update:
            NewsFilter.add_ticker(self.user_id, self.ticker)
        else:
            obj_old = Stock.objects.select_for_update().get(id=self.id)

            if obj_old.ticker != self.ticker:
                if Stock.objects.filter(
                    user_id=self.user_id, ticker=obj_old.ticker
                ).count() == 1:
                    NewsFilter.remove_ticker(self.user_id, obj_old.ticker)

                NewsFilter.add_ticker(self.user_id, self.ticker)

        super().save(*args, **kwargs)

    @transaction.atomic
    def delete(self, *args, **kwargs):
        if Stock.objects.filter(ticker=self.ticker).count() == 1:
            NewsFilter.remove_ticker(self.user_id, self.ticker)
        super().delete(*args, **kwargs)


class Ticker(models.Model):
    code = models.CharField(max_length=10, primary_key=True)


class Investment(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    percent = models.DecimalField(max_digits=30, decimal_places=10)
    wallet = models.OneToOneField(Wallet, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    @transaction.atomic
    def delete(self, using=None, keep_parents=False):
        self.wallet.delete()
        super().delete(using, keep_parents)
