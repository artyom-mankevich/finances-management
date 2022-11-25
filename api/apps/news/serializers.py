from rest_framework import serializers

from news.models import NewsFilter, NewsIndustry


class NewsFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsFilter
        read_only_fields = ("user_id",)
        fields = read_only_fields + (
            "symbols",
            "industries",
        )


class NewsIndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsIndustry
        read_only_fields = ("id", "name",)
        fields = read_only_fields
