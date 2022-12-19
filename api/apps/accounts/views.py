from apps.base.utils import raw_get_object_or_404
from apps.base.views import RawListModelMixin
from rest_framework.mixins import UpdateModelMixin

from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from accounts.models import AccountSettings
from accounts.serializers import AccountSettingsSerializer


class AccountSettingsViewSet(GenericViewSet, UpdateModelMixin,
                             RawListModelMixin):
    serializer_class = AccountSettingsSerializer

    def get_object(self):
        obj = raw_get_object_or_404(AccountSettings, 'user_id',
                                    str(self.request.user))
        return obj

    # overriden since only one object can exist for user
    def list(self, request, *args, **kwargs):
        obj = self.get_object()
        data = self.get_serializer(obj).data
        return Response(data)
