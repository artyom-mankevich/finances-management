from rest_framework import viewsets

from decorations.models import Color, Icon
from decorations.serializers import ColorSerializer, IconSerializer


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer


class IconViewSet(viewsets.ModelViewSet):
    queryset = Icon.objects.all()
    serializer_class = IconSerializer
