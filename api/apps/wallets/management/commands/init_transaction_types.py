from django.core.management import BaseCommand

from decorations.models import Icon
from wallets.models import TransactionType


class Command(BaseCommand):
    help = "Create missing TransactionType objects in the database."

    def handle(self, *args, **options):
        try:
            transaction_types = [
                {"income": True, "icon": Icon.objects.get(code="arrow-up")},
                {"income": False, "icon": Icon.objects.get(code="arrow-down")},
                {"income": None, "icon": Icon.objects.get(code="arrows-rotate")},
            ]
        except Icon.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("Icons are not initialized yet, aborting command")
            )
            return
        self.stdout.write(self.style.SUCCESS("START - Creating missing TransactionType objects"))

        counter = 0
        for t_type in transaction_types:
            obj, created = TransactionType.objects.get_or_create(
                income=t_type["income"], icon=t_type["icon"]
            )
            if created:
                counter += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created TransactionType: {obj.income}, {obj.icon}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"TransactionType {obj.income} {obj.icon} already exists"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {counter} TransactionType objects")
        )
