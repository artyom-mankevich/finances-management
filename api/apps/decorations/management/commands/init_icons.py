from django.core.management import BaseCommand
from django.db import connection

from decorations.models import Icon


class Command(BaseCommand):
    help = "Create missing Icon objects in the database."

    def handle(self, *args, **options):
        icons = [
            "cottage",
            "key",
            "imagesearch_roller",
            "gavel",
            "wine_bar",
            "restaurant",
            "directions_car",
            "medical_services",
            "person",
            "checkroom",
            "flight",
            "smartphone",
            "payments",
            "shopping_bag",
            "pets",
            "stroller",
            "fitness_center",
            "casino",
            "palette",
            "school",
            "redeem",
            "local_gas_station",
            "paid",
            "arrow_upward",
            "arrow_downward",
            "sync",
        ]
        self.stdout.write(self.style.SUCCESS("START - Creating missing Icon objects"))

        counter = 0
        for icon in icons:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"INSERT INTO {Icon._meta.db_table} (code) VALUES (%s) "
                    f"ON CONFLICT (code) DO NOTHING;",
                    [icon]
                )
                if cursor.rowcount > 0:
                    counter += 1
                    self.stdout.write(self.style.SUCCESS(f"Created Icon {icon}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Icon {icon} already exists"))

        self.stdout.write(self.style.SUCCESS(f"END - Created {counter} Icon objects"))
