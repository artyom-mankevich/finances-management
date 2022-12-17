from django.core.management import BaseCommand
from wallets.models import Wallet


class Command(BaseCommand):
    help = "Depositing investment percents."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("START - Depositing investment percents"))
        wallets = Wallet.objects.filter(investment__isnull=False, balance__gt=0)
        counter = 0
        for wallet in wallets:
            wallet.deposit(wallet.balance * wallet.investment.percent / 100)
            counter += 1

        self.stdout.write(
            self.style.SUCCESS(f"END - Deposited {counter} investment percents")
        )
