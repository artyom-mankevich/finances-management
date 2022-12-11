from rest_framework import serializers

from crypto.models import EthKeys


class EthKeysSerializer(serializers.ModelSerializer):
    class Meta:
        model = EthKeys
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + ("address", "private_key")

    private_key = serializers.CharField(write_only=True)
