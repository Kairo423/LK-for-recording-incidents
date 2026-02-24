from django.db import migrations


def create_statuses(apps, schema_editor):
    IncidentStatus = apps.get_model('incidents', 'IncidentStatus')
    # Create statuses only if they don't exist
    statuses = [
        {'name': 'Новое', 'is_closed': False, 'sort_order': 0},
        {'name': 'В работе', 'is_closed': False, 'sort_order': 1},
        {'name': 'Завершено', 'is_closed': True, 'sort_order': 2},
    ]
    for s in statuses:
        IncidentStatus.objects.get_or_create(name=s['name'], defaults={'is_closed': s['is_closed'], 'sort_order': s['sort_order']})


def remove_statuses(apps, schema_editor):
    IncidentStatus = apps.get_model('incidents', 'IncidentStatus')
    for name in ['Новое', 'В работе', 'Завершено']:
        try:
            obj = IncidentStatus.objects.filter(name=name)
            obj.delete()
        except Exception:
            pass


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0002_incidenttype_color'),
    ]

    operations = [
        migrations.RunPython(create_statuses, remove_statuses),
    ]
