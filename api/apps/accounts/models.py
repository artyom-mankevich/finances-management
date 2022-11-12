from django.db import models

from wallets.models import Currency


class AccountSettings(models.Model):
    user_id = models.CharField(max_length=64, unique=True, primary_key=True, db_index=True)
    date_format = models.CharField(max_length=32, default="DD/MM/YYYY")
    main_currency = models.ForeignKey(
        Currency, on_delete=models.SET_NULL, default="USD", null=True
    )
    week_start = models.IntegerField(default=0)
    start_page = models.CharField(max_length=32, default="dashboard")
