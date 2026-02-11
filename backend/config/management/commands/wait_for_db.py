from django.core.management.base import BaseCommand
from scripts.wait_for_db import wait_for_db

class Command(BaseCommand):
    help = 'Waits for database to be available'

    def handle(self, *args, **options):
        self.stdout.write('Waiting for database...')
        if wait_for_db():
            self.stdout.write(self.style.SUCCESS('Database available!'))
        else:
            self.stdout.write(self.style.ERROR('Database connection failed!'))