from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.viewsets import GenericViewSet, ReadOnlyModelViewSet

from news.models import NewsFilter, NewsIndustry
from news.serializers import NewsFilterSerializer, NewsIndustrySerializer


class NewsFilterViewSet(GenericViewSet, RetrieveUpdateAPIView):
    serializer_class = NewsFilterSerializer

    def get_queryset(self):
        return NewsFilter.objects.filter(user_id=self.request.user)


class NewsIndustryViewSet(ReadOnlyModelViewSet):
    queryset = NewsIndustry.objects.all()
    serializer_class = NewsIndustrySerializer
