from django.db.models import Sum

from wallets.models import TransactionCategory
from wallets.serializers import ExtendedTransactionCategorySerializer


def get_top_categories(queryset: TransactionCategory.objects) -> dict:
    incomes = get_top_categories_queryset(queryset, "source", "target")
    expenses = get_top_categories_queryset(queryset, "target", "source")

    response = {
        "incomes": {
            "data": ExtendedTransactionCategorySerializer(incomes, many=True).data,
            "total": incomes.aggregate(total_sum=Sum("total"))["total_sum"],
        },
        "expenses": {
            "data": ExtendedTransactionCategorySerializer(expenses, many=True).data,
            "total": expenses.aggregate(total_sum=Sum("total"))["total_sum"],
        },
    }

    return response


def get_top_categories_queryset(
    initial_qs: TransactionCategory.objects,
    wallet_type: str,
    amount_type: str
) -> TransactionCategory.objects:
    wallet_lookup = {f"transaction__{wallet_type}_wallet__isnull": True}
    sum_lookup = f"transaction__{amount_type}_amount"

    result = initial_qs.filter(**wallet_lookup).annotate(total=Sum(sum_lookup)).order_by(
        "-total"
    )[:3]

    return result
