from django.core.management import BaseCommand

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
            obj, created = StartPage.objects.get_or_create(name=page)
            if created:
                counter += 1
                self.stdout.write(self.style.SUCCESS(f"Created StartPage {page}"))
            else:
                self.stdout.write(self.style.WARNING(f"StartPage {page} already exists"))

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {counter} StartPage objects")
        )