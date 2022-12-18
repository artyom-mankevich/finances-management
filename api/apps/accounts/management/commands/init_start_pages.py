from django.core.management import BaseCommand
from django.db import connection

from accounts.models import StartPage


class Command(BaseCommand):
    help = "Create missing StartPage objects in the database."

    def handle(self, *args, **options):
        pages = [
            "Overview",
            "Debts",
            "Crypto",
            "Stocks",
            "Transactions",
            "Wallets",
            "Analytics",
            "Investments",
        ]
        self.stdout.write(
            self.style.SUCCESS("START - Creating missing StartPage objects")
        )

        counter = 0
        for page in pages:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT EXISTS("
                    f"SELECT 1 FROM {StartPage._meta.db_table} WHERE name=%s);",
                    [page]
                )
                exists = cursor.fetchone()[0]
            if exists:
                self.stdout.write(
                    self.style.WARNING(
                        f"StartPage {page} already exists"
                    )
                )
            else:
                with connection.cursor() as cursor:
                    cursor.execute(
                        f"INSERT INTO {StartPage._meta.db_table}(name)"
                        f" VALUES(%s);",
                        [page]
                    )
                counter += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created StartPage: {page}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {counter} StartPage objects")
        )