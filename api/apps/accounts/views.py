from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.viewsets import GenericViewSet, ModelViewSet

from accounts.models import AccountSettings, ChartSettings
from accounts.serializers import AccountSettingsSerializer, ChartSettingsSerializer


class AccountSettingsViewSet(GenericViewSet, RetrieveUpdateAPIView):
    queryset = AccountSettings.objects.all()
    serializer_class = AccountSettingsSerializer


class ChartSettingsViewSet(GenericViewSet, RetrieveUpdateAPIView):
    queryset = ChartSettings.objects.all()
    serializer_class = ChartSettingsSerializer
