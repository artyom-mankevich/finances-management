from django.core.management import BaseCommand

from decorations.models import Icon


class Command(BaseCommand):
    help = "Create missing Icon objects in the database."

    def handle(self, *args, **options):
        icons = [
            "house",
            "key",
            "paint-roller",
            "gavel",
            "champagne-glasses",
            "utensils",
            "car",
            "syringe",
            "person",
            "shirt",
            "plane",
            "phone",
            "globe",
            "paw",
            "baby-carriage",
            "dumbbell",
            "dice",
            "palette",
            "brain",
            "gift",
            "gas-pump",
            "arrow-up",
            "arrow-down",
            "arrows-rotate",
        ]
        self.stdout.write(self.style.SUCCESS("START - Creating missing Icon objects"))

        counter = 0
        for icon in icons:
            obj, created = Icon.objects.get_or_create(code=icon)
            if created:
                counter += 1
                self.stdout.write(f"Created Icon {icon}")
            else:
                self.stdout.write(self.style.WARNING(f"Icon '{icon}' already exists"))

        self.stdout.write(self.style.SUCCESS(f"END - Created {counter} Icon objects"))
