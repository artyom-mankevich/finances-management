from rest_framework import serializers

from crypto.models import EthKeys


class EthKeysSerializer(serializers.ModelSerializer):
    class Meta:
        model = EthKeys
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + ("public_key",)
