from django.db import models


class Color(models.Model):
    hex_code = models.CharField(max_length=7, unique=True, primary_key=True)


class Icon(models.Model):
    code = models.CharField(max_length=32, unique=True, primary_key=True)
