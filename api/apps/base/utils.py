from decimal import Decimal

import requests
from django.core.cache import cache

from project import settings
from django.http import Http404


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
    )

    if response.status_code == 200 and response.json().get("success"):
        result = Decimal(response.json()["result"])
        cache.set(cache_key, result, 60 * 60 * 24)
        return result

    return amount


def raw_get_object_or_404(model, field, id):
    try:
        return model.objects.raw(f'SELECT * FROM {model._meta.db_table} WHERE {field}=%s LIMIT 1', [id])[0]
    except IndexError:
        raise Http404("Couldn't find matching object")
