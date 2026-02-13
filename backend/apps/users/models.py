from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Кастомная модель пользователя
    """
    # Добавляем дополнительные поля
    phone = models.CharField(max_length=15, blank=True)
    position = models.CharField(max_length=100, blank=True, verbose_name="Должность")
    department = models.CharField(max_length=100, blank=True, verbose_name="Отдел")
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"