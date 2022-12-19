import requests
from django.core.management import BaseCommand
from django.db import connection

from wallets.models import Currency


def get_currencies_list():
    currencies_dict = requests.get(
        "https://api.exchangerate.host/symbols"
    ).json()["symbols"]
    list_of_currencies = []

    for value in currencies_dict.values():
        list_of_currencies.append({
            "code": value["code"],
            "name": value["description"]
        })

    return list_of_currencies


class Command(BaseCommand):
    help = "Create missing Currency objects in the database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("START - Creating missing Currency objects"))

        counter = 0
        for currency in get_currencies_list():
            with connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT EXISTS("
                    f"SELECT 1 FROM {Currency._meta.db_table} WHERE code=%s"
                    f");",
                    [currency["code"]]
                )
                exists = cursor.fetchone()[0]
            if exists:
                self.stdout.write(
                    self.style.WARNING(
                        f"Currency {currency['code']} {currency['name']} already exists"
                    )
                )
            else:
                with connection.cursor() as cursor:
                    cursor.execute(
                        f"INSERT INTO {Currency._meta.db_table} (code, name)"
                        f" VALUES(%s, %s);",
                        [currency["code"], currency["name"]]
                    )
                counter += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created Currency: {currency['code']} {currency['name']}"
                    )
                )

        self.stdout.write(self.style.SUCCESS(f"END - Created {counter} Currency objects"))
