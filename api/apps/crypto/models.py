import uuid

from django.db import models
from django.db import connection


class EthKeys(models.Model):
    class Meta:
        db_table = 'crypto_ethkeys'

    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user_id = models.CharField(max_length=64, db_index=True)
    private_key = models.CharField(max_length=256)
    address = models.CharField(max_length=128, unique=True)

    def delete(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f'DELETE FROM {self._meta.db_table} WHERE id=%s;', [self.id]
            )

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*) FROM {self._meta.db_table} WHERE user_id=%s;",
                [self.user_id]
            )
            if cursor.fetchone()[0] > 0:
                adding = False
            else:
                adding = True
        with connection.cursor() as cursor:
            if adding:
                cursor.execute(
                    f'INSERT INTO {self._meta.db_table} VALUES(%s, %s, %s, %s);',
                    [self.id, self.user_id, self.private_key, self.address]
                )
            else:
                cursor.execute(
                    f'UPDATE {self._meta.db_table}'
                    f' SET id=%s, user_id=%s, private_key=%s, address=%s WHERE id=%s;',
                    [self.id, self.user_id, self.private_key, self.address, self.id]
                )
