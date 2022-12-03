from django.core.management import BaseCommand

from decorations.models import Color


class Command(BaseCommand):
    help = "Create missing Color objects in the database."

    def handle(self, *args, **options):
        colors = [
            "#7A3EF8", "#F6BA1B", "#3E68D1", "#3EB5E8", "#EB4A82", "#555994", "#000000",
        ]
        self.stdout.write(self.style.SUCCESS("START - Creating missing Color objects"))

        counter = 0
        for color in colors:
            obj, created = Color.objects.get_or_create(hex_code=color)
            if created:
                counter += 1
                self.stdout.write(self.style.SUCCESS(f"Created Color {color}"))
            else:
                self.stdout.write(self.style.WARNING(f"Color {color} already exists"))

        self.stdout.write(self.style.SUCCESS(f"END - Created {counter} Color objects"))