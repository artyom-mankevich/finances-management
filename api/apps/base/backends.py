from accounts.models import AccountSettings
from django.contrib.auth.backends import RemoteUserBackend


class CustomRemoteUserBackend(RemoteUserBackend):
    def configure_user(self, request, user, created=True):
        user = super().configure_user(request, user, created)
        if created:
            settings_exist = AccountSettings.objects.filter(user_id=user).exists()
            if not settings_exist:
                AccountSettings.objects.create(user_id=user)
