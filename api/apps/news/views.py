from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.viewsets import GenericViewSet, ReadOnlyModelViewSet

from news.models import NewsFilter, NewsIndustry
from news.serializers import NewsFilterSerializer, NewsIndustrySerializer


class NewsFilterViewSet(GenericViewSet, RetrieveUpdateAPIView):
    queryset = NewsFilter.objects.all()
    serializer_class = NewsFilterSerializer


class NewsIndustryViewSet(ReadOnlyModelViewSet):
    queryset = NewsIndustry.objects.all()
    serializer_class = NewsIndustrySerializer
