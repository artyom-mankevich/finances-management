from django.db import transaction
from rest_framework import serializers

from base.encryption import Encryption
from crypto.models import EthKeys


class EthKeysSerializer(serializers.ModelSerializer):
    class Meta:
        model = EthKeys
        read_only_fields = ("id", "user_id")
        fields = read_only_fields + ("address", "private_key")

    private_key = serializers.CharField(write_only=True)

    @transaction.atomic
    def create(self, validated_data):
        password = self._validate_password(self.initial_data.get("password"))
        private_key = validated_data.pop("private_key")

        validated_data["private_key"] = Encryption.aes_encrypt(private_key, password)

        return super().create(validated_data)

    def _validate_password(self, password):
        if not password:
            raise serializers.ValidationError({"password": "This field is required."})
        if type(password) != str:
            raise serializers.ValidationError(
                {"password": "This field must be a string."}
            )

        return password
