import logging
import requests
from django.core.cache import cache

from project import settings


logger = logging.getLogger(__name__)


def get_stocks_news(news_filter, user_id):
    api_url = settings.MARKETAUX_API_URL
    api_token = settings.MARKETAUX_API_KEY
    symbols = ",".join([ticker.code for ticker in news_filter.tickers.all()])
    languages = ",".join([language.code for language in news_filter.languages.all()])
    if not languages:
        languages = "en"
    must_have_entities = True
    filter_entities = True

    cache_key = f"news:{user_id}_{symbols}_{languages}"

    if len(cache_key) < 250:
        cached_response = cache.get(cache_key)
        if cached_response:
            return cached_response

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
        logger.error(e)
        return {"data": []}

    stripped_response = [
        {"title": news["title"], "url": news["url"]} for news in response["data"]
    ]
    if len(cache_key) < 250:
        cache.set(cache_key, stripped_response, 60 * 60 * 1)

    return stripped_response
