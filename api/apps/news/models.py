import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models


class NewsFilter(models.Model):
    user_id = models.CharField(max_length=64, unique=True, primary_key=True)
    symbols = ArrayField(models.CharField(max_length=10), default=list)
    industries = models.ManyToManyField(
        "NewsIndustry",
        blank=True,
        db_table="news_filter_industries",
    )


class NewsIndustry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    industry = models.CharField(max_length=32, unique=True, blank=False)
