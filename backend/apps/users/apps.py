from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    # Preserve legacy short label for migrations created under 'users'
    label = 'users'
    verbose_name = 'Пользователи и профили'
    
    def ready(self):
        # import signals using full package path
        import apps.users.signals