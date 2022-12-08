from django.core.management import BaseCommand

from news.models import NewsLanguage


class Command(BaseCommand):
    help = "Create missing NewsLanguage objects in the database."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("START - Creating missing NewsLanguage objects")
        )

        languages = [
            "ar",
            "bg",
            "bn",
            "cs",
            "da",
            "de",
            "el",
            "en",
            "es",
            "et",
            "fa",
            "fi",
            "fr",
            "he",
            "hi",
            "hr",
            "hu",
            "id",
            "it",
            "ja",
            "ko",
            "lt",
            "nl",
            "no",
            "pl",
            "pt",
            "ro",
            "ru",
            "sk",
            "sv",
            "ta",
            "th",
            "tr",
            "uk",
            "vi",
            "zh",
        ]

        counter = 0
        for language in languages:
            obj, created = NewsLanguage.objects.get_or_create(code=language)
            if created:
                counter += 1
                self.stdout.write(self.style.SUCCESS(f"Created NewsLanguage: {language}"))
            else:
                self.stdout.write(
                    self.style.WARNING(f"NewsLanguage {language} already exists")
                )

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {counter} NewsLanguage objects")
        )
