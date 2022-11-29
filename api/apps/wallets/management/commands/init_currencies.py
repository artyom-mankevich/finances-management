import requests
from django.core.management import BaseCommand

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
            obj, created = Currency.objects.get_or_create(
                code=currency["code"], name=currency["name"]
            )
            if created:
                counter += 1
                self.stdout.write(self.style.SUCCESS(f"Created Currency: {obj.code}, {obj.name}"))
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Currency {obj.code} {currency['name']} already exists"
                    )
                )

        self.stdout.write(self.style.SUCCESS(f"END - Created {counter} Currency objects"))
