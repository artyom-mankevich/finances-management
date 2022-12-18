import uuid
from decimal import Decimal

from django.db import models, connection
from django.utils import timezone

from decorations.models import Color, Icon


class Currency(models.Model):
    code = models.CharField(unique=True, primary_key=True, max_length=10)
    name = models.CharField(max_length=64)

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        with connection.cursor() as cursor:
            if self._state.adding:
                cursor.execute(
                    f"INSERT INTO {self._meta.db_table} VALUES(%s, %s)",
                    [self.code, self.name]
                )
            else:
                cursor.execute(
                    f"UPDATE {self._meta.db_table} SET code=%s, name=%s WHERE code=%s",
                    [self.code, self.name, self.code]
                )

    def delete(self, using=None, keep_parents=False):
        with connection.cursor() as cursor:
            cursor.execute(
                f"DELETE FROM {self._meta.db_table} WHERE code=%s", [self.code]
            )


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
    description = models.TextField(blank=True)

    def withdraw(self, amount: Decimal) -> None:
        with connection.cursor() as cursor:
            cursor.execute(
                f"BEGIN; "
                f"SELECT * FROM {self._meta.db_table} WHERE id=%s FOR UPDATE LIMIT 1; "
                f"UPDATE {self._meta.db_table} SET balance=balance-%s, last_updated=%s "
                f"WHERE id=%s; "
                f"COMMIT;",
                [self.id, amount, timezone.now(), self.id]
            )

    def deposit(self, amount: Decimal) -> None:
        with connection.cursor() as cursor:
            cursor.execute(
                f"BEGIN; "
                f"SELECT * FROM {self._meta.db_table} WHERE id=%s FOR UPDATE LIMIT 1; "
                f"UPDATE {self._meta.db_table} SET balance=balance+%s, last_updated=%s "
                f"WHERE id=%s; "
                f"COMMIT;",
                [self.id, amount, timezone.now(), self.id]
            )

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                self.last_updated = timezone.now()
                cursor.execute(
                    f"BEGIN; "
                    f"INSERT INTO {self._meta.db_table} "
                    f"(id, user_id, currency_id, balance, name, color_id, goal,"
                    f" last_updated, description)"
                    f" VALUES(%(id)s, %(user_id)s, %(currency_id)s, %(balance)s,"
                    f" %(name)s, %(color_id)s, %(goal)s, %(last_updated)s,"
                    f" %(description)s);"
                    f" COMMIT;",
                    {
                        "id": self.id,
                        "user_id": self.user_id,
                        "currency_id": self.currency.code,
                        "balance": self.balance,
                        "name": self.name,
                        "color_id": self.color.hex_code,
                        "goal": self.goal,
                        "last_updated": self.last_updated,
                        "description": self.description,
                    }
                )
            else:
                old_obj = Wallet.objects.raw(
                    "SELECT * FROM wallets_wallet WHERE id=%s LIMIT 1", [self.id]
                )[0]
                if not hasattr(self, "debt") and old_obj.balance != self.balance:
                    Transaction.create_balance_transaction(self, old_obj)

                cursor.execute(
                    f"BEGIN; "
                    f"UPDATE {self._meta.db_table}"
                    f" SET user_id=%(user_id)s, currency_id=%(currency_id)s,"
                    f" balance=%(balance)s, name=%(name)s, color_id=%(color_id)s,"
                    f" goal=%(goal)s, last_updated=%(last_updated)s,"
                    f" description=%(description)s "
                    f"WHERE id=%(id)s;"
                    f" COMMIT;",
                    {
                        "id": self.id,
                        "user_id": self.user_id,
                        "currency_id": self.currency.code,
                        "balance": self.balance,
                        "name": self.name,
                        "color_id": self.color.hex_code,
                        "goal": self.goal,
                        "last_updated": self.last_updated,
                        "description": self.description,
                    }
                )

    def delete(self, using=None, keep_parents=False):
        with connection.cursor() as cursor:
            cursor.execute(
                f"BEGIN; "
                f"DELETE FROM {self._meta.db_table} WHERE id=%s; "
                f"COMMIT;",
                [self.id]
            )


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

    def save(self, *args, **kwargs):
        params = {
            "id": self.id,
            "wallet_id": self.wallet.id,
            "balance": self.balance,
            "currency": self.currency,
            "date": self.date,
        }
        with connection.cursor() as cursor:
            if self._state.adding:
                self.date = timezone.now().date()
                params["date"] = self.date
                cursor.execute(
                    f"BEGIN; "
                    f"INSERT INTO {self._meta.db_table}"
                    f"(id, wallet_id, balance, currency, date)"
                    f" VALUES(%(id)s, %(wallet_id)s, %(balance)s, %(currency)s, %(date)s);"
                    f" COMMIT;",
                    params
                )
            else:
                cursor.execute(
                    f"BEGIN; "
                    f"UPDATE {self._meta.db_table}"
                    f" SET wallet_id=%(wallet_id)s, balance=%(balance)s,"
                    f" currency=%(currency)s, date=%(date)s "
                    f" WHERE id=%s"
                    f" COMMIT;",
                    params
                )

    def delete(self, using=None, keep_parents=False):
        with connection.cursor() as cursor:
            cursor.execute(
                f"BEGIN; "
                f"DELETE FROM {self._meta.db_table} WHERE id=%s; "
                f"COMMIT;",
                [self.id]
            )


class Debt(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    wallet = models.OneToOneField(Wallet, on_delete=models.CASCADE)
    expires_at = models.DateField()

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                cursor.execute(
                    f"BEGIN; "
                    f"INSERT INTO {self._meta.db_table}"
                    f" VALUES(%s, %s, %s, %s);"
                    f" COMMIT;",
                    [self.id, self.user_id, self.wallet_id, self.expires_at]
                )
            else:
                cursor.execute(
                    f"BEGIN; "
                    f"UPDATE {self._meta.db_table}"
                    f" SET id=%s, user_id=%s, wallet_id=%s, expires_at=%s"
                    f" WHERE id=%s"
                    f" COMMIT;",
                    [self.id, self.user_id, self.wallet_id, self.expires_at, self.id]
                )

    def delete(self, using=None, keep_parents=False):
        with connection.cursor() as cursor:
            cursor.execute(
                f"BEGIN; "
                f"DELETE FROM {Wallet._meta.db_table} WHERE id=%s; "
                f"DELETE FROM {self._meta.db_table} WHERE id=%s; "
                f"COMMIT;",
                [self.wallet.pk, self.id]
            )


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

    def save(self, *args, **kwargs):
        update = self._state.adding is False

        source_amount = self.source_amount
        target_amount = self.target_amount
        if update:
            old_obj = Transaction.objects.raw(
                f"SELECT * FROM {self._meta.db_table} WHERE id=%s FOR UPDATE LIMIT 1; ",
                [self.id]
            )[0]

            if (
                old_obj.source_wallet == self.source_wallet
                and old_obj.target_wallet == self.target_wallet
            ):
                source_amount, target_amount = self._get_update_source_and_target_amount(
                    old_obj, source_amount, target_amount
                )
            else:
                if old_obj.source_wallet:
                    old_obj.source_wallet.deposit(old_obj.source_amount)
                if old_obj.target_wallet:
                    old_obj.target_wallet.withdraw(old_obj.target_amount)

        if self.source_wallet and not self.target_wallet:
            self.source_wallet.withdraw(source_amount)
        elif self.target_wallet and not self.source_wallet:
            self.target_wallet.deposit(target_amount)
        elif self.source_wallet and self.target_wallet:
            self.source_wallet.withdraw(source_amount)
            self.target_wallet.deposit(target_amount)

        with connection.cursor() as cursor:
            params = {
                "id": self.id,
                "user_id": self.user_id,
                "category_id": self.category_id,
                "source_amount": self.source_amount,
                "target_amount": self.target_amount,
                "source_wallet_id": self.source_wallet_id,
                "target_wallet_id": self.target_wallet_id,
                "description": self.description,
            }
            if update:
                params["created_at"] = self.created_at
                cursor.execute(
                    f"BEGIN; "
                    f"UPDATE {self._meta.db_table}"
                    f" SET user_id=%(user_id)s, category_id=%(category_id)s,"
                    f" source_amount=%(source_amount)s, target_amount=%(target_amount)s,"
                    f" source_wallet_id=%(source_wallet_id)s,"
                    f" target_wallet_id=%(target_wallet_id)s,"
                    f" description=%(description)s, created_at=%(created_at)s"
                    f" WHERE id=%(id)s;"
                    f" COMMIT;",
                    params
                )
            else:
                self.created_at = timezone.now()
                params["created_at"] = self.created_at
                cursor.execute(
                    f"BEGIN; "
                    f"INSERT INTO {self._meta.db_table}"
                    f" (id, user_id, category_id, source_amount, target_amount,"
                    f" source_wallet_id, target_wallet_id, description, created_at)"
                    f" VALUES(%(id)s, %(user_id)s, %(category_id)s, %(source_amount)s,"
                    f" %(target_amount)s, %(source_wallet_id)s, %(target_wallet_id)s,"
                    f" %(description)s, %(created_at)s);"
                    f" COMMIT;",
                    params
                )

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

    def delete(self, *args, **kwargs):
        if self.source_wallet and not self.target_wallet:
            self.source_wallet.deposit(self.source_amount)
        elif self.target_wallet and not self.source_wallet:
            self.target_wallet.withdraw(self.target_amount)
        elif self.source_wallet and self.target_wallet:
            self.source_wallet.deposit(self.source_amount)
            self.target_wallet.withdraw(self.target_amount)

        with connection.cursor() as cursor:
            cursor.execute(
                f"BEGIN; "
                f"DELETE FROM {self._meta.db_table} WHERE id=%s; "
                f"COMMIT;",
                [self.id]
            )

    @classmethod
    def create_balance_transaction(cls, wallet_new, wallet_old):
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*) FROM {TransactionCategory._meta.db_table} WHERE name=%s",
                ["Other"]
            )
            category_exists = cursor.fetchone()[0] > 0

            if category_exists:
                cursor.execute(
                    f"SELECT id FROM {TransactionCategory._meta.db_table} WHERE name=%s",
                    ["Other"]
                )
                category_id = cursor.fetchone()[0]
            else:
                cursor.execute(f"SELECT hex_code FROM {Color._meta.db_table} LIMIT 1;")
                color_hex_code = cursor.fetchone()[0]

                category_id = uuid.uuid4()
                cursor.execute(
                    f"BEGIN; "
                    f"INSERT INTO {TransactionCategory._meta.db_table}"
                    f"(id, user_id, name, created_at, color_id, icon_id)"
                    f" VALUES(%(id)s, %(user_id)s, %(name)s, %(created_at)s,"
                    f" %(color_id)s, %(icon_id)s);"
                    f" COMMIT;",
                    {
                        "id": category_id,
                        "user_id": wallet_new.user_id,
                        "name": "Other",
                        "created_at": timezone.now(),
                        "color_id": color_hex_code,
                        "icon_id": "paid",
                    }
                )

            if wallet_old.balance > wallet_new.balance:
                params = {
                    "id": uuid.uuid4(),
                    "user_id": wallet_new.user_id,
                    "category_id": category_id,
                    "source_amount": wallet_old.balance - wallet_new.balance,
                    "target_amount": None,
                    "source_wallet_id": wallet_old.id,
                    "target_wallet_id": None,
                    "description": "Balance transaction",
                    "created_at": timezone.now(),
                }
            else:
                params = {
                    "id": uuid.uuid4(),
                    "user_id": wallet_new.user_id,
                    "category_id": category_id,
                    "source_amount": None,
                    "target_amount": wallet_new.balance - wallet_old.balance,
                    "source_wallet_id": None,
                    "target_wallet_id": wallet_new.id,
                    "description": "Balance transaction",
                    "created_at": timezone.now(),
                }
            cursor.execute(
                f"BEGIN; "
                f"INSERT INTO {cls._meta.db_table} "
                f"(id, user_id, category_id, source_amount, target_amount, "
                f"source_wallet_id, target_wallet_id, description, created_at)"
                f" VALUES(%(id)s, %(user_id)s, %(category_id)s, %(source_amount)s, "
                f"%(target_amount)s, %(source_wallet_id)s, %(target_wallet_id)s, "
                f"%(description)s, %(created_at)s);"
                f"COMMIT;",
                params
            )


class TransactionCategory(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    name = models.CharField(max_length=128)
    icon = models.ForeignKey(Icon, on_delete=models.SET_NULL, null=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                self.created_at = timezone.now()
                cursor.execute(
                    f"BEGIN; "
                    f"INSERT INTO {self._meta.db_table}"
                    f"(id, user_id, name, icon_id, color_id, created_at)"
                    f" VALUES(%(id)s, %(user_id)s, %(name)s, %(icon_id)s, %(color_id)s,"
                    f" %(created_at)s);"
                    f"COMMIT;",
                    {
                        "id": self.id,
                        "user_id": self.user_id,
                        "name": self.name,
                        "icon_id": self.icon_id,
                        "color_id": self.color_id,
                        "created_at": self.created_at,
                    }
                )
            else:
                cursor.execute(
                    f"BEGIN; "
                    f"UPDATE {self._meta.db_table} "
                    f"SET name=%s, icon_id=%s, color_id=%s "
                    f"WHERE id=%s; "
                    f"COMMIT;",
                    [
                        self.name,
                        self.icon_id,
                        self.color_id,
                        self.id,
                    ]
                )
