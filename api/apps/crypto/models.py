from django.db import models


class EthKeys(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user_id = models.CharField(max_length=64, db_index=True)
    private_key = models.CharField(max_length=128)
    public_key = models.CharField(max_length=128)
