from rest_framework.viewsets import ModelViewSet

from accounts.views import SetUserIdFromTokenOnCreateMixin
from crypto.models import EthKeys
from crypto.serializers import EthKeysSerializer


class EthKeysViewSet(ModelViewSet, SetUserIdFromTokenOnCreateMixin):
    serializer_class = EthKeysSerializer

    def get_queryset(self):
        return EthKeys.objects.filter(user_id=self.request.user)
