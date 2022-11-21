from rest_framework import viewsets

from decorations.models import Color, Icon
from decorations.serializers import ColorSerializer, IconSerializer


class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer


class IconViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Icon.objects.all()
    serializer_class = IconSerializer
