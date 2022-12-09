from decimal import Decimal

import requests
from django.core.cache import cache

from project import settings


def convert_currency(amount, currency):
    if amount is None:
        return None

    cache_key = f"currency_from_{currency}_to_USD_{amount}"
    cached_value = cache.get(cache_key)
    if cached_value:
        return cached_value

    host = settings.EXCHANGERATE_HOST
    response = requests.get(
        f"{host}/convert",
        params={"from": currency, "to": "USD", "amount": amount},
    ).json()

    if response.get("success"):
        result = Decimal(response["result"])
        cache.set(cache_key, result, 60 * 60 * 24)
        return result

    return None
