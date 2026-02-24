from django.db import migrations, models


def create_settings(apps, schema_editor):
    SystemSettings = apps.get_model('users', 'SystemSettings')
    SystemSettings.objects.create(
        access_token_lifetime_minutes=60,
        refresh_token_lifetime_days=7,
    )


def remove_settings(apps, schema_editor):
    SystemSettings = apps.get_model('users', 'SystemSettings')
    SystemSettings.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_token_lifetime_minutes', models.PositiveIntegerField(default=60, help_text='Продолжительность действия access-токена в минутах', verbose_name='Время жизни access-токена (мин)')),
                ('refresh_token_lifetime_days', models.PositiveIntegerField(default=7, help_text='Продолжительность действия refresh-токена в днях', verbose_name='Время жизни refresh-токена (дни)')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('singleton_enforcer', models.BooleanField(default=True, editable=False, unique=True)),
            ],
            options={
                'verbose_name': 'Системная настройка',
                'verbose_name_plural': 'Системные настройки',
            },
        ),
        migrations.RunPython(create_settings, remove_settings),
    ]
