from rest_framework.generics import get_object_or_404
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin, ListModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from accounts.models import AccountSettings
from accounts.serializers import AccountSettingsSerializer


class AccountSettingsViewSet(GenericViewSet, UpdateModelMixin, ListModelMixin):
    serializer_class = AccountSettingsSerializer

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), user_id=self.request.user)
        return obj

    def get_queryset(self):
        return AccountSettings.objects.all().filter(user_id=self.request.user)

    # overriden since only one object can exist for user
    def list(self, request, *args, **kwargs):
        obj = self.get_object()
        data = self.get_serializer(obj).data
        return Response(data)


class SetUserIdFromTokenOnCreateMixin(CreateModelMixin):
    def perform_create(self, serializer):
        serializer.save(user_id=str(self.request.user))
