from django.core.management import BaseCommand
from investments.models import Investment

from wallets.models import Wallet


class Command(BaseCommand):
    help = "Depositing investment percents."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("START - Depositing investment percents"))
        wallets = Wallet.objects.raw(
            f"SELECT * FROM {Wallet._meta.db_table} ww "
            f"JOIN {Investment._meta.db_table} ii ON ww.id = ii.wallet_id "
            f"WHERE ww.balance > 0;"
        )
        counter = 0
        for wallet in wallets:
            wallet.deposit(wallet.balance * wallet.investment.percent / 100)
            counter += 1

        self.stdout.write(
            self.style.SUCCESS(f"END - Deposited {counter} investment percents")
        )
