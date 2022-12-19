from django.core.management import BaseCommand

from wallets.models import Wallet, WalletLog


class Command(BaseCommand):
    help = "Creating WalletLog objects for all wallets."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("START - Creating WalletLog objects for all wallets.")
        )

        wallets = Wallet.objects.raw(
            "SELECT ww.* FROM wallets_wallet ww "
            "LEFT JOIN wallets_debt wd on ww.id = wd.wallet_id "
            "WHERE wd.id IS NULL"
        )
        self.stdout.write(f"Found {len(wallets)} wallets.")
        count = 0
        for wallet in wallets:
            WalletLog.objects.create(
                wallet=wallet, balance=wallet.balance, currency=wallet.currency.code
            )
            count += 1
            self.stdout.write(f"Created WalletLog for wallet {wallet.id}.")

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {count} WalletLog objects")
        )
