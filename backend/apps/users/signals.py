from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile, Department


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Создание профиля при создании пользователя"""
    if created:
        # Получаем или создаем подразделение по умолчанию
        default_department, _ = Department.objects.get_or_create(
            name='Не назначено',
            defaults={'name': 'Не назначено'}
        )
        UserProfile.objects.create(
            user=instance,
            department=default_department,
            position='Не указана'
        )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Сохранение профиля при сохранении пользователя"""
    if hasattr(instance, 'profile'):
        instance.profile.save()