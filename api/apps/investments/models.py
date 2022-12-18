import uuid

from django.utils import timezone
from django.db import models, transaction, connection

from news.models import NewsFilter
from wallets.models import Wallet


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
        params = {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "ticker_id": self.ticker_id,
            "created_at": self.created_at
        }
        with connection.cursor() as cursor:
            if self._state.adding:
                print('ADDING')
                NewsFilter.add_ticker(self.user_id, self.ticker)
                self.created_at = timezone.now()
                params["created_at"] = self.created_at
                cursor.execute(f"INSERT INTO {Stock._meta.db_table}"
                               f"(id, user_id, amount, ticker_id, created_at)"
                               f" VALUES(%(id)s, %(user_id)s, %(amount)s, "
                               f"%(ticker_id)s, %(created_at)s);", params
                               )
            else:
                obj_old = Stock.objects.raw(f"SELECT * FROM "
                                            f"{Stock._meta.db_table} "
                                            f"FOR UPDATE LIMIT 1")[0]
                if obj_old.ticker != self.ticker:
                    cursor.execute(f"SELECT COUNT(*) FROM "
                                   f"{Stock._meta.db_table} "
                                   f"WHERE ticker_id=%s AND user_id=%s;",
                                   [str(obj_old.ticker_id), self.user_id]
                                   )
                    count = cursor.fetchone()[0]
                    if count == 1:
                        NewsFilter.remove_ticker(self.user_id, obj_old.ticker)
                cursor.execute(f"UPDATE {Stock._meta.db_table} "
                               f"SET id=%(id)s, user_id=%(user_id)s, "
                               f"amount=%(amount)s, "
                               f"ticker_id=%(ticker_id)s, "
                               f"created_at=%(created_at)s "
                               f"WHERE id=%(id)s;", params
                               )

        NewsFilter.add_ticker(self.user_id, self.ticker)

    @transaction.atomic
    def delete(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) FROM "
                           f"{Stock._meta.db_table} "
                           f"WHERE id=%s;", [self.id]
                           )
            count = cursor.fetchone()[0]
            if count == 1:
                NewsFilter.remove_ticker(self.user_id, self.ticker)

            cursor.execute(f"DELETE FROM {Stock._meta.db_table} WHERE id=%s",
                           [self.id]
                           )


class Ticker(models.Model):
    code = models.CharField(max_length=10, primary_key=True)

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                cursor.execute(f"INSERT INTO {Ticker._meta.db_table} "
                               f"VALUES(%s);", [self.code]
                               )

    def delete(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(f"DELETE FROM {Ticker._meta.db_table} "
                           f"WHERE code=%s;", [self.code]
                           )


class Investment(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    percent = models.DecimalField(max_digits=30, decimal_places=10)
    wallet = models.OneToOneField(Wallet, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            params = {
                "id": self.id,
                "user_id": self.user_id,
                "percent": self.percent,
                "wallet_id": self.wallet_id,
                "created_at": self.created_at
            }

            if self._state.adding:
                self.created_at = timezone.now()
                params["created_at"] = self.created_at
                cursor.execute(f"INSERT INTO {Investment._meta.db_table}"
                               f"(id, user_id, percent, wallet_id, created_at)"
                               f" VALUES(%(id)s, %(user_id)s, %(percent)s, "
                               f"%(wallet_id)s, %(created_at)s);", params
                               )
            else:
                cursor.execute(f"UPDATE {Investment._meta.db_table} "
                               f"SET id=%(id)s, user_id=%(user_id)s, "
                               f"percent=%(percent)s, "
                               f"wallet_id=%(wallet_id)s, "
                               f"created_at=%(created_at)s;", params
                               )

    @transaction.atomic
    def delete(self, using=None, keep_parents=False):
        self.wallet.delete()

        with connection.cursor() as cursor:
            cursor.execute(f"DELETE FROM {Investment._meta.db_table} "
                           f"WHERE id=%s", [self.id]
                           )
