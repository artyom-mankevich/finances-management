from rest_framework import serializers

from news.models import NewsFilter, NewsLanguage


class NewsFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsFilter
        read_only_fields = ("id", "user_id",)
        fields = read_only_fields + (
            "tickers",
            "languages",
        )


class NewsLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsLanguage
        read_only_fields = ("code",)
        fields = read_only_fields
