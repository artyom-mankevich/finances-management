from decimal import Decimal

import requests
from accounts.models import AccountSettings
from django.core.cache import cache

from project import settings


def convert_currency(amount, currency, user_id):
    if amount is None:
        return None
    to_currency = AccountSettings.objects.get(user_id=user_id).main_currency.code

    cache_key = f"currency_from_{currency}_to_{to_currency}_{amount}"
    cached_value = cache.get(cache_key)
    if cached_value:
        return cached_value

    host = settings.EXCHANGERATE_HOST
    response = requests.get(
        f"{host}/convert",
        params={"from": currency, "to": to_currency, "amount": amount},
    )

    if response.status_code == 200 and response.json().get("success"):
        result = Decimal(response.json()["result"])
        cache.set(cache_key, result, 60 * 60 * 24)
        return result

    return amount
