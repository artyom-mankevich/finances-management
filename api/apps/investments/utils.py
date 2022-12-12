import datetime
from decimal import Decimal

import numpy as np
import yahooquery as yq

from django.core.cache import cache

from base.utils import convert_currency
from investments.models import Stock


def set_stock_prices(response):
    tickers = [stock["ticker"] for stock in response]
    stock_prices = get_stock_prices(tickers)
    for stock in response:
        if stock_prices[stock["ticker"]] is not None:
            stock["price"] = stock_prices[stock["ticker"]] * stock["amount"]
        else:
            stock["price"] = None


def get_stock_prices(tickers: list) -> dict:
    data = {ticker: {"currency": None, "price": None} for ticker in tickers}

    set_tickers_data_from_cache(data, tickers)
    tickers_to_fetch = [ticker for ticker in tickers if data[ticker]["price"] is None]

    if tickers_to_fetch:
        set_tickers_data_from_api(data, tickers_to_fetch)

    return get_converted_ticker_prices(data, tickers)


def set_tickers_data_from_api(data: dict, tickers_to_fetch: list[str]):
    yq_tickers = yq.Ticker(
        " ".join(tickers_to_fetch), asynchronous=True, validate=True
    ).financial_data
    if not yq_tickers:
        return

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


def get_period_dates(
    period: str, today: datetime.date
) -> tuple[str, str] | tuple[None, None]:
    if period == Stock.CHART_PERIOD_7_DAYS:
        start_date = (
                today - datetime.timedelta(days=today.weekday())
        ).strftime("%Y-%m-%d")
        end_date = today.strftime("%Y-%m-%d")

        return start_date, end_date

    return None, None


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

    today = datetime.date.today()
    start_date, end_date = get_period_dates(period, today)
    interval = get_period_interval(period)

    tickers_key = "_".join(tickers)
    amounts_key = "_".join([str(val) for val in stocks.values()])
    cache_key = f"stocks_chart_data_{tickers_key}_{amounts_key}_{period}_{start_date}" \
                f"_{end_date}_{interval}_{user_id}"
    cached_value = cache.get(cache_key)
    if cached_value:
        return cached_value

    cache_lifetime = 60 * 60 * 24

    historical_prices = get_historical_stocks_data(
        symbols, stocks, period, start_date, end_date, interval
    )
    if not historical_prices:
        return {}

    result = {"data": historical_prices}

    if period in [Stock.CHART_PERIOD_7_DAYS, Stock.CHART_PERIOD_1_MONTH]:
        today_prices = get_stock_prices(tickers)
        for ticker in today_prices:
            today_prices[ticker] = today_prices[ticker] * stocks[ticker]
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

    cache.set(cache_key, result, cache_lifetime)

    return result


def get_historical_stocks_data(
    symbols: str,
    stocks: dict,
    period: str,
    start_date: str = None,
    end_date: str = None,
    interval: str = "1d"
) -> dict[str, Decimal]:
    ticker = yq.Ticker(symbols=symbols, asynchronous=True, validate=True)

    if not ticker.symbols:
        return {}

    series = ticker.history(
        period=period, start=start_date, end=end_date, interval=interval
    )

    if not series.get("close"):
        return {}

    series = series["close"]

    result = {}
    for i in range(len(series)):
        if np.isnan(series[i]):
            continue

        ticker = series.index[i][0]
        date = series.index[i][1].strftime("%d-%m-%Y")
        price = Decimal(str(series[i]))

        if date not in result:
            result[date] = price * stocks[ticker]
        else:
            result[date] += price * stocks[ticker]

    if period not in [Stock.CHART_PERIOD_7_DAYS, Stock.CHART_PERIOD_1_MONTH]:
        # remove today's data
        result.popitem()

    return result
