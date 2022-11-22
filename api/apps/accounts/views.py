from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.viewsets import GenericViewSet

from accounts.models import AccountSettings
from accounts.serializers import AccountSettingsSerializer


class AccountSettingsViewSet(GenericViewSet, RetrieveUpdateAPIView):
    queryset = AccountSettings.objects.all()
    serializer_class = AccountSettingsSerializer
