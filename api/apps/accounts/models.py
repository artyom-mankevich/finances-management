import uuid

from django.db import models

from wallets.models import Currency


class AccountSettings(models.Model):
    CURRENCY_FORMAT_LEFT = "left"
    CURRENCY_FORMAT_RIGHT = "right"
    CURRENCY_FORMAT_CHOICES = (
        (CURRENCY_FORMAT_LEFT, "Left"),
        (CURRENCY_FORMAT_RIGHT, "Right"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=64, unique=True, db_index=True)
    date_format = models.CharField(max_length=32, default="dd LLLL yyyy")
    main_currency = models.ForeignKey(
        Currency, on_delete=models.SET_DEFAULT, default="USD"
    )
    currency_format = models.CharField(
        max_length=5, default=CURRENCY_FORMAT_LEFT, choices=CURRENCY_FORMAT_CHOICES
    )
    start_page = models.ForeignKey(
        "StartPage", on_delete=models.SET_DEFAULT, default="Overview"
    )


class StartPage(models.Model):
    name = models.CharField(max_length=32, primary_key=True)
