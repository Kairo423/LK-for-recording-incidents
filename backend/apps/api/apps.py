from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'apps.api'
    # Keep legacy short label for migrations created under 'api'
    label = 'api'
