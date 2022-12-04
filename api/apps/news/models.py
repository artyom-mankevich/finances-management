import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models, transaction


class NewsFilter(models.Model):
    user_id = models.CharField(max_length=64, unique=True, primary_key=True)
    tickers = ArrayField(models.CharField(max_length=10), default=list)
    industries = models.ManyToManyField(
        "NewsIndustry",
        blank=True,
        db_table="news_filter_industries",
    )

    @classmethod
    @transaction.atomic
    def add_ticker(cls, user_id, ticker):
        if cls.objects.filter(user_id=user_id).exists():
            news_filter = cls.objects.select_for_update().get(user_id=user_id)
        else:
            news_filter = cls.objects.create(user_id=user_id)

        if ticker not in news_filter.tickers:
            news_filter.tickers.append(ticker)
            news_filter.save()

    @classmethod
    @transaction.atomic
    def update_ticker(cls, user_id, old_ticker, new_ticker):
        news_filter = cls.objects.select_for_update().get(user_id=user_id)
        news_filter.tickers.remove(old_ticker)
        news_filter.tickers.append(new_ticker)
        news_filter.save()

    @classmethod
    @transaction.atomic
    def remove_ticker(cls, user_id, ticker):
        news_filter = cls.objects.select_for_update().get(user_id=user_id)
        news_filter.tickers.remove(ticker)
        news_filter.save()


class NewsIndustry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=32, unique=True, blank=False)
