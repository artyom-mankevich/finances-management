import datetime
from decimal import Decimal

import numpy as np
import yahooquery as yq

from django.core.cache import cache

from base.utils import convert_currency
from investments.models import Stock


def set_stock_prices(response, user_id):
    tickers = [stock["ticker"] for stock in response]
    stock_prices = get_stock_prices(tickers, user_id)
    for stock in response:
        if stock_prices[stock["ticker"]] is not None:
            stock["price"] = stock_prices[stock["ticker"]] * stock["amount"]
        else:
            stock["price"] = None


def get_stock_prices(tickers: list, user_id) -> dict:
    data = {ticker: {"currency": None, "price": None} for ticker in tickers}

    set_tickers_data_from_cache(data, tickers)
    tickers_to_fetch = [ticker for ticker in tickers if data[ticker]["price"] is None]

    if tickers_to_fetch:
        set_tickers_data_from_api(data, tickers_to_fetch)

    return get_converted_ticker_prices(data, tickers, user_id)


def set_tickers_data_from_api(data: dict, tickers_to_fetch: list[str]):
    yq_tickers = yq.Ticker(
        " ".join(tickers_to_fetch), asynchronous=True, validate=True
    )
    if not yq_tickers.symbols:
        return

    financial_data = yq_tickers.financial_data
    if yq_tickers.invalid_symbols:
        for symbol in yq_tickers.invalid_symbols:
            financial_data[symbol] = {
                "currentPrice": None,
                "financialCurrency": None,
            }

    for ticker in tickers_to_fetch:
        if type(financial_data[ticker]) == str:
            price = None
            currency = None
        else:
            price = financial_data[ticker].get("currentPrice")
            currency = financial_data[ticker].get("financialCurrency")

        data[ticker]["price"] = price
        data[ticker]["currency"] = currency

        cache.set(f"stock_price_{ticker}", price, 60 * 5)
        cache.set(f"stock_currency_{ticker}", currency, 60 * 5)


def get_converted_ticker_prices(data: dict, tickers: list[str], user_id: str) -> dict:
    result = {}
    for ticker in tickers:
        result[ticker] = convert_currency(
            data[ticker]["price"], data[ticker]["currency"], user_id
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


def get_period_interval(period: str) -> str:
    if period in [Stock.CHART_PERIOD_7_DAYS, Stock.CHART_PERIOD_1_MONTH]:
        return "1d"
    elif period == Stock.CHART_PERIOD_3_MONTHS:
        return "1wk"
    elif period == Stock.CHART_PERIOD_1_YEAR:
        return "1mo"


def get_stocks_chart_data(
    stocks: dict, period: str, user_id: str
) -> dict:
    tickers = yq.Ticker(list(stocks.keys()), validate=True, asynchronous=True).symbols
    symbols = " ".join(tickers)

    interval = get_period_interval(period)

    tickers_key = "_".join(tickers)
    amounts_key = "_".join([str(val) for val in stocks.values()])
    cache_key = f"stocks_chart_data_{tickers_key}_{amounts_key}" \
                f"_{period}_{interval}_{user_id}"
    if len(cache_key) < 250:
        cached_value = cache.get(cache_key)
        if cached_value:
            return cached_value

    cache_lifetime = 60 * 60 * 24

    historical_prices = get_historical_stocks_data(
        symbols, stocks, period, user_id, interval
    )
    if not historical_prices:
        return {}

    result = {"data": historical_prices}

    if period in [Stock.CHART_PERIOD_7_DAYS, Stock.CHART_PERIOD_1_MONTH]:
        today = datetime.date.today()
        today_prices = get_stock_prices(tickers, user_id)
        for ticker in list(today_prices.keys()):
            if today_prices[ticker] is not None:
                today_prices[ticker] = today_prices[ticker] * stocks[ticker]
            else:
                del today_prices[ticker]
        today_sum = {
            today.strftime("%d-%m-%Y"): sum(today_prices.values())
        }
        historical_prices = {**historical_prices, **today_sum}
        cache_lifetime = 60 * 10

    result["data"] = {
        "dates": list(historical_prices.keys()),
        "values": list(historical_prices.values()),
    }

    average_price = sum(result["data"]["values"]) / len(result["data"]["values"])
    result["average_price"] = average_price

    if len(cache_key) < 250:
        cache.set(cache_key, result, cache_lifetime)

    return result


def get_historical_stocks_data(
    symbols: str,
    stocks: dict,
    period: str,
    user_id: str,
    interval: str = "1d"
) -> dict[str, Decimal]:
    ticker = yq.Ticker(symbols=symbols, asynchronous=True, validate=True)

    if not ticker.symbols:
        return {}

    series = ticker.history(period=period, interval=interval)

    result = {}
    if type(series) != dict and series.empty:
        return result
    if type(series) == dict:
        for key in series:
            if type(series[key]) == dict:
                symbols = symbols.replace(key, "")

    if not symbols:
        return result

    ticker = yq.Ticker(symbols=symbols, asynchronous=True, validate=True)
    series = ticker.history(period=period, interval=interval)

    series = series["close"]

    for i in range(len(series)):
        if np.isnan(series[i]):
            continue

        ticker = series.index[i][0]
        date = series.index[i][1].strftime("%d-%m-%Y")
        price = Decimal(str(series[i]))
        price = convert_currency(price, ticker, user_id)

        if date not in result:
            result[date] = price * stocks[ticker]
        else:
            result[date] += price * stocks[ticker]

    if period not in [Stock.CHART_PERIOD_7_DAYS, Stock.CHART_PERIOD_1_MONTH]:
        # remove today's data
        result.popitem()

    return result
