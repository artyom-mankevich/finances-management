import uuid

from django.db import models, transaction, connection


class NewsFilter(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, unique=True, db_index=True)
    tickers = models.ManyToManyField(
        "investments.Ticker",
        related_name="news_filters",
        blank=True,
        db_table="news_filter_tickers"
    )
    languages = models.ManyToManyField(
        "NewsLanguage",
        blank=True,
        db_table="news_filter_languages",
    )

    @classmethod
    @transaction.atomic
    def add_ticker(cls, user_id, ticker):
        if cls.objects.filter(user_id=user_id).exists():
            news_filter = cls.objects.select_for_update().get(user_id=user_id)
        else:
            news_filter = cls.objects.create(user_id=user_id)

        if not news_filter.tickers.filter(code=ticker.code).exists():
            news_filter.tickers.add(ticker)

    @classmethod
    @transaction.atomic
    def remove_ticker(cls, user_id, ticker):
        news_filter = cls.objects.select_for_update().get(user_id=user_id)
        news_filter.tickers.remove(ticker)


class NewsLanguage(models.Model):
    code = models.CharField(max_length=5, unique=True, primary_key=True)

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                cursor.execute(
                    f'INSERT INTO {self._meta.db_table} VALUES(%s)', [self.code]
                )
