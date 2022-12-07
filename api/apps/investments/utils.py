from decimal import Decimal

import requests
import yahooquery as yq

from django.core.cache import cache

from project import settings


def set_stock_prices(response):
    tickers = [stock["ticker"] for stock in response]
    stock_prices = get_stock_prices(tickers)
    for stock in response:
        stock["price"] = stock_prices[stock["ticker"]]


def get_stock_prices(tickers: list) -> dict:
    data = {ticker: {"currency": None, "price": None} for ticker in tickers}

    set_tickers_data_from_cache(data, tickers)
    tickers_to_fetch = [ticker for ticker in tickers if data[ticker]["price"] is None]

    if tickers_to_fetch:
        set_tickers_data_from_api(data, tickers_to_fetch)

    return get_converted_ticker_prices(data, tickers)


def set_tickers_data_from_api(data: dict, tickers_to_fetch: list[str]):
    yq_tickers = yq.Ticker(" ".join(tickers_to_fetch)).financial_data
    for ticker in tickers_to_fetch:
        price = yq_tickers[ticker].get("currentPrice")
        currency = yq_tickers[ticker].get("financialCurrency")

        data[ticker]["price"] = price
        data[ticker]["currency"] = currency

        cache.set(f"stock_price_{ticker}", price, 60 * 5)
        cache.set(f"stock_currency_{ticker}", currency, 60 * 5)


def get_converted_ticker_prices(data: dict, tickers: list[str]) -> dict:
    result = {}
    for ticker in tickers:
        result[ticker] = convert_currency(
            data[ticker]["price"], data[ticker]["currency"]
        )
    return result


def set_tickers_data_from_cache(data, tickers):
    for ticker in tickers:
        price = cache.get(f"stock_price_{ticker}")
        currency = cache.get(f"stock_currency_{ticker}")
        if price is not None:
            data[ticker]["price"] = price
        if currency is not None:
            data[ticker]["currency"] = currency


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
