from rest_framework import serializers

from decorations.models import Color, Icon


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        read_only_fields = ("hex_code",)
        fields = read_only_fields


class IconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Icon
        read_only_fields = ("code",)
        fields = read_only_fields
