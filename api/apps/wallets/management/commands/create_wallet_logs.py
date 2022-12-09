from django.core.management import BaseCommand

from wallets.models import Wallet, WalletLog


class Command(BaseCommand):
    help = "Creating WalletLog objects for all wallets."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("START - Creating WalletLog objects for all wallets.")
        )

        wallets = Wallet.objects.filter(debt__isnull=True)
        self.stdout.write(f"Found {wallets.count()} wallets.")
        logs = WalletLog.objects.bulk_create(
            [
                WalletLog(
                    wallet=wallet,
                    balance=wallet.balance,
                    currency=wallet.currency.code,
                ) for wallet in wallets
            ]
        )

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {len(logs)} WalletLog objects")
        )
