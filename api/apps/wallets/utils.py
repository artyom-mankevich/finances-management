from base.utils import convert_currency
from wallets.models import TransactionCategory, Transaction
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


def get_transaction_type_total_amount(categories: list) -> float | None:
    _sum = sum(category.total for category in categories)
    if _sum == 0:
        return None

    return _sum
