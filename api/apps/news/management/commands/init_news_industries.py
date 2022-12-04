from django.core.management import BaseCommand

from news.models import NewsIndustry


class Command(BaseCommand):
    help = "Create missing NewsIndustry objects in the database."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("START - Creating missing NewsIndustry objects")
        )

        industries = [
            "Technology",
            "Industrials",
            "N/A",
            "Consumer Cyclical",
            "Healthcare",
            "Communication Services",
            "Financial Services",
            "Consumer Defensive",
            "Basic Materials",
            "Real Estate",
            "Energy",
            "Utilities",
            "Financial",
            "Services",
            "Consumer Goods",
            "Industrial Goods"
        ]

        counter = 0
        for industry in industries:
            obj, created = NewsIndustry.objects.get_or_create(name=industry)
            if created:
                counter += 1
                self.stdout.write(self.style.SUCCESS(f"Created NewsIndustry: {industry}"))
            else:
                self.stdout.write(
                    self.style.WARNING(f"NewsIndustry {industry} already exists")
                )

        self.stdout.write(
            self.style.SUCCESS(f"END - Created {counter} NewsIndustry objects")
        )
