from django.db import models
from django.db import connection


class Color(models.Model):
    hex_code = models.CharField(max_length=7, unique=True, primary_key=True)

    def delete(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f'DELETE FROM {self._meta.db_table} WHERE hex_code=%s',
                [self.hex_code]
            )

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                cursor.execute(f'INSERT INTO {self._meta.db_table} VALUES(%s)',
                               [self.hex_code]
                               )
            else:
                cursor.execute(
                    f'UPDATE {self._meta.db_table} SET hex_color=%s WHERE '
                    f'hex_code=%s',
                    [self.hex_code]
                )


class Icon(models.Model):
    code = models.CharField(max_length=32, unique=True, primary_key=True)

    def delete(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f'DELETE FROM {self._meta.db_table} WHERE code=%s',
                [self.hex_code]
            )

    def save(self, *args, **kwargs):
        with connection.cursor() as cursor:
            if self._state.adding:
                cursor.execute(f'INSERT INTO {self._meta.db_table} VALUES(%s)',
                               [self.code]
                               )
            else:
                cursor.execute(
                    f'UPDATE {self._meta.db_table} SET code=%s WHERE '
                    f'code=%s',
                    [self.code]
                )
