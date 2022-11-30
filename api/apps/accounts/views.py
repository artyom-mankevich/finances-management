from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet

from accounts.models import AccountSettings, ChartSettings
from accounts.serializers import AccountSettingsSerializer, ChartSettingsSerializer


class AccountSettingsViewSet(GenericViewSet, RetrieveUpdateAPIView):
    serializer_class = AccountSettingsSerializer

    def get_queryset(self):
        return AccountSettings.objects.all().filter(user_id=self.request.user)


class ChartSettingsViewSet(GenericViewSet, RetrieveUpdateAPIView):
    serializer_class = ChartSettingsSerializer

    def get_queryset(self):
        return ChartSettings.objects.all().filter(user_id=self.request.user)


class SetUserIdFromTokenOnCreateMixin(CreateModelMixin):
    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user)
