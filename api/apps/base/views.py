from rest_framework import mixins, viewsets
from rest_framework.mixins import CreateModelMixin

from rest_framework.response import Response


class RawListModelMixin:
    def list(self, request, *args, **kwargs):
        objects = [obj for obj in self.get_rawqueryset()]
        serializer = self.get_serializer(objects, many=True)
        return Response(serializer.data)


class SetUserIdFromTokenOnCreateMixin(CreateModelMixin):
    def perform_create(self, serializer):
        serializer.save(user_id=str(self.request.user))


class RawModelViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    SetUserIdFromTokenOnCreateMixin,
    RawListModelMixin,
):
    pass
