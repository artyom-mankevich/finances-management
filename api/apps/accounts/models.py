import uuid

from django.db import models
from django.db import connection

from wallets.models import Currency


class AccountSettings(models.Model):
    CURRENCY_FORMAT_LEFT = "left"
    CURRENCY_FORMAT_RIGHT = "right"
    CURRENCY_FORMAT_CHOICES = (
        (CURRENCY_FORMAT_LEFT, "Left"),
        (CURRENCY_FORMAT_RIGHT, "Right"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=64, unique=True, db_index=True)
    date_format = models.CharField(max_length=32, default="dd LLLL yyyy")
    main_currency = models.ForeignKey(
        Currency, on_delete=models.SET_DEFAULT, default="USD"
    )
    currency_format = models.CharField(
        max_length=5, default=CURRENCY_FORMAT_LEFT,
        choices=CURRENCY_FORMAT_CHOICES
    )
    start_page = models.ForeignKey(
        "StartPage", on_delete=models.SET_DEFAULT, default="Overview"
    )

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM accounts_accountsettings WHERE user_id = %s",
                [self.user_id],
            )
            if cursor.fetchone()[0] == 0:
                adding = True
            else:
                adding = False

        with connection.cursor() as cursor:
            if adding:
                cursor.execute(
                    f"INSERT INTO {self._meta.db_table}"
                    f"(id, user_id, date_format, main_currency_id, "
                    f"start_page_id, currency_format)"
                    f"VALUES(%(id)s, %(user_id)s, %(date_format)s, "
                    f"%(main_currency_id)s, %(start_page_id)s, "
                    f"%(currency_format)s);",
                    {
                        "id": self.id,
                        "user_id": str(self.user_id),
                        "date_format": self.date_format,
                        "main_currency_id": self.main_currency.code,
                        "start_page_id": self.start_page.name,
                        "currency_format": self.currency_format
                    }
                )
            else:
                cursor.execute(
                    f"UPDATE {self._meta.db_table} SET "
                    f"id=%(id)s, user_id=%(user_id)s, "
                    f"date_format=%(date_format)s, "
                    f"main_currency_id=%(main_currency_id)s, "
                    f"start_page_id=%(start_page_id)s, "
                    f"currency_format=%(currency_format)s;",
                    {
                        "id": self.id,
                        "user_id": str(self.user_id),
                        "date_format": self.date_format,
                        "main_currency_id": self.main_currency.code,
                        "start_page_id": self.start_page.name,
                        "currency_format": self.currency_format
                    }
                )


class StartPage(models.Model):
    name = models.CharField(max_length=32, primary_key=True)

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*) FROM {self._meta.db_table} WHERE name = %s",
                [self.name],
            )
            if cursor.fetchone()[0] == 0:
                adding = True
            else:
                adding = False

        with connection.cursor() as cursor:
            if adding:
                cursor.execute(
                    f'INSERT INTO {self._meta.db_table} VALUES(%s)', [self.name]
                )
