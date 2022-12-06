from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from news.models import NewsFilter, NewsLanguage
from news.serializers import NewsFilterSerializer, NewsLanguageSerializer
from news.utils import get_stocks_news


class NewsFilterViewSet(GenericViewSet, RetrieveUpdateAPIView):
    serializer_class = NewsFilterSerializer
    lookup_value_regex = "[^/]+"

    def get_queryset(self):
        return NewsFilter.objects.filter(user_id=self.request.user)


class NewsLanguageViewSet(GenericViewSet, ListModelMixin):
    queryset = NewsLanguage.objects.all()
    serializer_class = NewsLanguageSerializer


class NewsAPIView(APIView):
    def get(self, request):
        newsfilter = NewsFilter.objects.filter(user_id=request.user).first()

        if newsfilter is None:
            return Response(data=[])

        response = get_stocks_news(newsfilter, str(request.user))

        return Response(response)
