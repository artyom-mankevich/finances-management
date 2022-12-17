from rest_framework import viewsets, mixins
from apps.base.views import RawListModelMixin
from decorations.models import Color, Icon
from decorations.serializers import ColorSerializer, IconSerializer


class ColorViewSet(viewsets.GenericViewSet, RawListModelMixin):
    serializer_class = ColorSerializer

    def get_rawqueryset(self):
        return Color.objects.raw(f"SELECT * FROM {Color._meta.db_table}")

class IconViewSet(viewsets.GenericViewSet, RawListModelMixin):
    serializer_class = IconSerializer

    def get_rawqueryset(self):
        return Icon.objects.raw(f"SELECT * FROM {Icon._meta.db_table}")