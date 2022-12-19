from django.core.management import BaseCommand
from django.db import connection

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
            with connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT EXISTS("
                    f"SELECT 1 FROM {NewsLanguage._meta.db_table} "
                    f"WHERE code=%s);",
                    [language]
                )
                exists = cursor.fetchone()[0]
            if exists:
                self.stdout.write(
                    self.style.WARNING(
                        f"NewsLanguage {language} already exists"
                    )
                )
            else:
                with connection.cursor() as cursor:
                    cursor.execute(
                        f"INSERT INTO {NewsLanguage._meta.db_table}(code)"
                        f" VALUES(%s);",
                        [language]
                    )
                counter += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created NewsLanguage: {language}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {counter} NewsLanguage objects")
        )
