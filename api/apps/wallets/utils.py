from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models.functions import TruncDate

from base.utils import convert_currency
from wallets.models import TransactionCategory, Transaction, WalletLog, Wallet
from wallets.serializers import ExtendedTransactionCategorySerializer


def get_top_categories(queryset: TransactionCategory.objects) -> dict:
    incomes = get_top_categories_queryset(queryset, "source", "target")
    expenses = get_top_categories_queryset(queryset, "target", "source")

    response = {
        "incomes": {
            "data": ExtendedTransactionCategorySerializer(incomes, many=True).data,
            "total": get_transaction_type_total_amount(incomes),
        },
        "expenses": {
            "data": ExtendedTransactionCategorySerializer(expenses, many=True).data,
            "total": get_transaction_type_total_amount(expenses),
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


def get_transaction_type_total_amount(categories: list) -> Decimal | None:
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


def get_wallets_chart_data(wallets_ids: list[str], period: str) -> dict:
    start_date, end_date = get_chart_period_dates(period)
    logs = WalletLog.objects.filter(
        wallet_id__in=wallets_ids, date__range=(start_date, end_date)
    ).order_by("date")

    grouped_logs = get_grouped_logs(logs, period)
    current_balances_sum = get_current_balances_sum(wallets_ids)

    result = {
        "current_balances_sum": current_balances_sum,
        "data": {
            "dates": list(grouped_logs.keys()),
            "balances": list(grouped_logs.values()),
            "predicted": [False for _ in range(len(grouped_logs))],
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
    return date - timedelta(days=date.weekday())


def get_chart_period_dates(period: str) -> tuple[datetime.date, datetime.date]:
    end_date = datetime.now().date()
    if period == WalletLog.CHART_PERIOD_7_DAYS:
        start_date = (datetime.now() - timedelta(days=datetime.now().weekday())).date()
    elif period == WalletLog.CHART_PERIOD_1_MONTH:
        start_date = (datetime.now() - timedelta(days=30)).date()
    elif period == WalletLog.CHART_PERIOD_3_MONTHS:
        start_date = (datetime.now() - timedelta(days=90)).date()
    elif period == WalletLog.CHART_PERIOD_1_YEAR:
        start_date = (datetime.now() - timedelta(days=365)).date()
    else:
        start_date = end_date

    return start_date, end_date


def get_transactions_chart_data(user_id: str) -> dict:
    expenses = list(get_transaction_queryset_by_type(user_id, "target", "source"))
    incomes = list(get_transaction_queryset_by_type(user_id, "source", "target"))

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
    user_id: str, wallet_type: str, amount_type: str
) -> Transaction.objects:
    wallet_filter = {f"{wallet_type}_wallet__isnull": True}
    start_date = (datetime.now() - timedelta(days=30)).date()

    return (
        Transaction.objects.filter(
            user_id=user_id, created_at__gt=start_date, **wallet_filter
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
