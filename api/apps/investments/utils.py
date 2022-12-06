from decimal import Decimal

import requests
import yfinance as yf
from django.core.cache import cache

from project import settings


def set_stock_prices(response):
    for stock in response:
        stock["price"] = get_stock_price(stock["ticker"]) * stock["amount"]


def get_stock_price(ticker):
    cache_key = f"stock_price:{ticker}"
    cached_info = cache.get(cache_key)

    if cached_info:
        price = cached_info["price"]
        currency = cached_info["currency"]
    else:
        price = None
        currency = None

        ticker = yf.Ticker(ticker)
        if ticker.info.get("currentPrice"):
            price = ticker.info["currentPrice"]
            currency = ticker.info["currency"]
            cache.set(cache_key, {"price": price, "currency": currency}, 60 * 10)

    return convert_currency(price, currency)


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
