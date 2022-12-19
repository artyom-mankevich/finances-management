from django.db import connection
from rest_framework import serializers
from wallets.models import Currency

from accounts.models import AccountSettings, StartPage


class AccountSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountSettings
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + (
            "date_format",
            "currency_format",
        )

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "user_id": instance.user_id,
            "main_currency": instance.main_currency_id,
            "start_page": instance.start_page_id,
            "date_format": instance.date_format,
            "currency_format": instance.currency_format,
        }

    def create(self, validated_data):
        main_currency = self.validate_main_currency(
            self.initial_data.get("main_currency")
        )
        main_currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code = %s",
            [main_currency]
        )[0]

        start_page = self.validate_start_page(
            self.initial_data.get("start_page")
        )
        start_page = StartPage.objects.raw(
            f"SELECT * FROM {StartPage._meta.db_table} WHERE name = %s",
            [start_page]
        )[0]

        return AccountSettings.objects.create(
            main_currency=main_currency,
            start_page=start_page,
            **validated_data
        )

    def update(self, instance, validated_data):
        main_currency = self.validate_main_currency(
            self.initial_data.get("main_currency")
        )
        main_currency = Currency.objects.raw(
            f"SELECT * FROM {Currency._meta.db_table} WHERE code = %s",
            [main_currency]
        )[0]

        start_page = self.validate_start_page(
            self.initial_data.get("start_page")
        )
        start_page = StartPage.objects.raw(
            f"SELECT * FROM {StartPage._meta.db_table} WHERE name = %s",
            [start_page]
        )[0]

        instance.main_currency = main_currency
        instance.start_page = start_page
        instance.date_format = validated_data.get("date_format")
        instance.currency_format = validated_data.get("currency_format")
        instance.save()
        return instance

    def validate_main_currency(self, value):
        if not value:
            raise serializers.ValidationError("Main currency is required.")
        if not type(value) == str:
            raise serializers.ValidationError("Main currency must be a string.")

        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*) FROM {Currency._meta.db_table} WHERE code = %s",
                [value],
            )
            if cursor.fetchone()[0] == 0:
                raise serializers.ValidationError("Currency does not exist.")

        return value

    def validate_start_page(self, value):
        if not value:
            raise serializers.ValidationError("Start page is required.")
        if not type(value) == str:
            raise serializers.ValidationError("Start page must be a string.")

        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT COUNT(*) FROM {StartPage._meta.db_table} WHERE name = %s",
                [value],
            )
            if cursor.fetchone()[0] == 0:
                raise serializers.ValidationError("Start page does not exist.")

        return value
