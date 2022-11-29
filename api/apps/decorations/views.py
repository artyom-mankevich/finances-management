from rest_framework import viewsets, mixins

from decorations.models import Color, Icon
from decorations.serializers import ColorSerializer, IconSerializer


class ColorViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer


class IconViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    queryset = Icon.objects.all()
    serializer_class = IconSerializer
