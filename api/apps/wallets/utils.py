import time
from datetime import datetime, timedelta
from decimal import Decimal

import numpy as np
from django.db.models.functions import TruncDate
from django.utils import timezone
from sklearn.linear_model import LinearRegression

from base.utils import convert_currency
from wallets.models import TransactionCategory, Transaction, WalletLog, Wallet
from wallets.serializers import ExtendedTransactionCategorySerializer


def get_top_categories(queryset: TransactionCategory.objects) -> dict:
    incomes = get_top_categories_queryset(queryset, "source", "target")
    expenses = get_top_categories_queryset(queryset, "target", "source")

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
    initial_qs: TransactionCategory.objects,
    wallet_type: str,
    amount_type: str
) -> list:
    wallet_lookup = {f"transaction__{wallet_type}_wallet__isnull": True}
    transaction_lookup = {f"{amount_type}_wallet__isnull": False}

    categories = initial_qs.filter(**wallet_lookup).distinct()
    list_of_categories = []
    for category in categories:
        total = get_transactions_total_amount(
            category.transaction_set.filter(**transaction_lookup).prefetch_related(
                f"{wallet_type}_wallet__currency"
            ),
            amount_type
        )
        if total != 0:
            category.total = total
            list_of_categories.append(category)

    list_of_categories = sorted(list_of_categories, key=lambda x: x.total, reverse=True)

    return list_of_categories[:3]


def get_transactions_total_amount(
    transactions: Transaction.objects, amount_type: str
) -> float:
    total = sum(
        convert_currency(
            getattr(transaction, f"{amount_type}_amount"),
            getattr(transaction, f"{amount_type}_wallet").currency.code
        ) for transaction in transactions
    )

    return total


def get_categories_total_amount(categories: list) -> Decimal | None:
    _sum = sum(category.total for category in categories)
    if _sum == 0:
        return None

    return _sum


def get_current_balances_sum(wallets_ids: list[str]) -> Decimal:
    balances = Wallet.objects.filter(id__in=wallets_ids).prefetch_related("currency").values(
        "balance", "currency__code"
    )
    current_balances_sum = sum(
        convert_currency(wallet["balance"], wallet["currency__code"])
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
    grouped_income_transactions = get_grouped_transactions(income_transactions, "target")
    grouped_expense_transactions = get_grouped_transactions(
        expense_transactions, "source"
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


def get_wallets_chart_data(wallets_ids: list[str], period: str, user_id: str) -> dict:
    start_date, end_date = get_chart_period_dates(period)
    logs = WalletLog.objects.filter(
        wallet_id__in=wallets_ids, date__range=(start_date, end_date)
    ).order_by("date")

    grouped_logs = get_grouped_logs(logs, period)
    current_balances_sum = get_current_balances_sum(wallets_ids)

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


def get_grouped_logs(logs: WalletLog.objects, period: str) -> dict:
    grouped_logs = {}
    for log in logs:
        if period in [WalletLog.CHART_PERIOD_7_DAYS, WalletLog.CHART_PERIOD_1_MONTH]:
            date = log.date.strftime("%d-%m-%Y")
        elif period == WalletLog.CHART_PERIOD_3_MONTHS:
            date = "Week " + get_week_start(log.date).strftime("%d-%m-%Y")
        else:
            date = log.date.strftime("%B %Y")

        if date not in grouped_logs:
            grouped_logs[date] = 0
        grouped_logs[date] += convert_currency(log.balance, log.currency)

    return grouped_logs


def get_week_start(date: datetime.date) -> datetime.date:
    return date - timezone.timedelta(days=date.weekday())


def get_chart_period_dates(period: str) -> tuple[datetime, datetime]:
    today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
    if period == WalletLog.CHART_PERIOD_7_DAYS:
        start_date = today - timezone.timedelta(days=today.weekday())
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
    start_date = (timezone.now() - timedelta(days=30)).date()
    expenses = list(
        get_transaction_queryset_by_type(user_id, "target", "source", start_date)
    )
    incomes = list(
        get_transaction_queryset_by_type(user_id, "source", "target", start_date)
    )

    grouped_expenses = get_grouped_transactions(expenses, "source")
    grouped_incomes = get_grouped_transactions(incomes, "target")

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
    start_date: datetime.date,
    end_date: datetime.date = None
) -> Transaction.objects:
    if end_date is None:
        end_date = timezone.now().date() + timezone.timedelta(
            hours=23, minutes=59, seconds=59
        )

    wallet_filter = {f"{wallet_type}_wallet__isnull": True}

    return (
        Transaction.objects.filter(
            user_id=user_id,
            created_at__gte=start_date,
            created_at__lte=end_date,
            **wallet_filter
        )
        .prefetch_related(f"{amount_type}_wallet__currency")
        .annotate(date=TruncDate("created_at"))
        .order_by("date")
        .values("date", f"{amount_type}_amount", f"{amount_type}_wallet__currency__code")
    )


def get_grouped_transactions(transactions: list[dict], amount_type: str) -> dict:
    result = {}
    for transaction in transactions:
        date = transaction["date"].strftime("%d-%m-%Y")
        if date not in result:
            result[date] = 0
        result[date] += convert_currency(
            transaction[f"{amount_type}_amount"],
            transaction[f"{amount_type}_wallet__currency__code"],
        )

    return result
