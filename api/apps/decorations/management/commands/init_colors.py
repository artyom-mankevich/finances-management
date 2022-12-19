from django.core.management import BaseCommand
from django.db import connection

from decorations.models import Color


class Command(BaseCommand):
    help = "Create missing Color objects in the database."

    def handle(self, *args, **options):
        colors = [
            "#7A3EF8", "#F6BA1B", "#3E68D1", "#3EB5E8", "#EB4A82", "#555994",
        ]
        self.stdout.write(self.style.SUCCESS("START - Creating missing Color objects"))

        counter = 0
        for color in colors:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"INSERT INTO {Color._meta.db_table} (hex_code) VALUES (%s) "
                    f"ON CONFLICT (hex_code) DO NOTHING;",
                    [color]
                )
                if cursor.rowcount > 0:
                    counter += 1
                    self.stdout.write(self.style.SUCCESS(f"Created Color {color}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Color {color} already exists"))

        self.stdout.write(self.style.SUCCESS(f"END - Created {counter} Color objects"))