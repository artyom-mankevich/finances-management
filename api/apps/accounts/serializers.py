from rest_framework import serializers

from accounts.models import AccountSettings


class AccountSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountSettings
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + (
            "date_format",
            "main_currency",
            "currency_format",
            "start_page",
        )
