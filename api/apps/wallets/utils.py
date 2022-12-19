import time
from datetime import datetime, timedelta
from decimal import Decimal

import numpy as np
from django.db import connection

from accounts.models import AccountSettings
from django.core.cache import cache
from django.utils import timezone
from sklearn.linear_model import LinearRegression

from base.utils import convert_currency, dictfetchall
from wallets.models import (
    TransactionCategory, Transaction, WalletLog, Wallet, Debt, Currency
)
from wallets.serializers import ExtendedTransactionCategorySerializer


def get_top_categories(user_id: str) -> dict:
    incomes = get_top_categories_queryset("source", "target", user_id)
    expenses = get_top_categories_queryset("target", "source", user_id)

    response = {
        "incomes": {
            "data": ExtendedTransactionCategorySerializer(incomes, many=True).data,
            "total": get_categories_total_amount(incomes),
        },
        "expenses": {
            "data": ExtendedTransactionCategorySerializer(expenses, many=True).data,
            "total": get_categories_total_amount(expenses),
        },
    }

    return response


def get_top_categories_queryset(
    wallet_type: str,
    amount_type: str,
    user_id: str,
) -> list:
    categories = TransactionCategory.objects.raw(
        f"SELECT * FROM {TransactionCategory._meta.db_table} wtc"
        f" JOIN {Transaction._meta.db_table} wt ON wt.category_id = wtc.id"
        f" WHERE wtc.user_id = %s AND wt.{wallet_type}_wallet_id IS NULL",
        [user_id],
    )

    list_of_categories = []
    for category in categories:
        transactions = Transaction.objects.raw(
            f"SELECT wt.id, wt.{amount_type}_amount, wc.code as currency"
            f" FROM {Transaction._meta.db_table} wt"
            f" JOIN {Wallet._meta.db_table} ww ON wt.{amount_type}_wallet_id = ww.id"
            f" JOIN {Currency._meta.db_table} wc ON ww.currency_id = wc.code"
            f" WHERE wt.category_id = %s AND wt.{wallet_type}_wallet_id IS NULL;",
            [category.id],
        )
        total = get_transactions_total_amount(transactions, amount_type, user_id)
        if total != 0:
            category.total = total
            list_of_categories.append(category)

    list_of_categories = sorted(list_of_categories, key=lambda x: x.total, reverse=True)

    return list_of_categories[:3]


def get_transactions_total_amount(
    transactions, amount_type: str, user_id: str
) -> float:
    total = sum(
        convert_currency(
            getattr(transaction, f"{amount_type}_amount"),
            getattr(transaction, "currency"),
            user_id
        ) for transaction in transactions
    )

    return total


def get_categories_total_amount(categories: list) -> Decimal | None:
    _sum = sum(category.total for category in categories)
    if _sum == 0:
        return None

    return _sum


def get_current_wallets_balance(user_id) -> Decimal:
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT ww.balance, ww.currency_id as currency FROM {Wallet._meta.db_table} ww"
            f" LEFT JOIN {Debt._meta.db_table} wd ON ww.id = wd.wallet_id"
            f" WHERE ww.user_id = %s AND ww.balance != 0 AND wd.wallet_id IS NULL;",
            [user_id],
        )
        balances = dictfetchall(cursor)

    current_balances_sum = sum(
        convert_currency(wallet["balance"], wallet["currency"], user_id)
        for wallet in balances
    )
    return current_balances_sum


def get_daily_profits(
    grouped_income_transactions: dict, grouped_expense_transactions: dict
) -> dict:
    all_dates = set(grouped_income_transactions.keys()).union(
        grouped_expense_transactions.keys()
    )
    result = {}
    for date in all_dates:
        income = grouped_income_transactions.get(date, 0)
        expense = grouped_expense_transactions.get(date, 0)
        timestamp = time.mktime(datetime.strptime(date, "%d-%m-%Y").timetuple())
        result[timestamp] = income - expense

    result = dict(sorted(result.items()))

    return result


def predict_next_month_income(daily_profits: dict) -> Decimal:
    x_values = list(daily_profits.keys())
    y_values = list(daily_profits.values())

    x = np.array(x_values).reshape((-1, 1))
    y = np.array(y_values)
    model = LinearRegression().fit(x, y)

    day_in_seconds = 86400
    new_start_date = x_values[-1] + day_in_seconds
    x_new_values = [new_start_date + day_in_seconds * i for i in range(1, 31)]
    x_new = np.array(x_new_values).reshape((-1, 1))
    predicted_values = model.predict(x_new)
    predicted_values = [Decimal(str(value)) for value in predicted_values]

    return sum(predicted_values)


def get_predicted_balance(last_balance: Decimal, user_id: str) -> dict:
    start_date, end_date = get_chart_period_dates(WalletLog.CHART_PERIOD_1_YEAR)
    income_transactions = get_transaction_queryset_by_type(
        user_id, "source", "target", start_date, end_date
    )
    expense_transactions = get_transaction_queryset_by_type(
        user_id, "target", "source", start_date, end_date
    )
    grouped_income_transactions = get_grouped_transactions(
        income_transactions, "target", user_id
    )
    grouped_expense_transactions = get_grouped_transactions(
        expense_transactions, "source", user_id
    )
    daily_profits = get_daily_profits(
        grouped_income_transactions, grouped_expense_transactions
    )

    next_month = ((timezone.now().month + 1) % 12)
    year = timezone.now().year + 1 if next_month == 1 else timezone.now().year
    start_of_next_month = timezone.now().replace(
        day=1, month=next_month, year=year
    ).strftime("%B %Y")

    if len(daily_profits.keys()) < 30:
        return {start_of_next_month: last_balance}

    predicted_income = predict_next_month_income(daily_profits)
    predicted_balance = last_balance + predicted_income

    return {start_of_next_month: predicted_balance}


def get_wallets_chart_data(period: str, user_id: str) -> dict:
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT main_currency_id FROM {AccountSettings._meta.db_table} "
            f"WHERE user_id = %s;",
            [user_id],
        )
        current_currency = dictfetchall(cursor)[0]["main_currency_id"]
    start_date, end_date = get_chart_period_dates(period)

    logs = WalletLog.objects.raw(
        f"SELECT * FROM {WalletLog._meta.db_table} wl"
        f" JOIN {Wallet._meta.db_table} ww ON wl.wallet_id = ww.id"
        f" WHERE ww.user_id = %s AND wl.date >= %s AND wl.date <= %s"
        f" ORDER BY wl.date;",
        [
            user_id,
            start_date.strftime("%Y-%m-%d"),
            end_date.strftime("%Y-%m-%d"),
        ],
    )

    current_balances_sum = get_current_wallets_balance(user_id)
    cache_key = f"{user_id}_{period}_{str(end_date.date())}_{current_currency}"
    if cache.get(cache_key):
        grouped_logs = cache.get(cache_key)
    else:
        grouped_logs = group_wallet_logs(logs, period, user_id)
        cache.set(cache_key, grouped_logs, 60 * 60 * 24)

    today_data = get_today_grouped_wallet_log(period, user_id)
    grouped_logs.update(today_data)

    predicted = [False for _ in range(len(grouped_logs))]

    if period == WalletLog.CHART_PERIOD_1_YEAR and len(grouped_logs) >= 1:
        last_balance = grouped_logs[list(grouped_logs.keys())[-1]]
        predicted_balance_values = get_predicted_balance(last_balance, user_id)
        grouped_logs = {**grouped_logs, **predicted_balance_values}
        predicted.append(True)

    result = {
        "current_balances_sum": current_balances_sum,
        "data": {
            "dates": list(grouped_logs.keys()),
            "balances": list(grouped_logs.values()),
            "predicted": predicted,
        }
    }

    return result


def get_today_grouped_wallet_log(period: str, user_id) -> dict:
    today = timezone.now()
    current_balances_sum = get_current_wallets_balance(user_id)
    group = get_group_by_period(period, today.date())
    today_data = {group: current_balances_sum}

    return today_data


def group_wallet_logs(logs, period: str, user_id: str) -> dict:
    grouped_logs = {}
    if not logs:
        return grouped_logs

    group = get_group_by_period(period, logs[0].date)
    for log in logs:
        log_group = get_group_by_period(period, log.date)
        if group and group != log_group:
            group = log_group
        grouped_logs[group] = convert_currency(log.balance, log.currency, user_id)

    return grouped_logs


def get_group_by_period(period: str, log_date: datetime.date) -> str | None:
    if period in [WalletLog.CHART_PERIOD_7_DAYS, WalletLog.CHART_PERIOD_1_MONTH]:
        group = log_date.strftime("%d-%m-%Y")
    elif period == WalletLog.CHART_PERIOD_3_MONTHS:
        group = "Week " + get_week_start(log_date).strftime("%d-%m-%Y")
    elif period == WalletLog.CHART_PERIOD_1_YEAR:
        group = log_date.strftime("%B %Y")
    else:
        group = None

    return group


def get_week_start(date: datetime.date) -> datetime.date:
    return date - timezone.timedelta(days=date.weekday())


def get_chart_period_dates(period: str) -> tuple[datetime, datetime]:
    today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
    if period == WalletLog.CHART_PERIOD_7_DAYS:
        start_date = today - timezone.timedelta(days=7)
    elif period == WalletLog.CHART_PERIOD_1_MONTH:
        start_date = today - timezone.timedelta(days=30)
    elif period == WalletLog.CHART_PERIOD_3_MONTHS:
        start_date = today - timezone.timedelta(days=90)
    elif period == WalletLog.CHART_PERIOD_1_YEAR:
        start_date = today - timezone.timedelta(days=365)
    else:
        start_date = today

    return start_date, end_date


def get_transactions_chart_data(user_id: str) -> dict:
    start_date = (timezone.now() - timedelta(days=30)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    expenses = get_transaction_queryset_by_type(user_id, "target", "source", start_date)
    incomes = get_transaction_queryset_by_type(user_id, "source", "target", start_date)

    grouped_expenses = get_grouped_transactions(expenses, "source", user_id)
    grouped_incomes = get_grouped_transactions(incomes, "target", user_id)

    all_dates = list(set(list(grouped_expenses.keys()) + list(grouped_incomes.keys())))
    all_dates.sort(key=lambda x: datetime.strptime(x, "%d-%m-%Y"))

    expenses_data = [
        grouped_expenses[date] if date in grouped_expenses else 0 for date in all_dates
    ]
    incomes_data = [
        grouped_incomes[date] if date in grouped_incomes else 0 for date in all_dates
    ]

    result = {
        "expenses": expenses_data,
        "incomes": incomes_data,
        "dates": all_dates,
    }

    return result


def get_transaction_queryset_by_type(
    user_id: str,
    wallet_type: str,
    amount_type: str,
    start_date: datetime,
    end_date: datetime = None,
) -> list[dict]:
    if end_date is None:
        end_date = timezone.now().replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

    with connection.cursor() as cursor:
        start_date = start_date.strftime("%Y-%m-%d %H:%M:%S")
        end_date = end_date.strftime("%Y-%m-%d %H:%M:%S")
        sql_string = f"SELECT date_trunc('day', wt.created_at) as date," \
                     f" wt.{amount_type}_amount, wc.code" \
                     f" FROM wallets_transaction wt" \
                     f" JOIN wallets_wallet ww ON wt.{amount_type}_wallet_id = ww.id" \
                     f" JOIN wallets_currency wc ON ww.currency_id = wc.code" \
                     f" WHERE wt.{wallet_type}_wallet_id IS NULL" \
                     f" AND wt.created_at >= %(start_date)s" \
                     f" AND wt.created_at <= %(end_date)s" \
                     f" AND wt.user_id = %(user_id)s" \
                     f" ORDER BY date"
        cursor.execute(
            sql_string,
            {
                "amount_type": amount_type,
                "wallet_type": wallet_type,
                "start_date": start_date,
                "end_date": end_date,
                "user_id": user_id,
            }
        )
        return dictfetchall(cursor)


def get_grouped_transactions(transactions: list[dict], amount_type: str, user_id) -> dict:
    result = {}
    for transaction in transactions:
        date = transaction["date"].strftime("%d-%m-%Y")
        if date not in result:
            result[date] = 0
        result[date] += convert_currency(
            transaction[f"{amount_type}_amount"],
            transaction[f"code"],
            user_id
        )

    return result


def pay_debt(debt: Debt, amount: Decimal) -> None:
    debt.wallet.deposit(amount)
