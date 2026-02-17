from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Incident, IncidentComment, IncidentAttachment


@receiver(post_save, sender=Incident)
def incident_saved(sender, instance, created, **kwargs):
    """Сигнал при сохранении происшествия"""
    action = 'создано' if created else 'обновлено'
    print(f"Происшествие {instance.incident_number} {action}")


@receiver(post_delete, sender=Incident)
def incident_deleted(sender, instance, **kwargs):
    """Сигнал при удалении происшествия"""
    print(f"Происшествие {instance.incident_number} удалено")


@receiver(post_save, sender=IncidentComment)
def comment_saved(sender, instance, created, **kwargs):
    """Сигнал при добавлении комментария"""
    if created:
        print(f"Комментарий добавлен к {instance.incident.incident_number}")


@receiver(post_save, sender=IncidentAttachment)
def attachment_saved(sender, instance, created, **kwargs):
    """Сигнал при добавлении вложения"""
    if created:
        print(f"Вложение {instance.file_name} добавлено к {instance.incident.incident_number}")