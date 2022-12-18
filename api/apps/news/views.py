from rest_framework.generics import get_object_or_404
from rest_framework.mixins import ListModelMixin, UpdateModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from base.views import RawListModelMixin
from news.models import NewsFilter, NewsLanguage
from news.serializers import NewsFilterSerializer, NewsLanguageSerializer
from news.utils import get_stocks_news


class NewsFilterViewSet(GenericViewSet, UpdateModelMixin, ListModelMixin):
    serializer_class = NewsFilterSerializer

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), user_id=self.request.user)
        return obj

    def get_queryset(self):
        return NewsFilter.objects.filter(user_id=self.request.user)

    # overriden since only one object can exist for user
    def list(self, request, *args, **kwargs):
        obj = self.get_object()
        data = self.get_serializer(obj).data
        return Response(data)


class NewsLanguageViewSet(GenericViewSet, RawListModelMixin):
    serializer_class = NewsLanguageSerializer

    def get_rawqueryset(self):
        return NewsLanguage.objects.raw(f"SELECT * FROM "
                                        f"{NewsLanguage._meta.db_table};")


class NewsAPIView(APIView):
    def get(self, request):
        newsfilter = NewsFilter.objects.filter(user_id=request.user).first()

        if newsfilter is None:
            return Response(data=[])

        response = get_stocks_news(newsfilter, str(request.user))

        return Response(response)
