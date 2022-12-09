from datetime import datetime, timedelta
from decimal import Decimal

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

    grouped_logs = get_grouped_logs(logs)
    current_balances_sum = get_current_balances_sum(wallets_ids)

    result = {
        "current_balances_sum": current_balances_sum,
        "data": {
            "dates": list(grouped_logs.keys()),
            "balances": list(grouped_logs.values()),
        }
    }

    return result


def get_grouped_logs(logs: WalletLog.objects) -> dict:
    grouped_logs = {}
    for log in logs:
        date = log.date.strftime("%d-%m-%Y")
        if date not in grouped_logs:
            grouped_logs[date] = 0
        grouped_logs[date] += convert_currency(log.balance, log.currency)

    return grouped_logs


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
