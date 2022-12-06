import logging

import requests
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from news.models import NewsFilter, NewsLanguage
from news.serializers import NewsFilterSerializer, NewsLanguageSerializer
from project import settings

logger = logging.getLogger(__name__)


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

        api_url = settings.MARKETAUX_API_URL
        api_token = settings.MARKETAUX_API_KEY

        symbols = ",".join([ticker for ticker in newsfilter.tickers])
        languages = ",".join([language.code for language in newsfilter.languages.all()])
        if not languages:
            languages = "en"
        must_have_entities = True
        filter_entities = True

        try:
            response = requests.get(
                f"{api_url}/news/all",
                params={
                    "api_token": api_token,
                    "symbols": symbols,
                    "must_have_entities": must_have_entities,
                    "filter_entities": filter_entities,
                    "language": languages,
                }
            ).json()
        except requests.exceptions.RequestException as e:
            logger.warning(e)
            return Response(data=[])

        stripped_response = [
            {"title": news["title"], "url": news["url"]} for news in response["data"]
        ]
        return Response(stripped_response)
