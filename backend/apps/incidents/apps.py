from django.apps import AppConfig

class IncidentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.incidents'
    # Keep legacy label so existing migrations that reference 'incidents' keep working
    label = 'incidents'
    verbose_name = 'Управление происшествиями'
    
    def ready(self):
        import apps.incidents.signals