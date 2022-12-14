import requests
from rest_framework.exceptions import ValidationError

from crypto.models import EthKeys
from project import settings


def validate_transfer_args(password, eth_keys_id, to_address, amount):
    errors = {}
    if not password:
        errors["password"] = "This field is required."
    if type(password) != str:
        errors["password"] = "This field must be a string."


    if not eth_keys_id:
        errors["eth_keys_id"] = "This field is required."

    if not to_address:
        errors["to_address"] = "This field is required."
    if type(to_address) != str:
        errors["to_address"] = "This field must be a string."

    if amount is None:
        errors["amount"] = "This field is required."
    if type(amount) != float and type(amount) != int:
        errors["amount"] = "This field must be a float."
    if amount <= 0:
        errors["amount"] = "This field must be greater than 0."

    if errors:
        raise ValidationError(errors)


def transfer_eth(
    password: str,
    eth_keys: EthKeys,
    to_address: str,
    amount: float
):
    pass


def get_eth_transactions_for_addresses(addresses: list[str]) -> list[dict]:
    api_url = settings.ETHERSCAN_API_URL
    api_key = settings.ETHERSCAN_API_KEY

    query_params = {
        "module": "account",
        "action": "txlist",
        "startblock": 0,
        "endblock": 99999999,
        "page": 1,
        "offset": 100,
        "sort": "desc",
        "apikey": api_key
    }

    transactions = []
    for address in addresses:
        query_params["address"] = address
        response = requests.get(api_url, params=query_params)
        if response.status_code == 200 and response.json()["status"] == "1":
            transactions.extend(response.json()["result"])

    transactions = [{
        "date": float(transaction["timeStamp"]) * 1000,
        "sourceWalletAddress": transaction["from"],
        "targetWalletAddress": transaction["to"],
        "amount": float(transaction["value"]) / 10 ** 18,
    } for transaction in transactions]

    return transactions
