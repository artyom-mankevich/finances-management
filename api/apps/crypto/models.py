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

    def delete(self, *args, **kwrargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f'DELETE FROM {self._meta.db_table} WHERE id=%s', [self.id]
            )
