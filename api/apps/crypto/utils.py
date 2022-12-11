from rest_framework.exceptions import ValidationError

from crypto.models import EthKeys


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
    if type(amount) != float:
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
