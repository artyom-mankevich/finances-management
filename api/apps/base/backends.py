from accounts.models import AccountSettings
from django.contrib.auth.backends import RemoteUserBackend
from django.db import connection


class CustomRemoteUserBackend(RemoteUserBackend):
    def configure_user(self, request, user, created=True):
        user = str(super().configure_user(request, user, created))
        if created:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT EXISTS("
                    f"SELECT 1 FROM {AccountSettings._meta.db_table} "
                    f"WHERE user_id=%s);",
                    [str(user)]
                )
                exists = cursor.fetchone()[0]
            if not exists:
                AccountSettings.objects.create(user_id=user)
