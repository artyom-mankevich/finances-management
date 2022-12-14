from cryptography.fernet import InvalidToken
from requests.auth import HTTPBasicAuth
import requests
from rest_framework.exceptions import ValidationError
from web3.exceptions import InvalidAddress

from base.encryption import Encryption
from crypto.models import EthKeys
from web3 import Web3

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


def transfer_eth(password: str, eth_keys: EthKeys, to_address: str, amount: float) -> str:
    try:
        private_key = Encryption.aes_decrypt(eth_keys.private_key, password)
    except InvalidToken:
        raise ValidationError({"password": "Invalid password."})

    _hash = commit_transaction(eth_keys, to_address, amount, private_key)

    return _hash


def commit_transaction(
    eth_keys: EthKeys,
    to_address: str,
    amount: float,
    private_key: str
) -> str:
    api_key = settings.INFURA_API_KEY
    api_url = settings.INFURA_API_URL
    api_secret_key = settings.INFURA_API_SECRET_KEY

    web3 = Web3(
        Web3.HTTPProvider(
            api_url + api_key,
            request_kwargs={"auth": HTTPBasicAuth(api_key, api_secret_key)},
        )
    )
    nonce = web3.eth.getTransactionCount(eth_keys.address)

    tx = {
        'type': '0x2',
        'nonce': nonce,
        'from': eth_keys.address,
        'to': to_address,
        'value': web3.toWei(amount, 'ether'),
        'maxFeePerGas': web3.toWei('250', 'gwei'),
        'maxPriorityFeePerGas': web3.toWei('3', 'gwei'),
        'chainId': int(settings.CHAIN_ID)
    }
    try:
        gas = web3.eth.estimateGas(tx)
        tx['gas'] = gas
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    except InvalidAddress as e:
        raise ValidationError({"to_address": str(e)})
    except ValueError as e:
        raise ValidationError({"amount": e.args[0]['message']})

    return tx_hash.hex()


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
