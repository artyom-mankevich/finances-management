from rest_framework.response import Response

class RawListModelMixin:
    def list(self, request, *args, **kwargs):
        object = [obj for obj in self.get_rawqueryset()]
        serializer = self.get_serializer(object, many=True)
        return Response(serializer.data)
