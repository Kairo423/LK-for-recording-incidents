from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class IncidentType(models.Model):
    """Типы происшествий"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Название")
    severity_level = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Уровень серьезности"
    )
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Тип происшествия"
        verbose_name_plural = "Типы происшествий"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class IncidentStatus(models.Model):
    """Статусы происшествий"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Название")
    is_closed = models.BooleanField(default=False, verbose_name="Завершен")
    sort_order = models.IntegerField(default=0, verbose_name="Порядок сортировки")
    
    class Meta:
        verbose_name = "Статус происшествия"
        verbose_name_plural = "Статусы происшествий"
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class Incident(models.Model):
    """Основная модель происшествия"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident_number = models.CharField(max_length=50, unique=True, verbose_name="Номер")
    
    # Связи
    incident_type = models.ForeignKey(
        IncidentType,
        on_delete=models.PROTECT,
        related_name='incidents',
        verbose_name="Тип происшествия"
    )
    department = models.ForeignKey(
        'users.Department',
        on_delete=models.PROTECT,
        related_name='incidents',
        verbose_name="Подразделение"
    )
    status = models.ForeignKey(
        IncidentStatus,
        on_delete=models.PROTECT,
        related_name='incidents',
        verbose_name="Статус"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_incidents',
        verbose_name="Автор"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents',
        verbose_name="Ответственный"
    )
    
    # Основные поля
    description = models.TextField(verbose_name="Описание")
    measures_taken = models.TextField(blank=True, verbose_name="Принятые меры")
    responsible_person = models.CharField(max_length=100, blank=True, verbose_name="Ответственное лицо")
    
    # Даты
    incident_date = models.DateField(verbose_name="Дата происшествия")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")
    
    # Дополнительные поля для аналитики
    incident_cost = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Стоимость ущерба"
    )
    downtime_hours = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Часы простоя"
    )
    affected_employees = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Пострадавшие сотрудники"
    )
    
    class Meta:
        verbose_name = "Происшествие"
        verbose_name_plural = "Происшествия"
        ordering = ['-incident_date', '-created_at']
        permissions = [
            ("view_all_incidents", "Может просматривать все происшествия"),
            ("export_incidents", "Может экспортировать происшествия"),
        ]
        indexes = [
            models.Index(fields=['incident_number']),
            models.Index(fields=['incident_date']),
            models.Index(fields=['author']),
            models.Index(fields=['department']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.incident_number} - {self.incident_type.name}"
    
    def save(self, *args, **kwargs):
        # Автоматически устанавливаем resolved_at при закрытии
        if self.status.is_closed and not self.resolved_at:
            from django.utils import timezone
            self.resolved_at = timezone.now()
        elif not self.status.is_closed:
            self.resolved_at = None
        super().save(*args, **kwargs)
    
    def can_user_view(self, user):
        """Проверка, может ли пользователь просматривать это происшествие"""
        if user.is_superuser:
            return True
        
        # Администратор видит всё
        if user.groups.filter(name='Администратор').exists():
            return True
        
        # Руководитель видит происшествия своего подразделения
        if user.groups.filter(name='Руководитель').exists():
            if hasattr(user, 'profile') and user.profile.department == self.department:
                return True
        
        # Сотрудник видит только свои происшествия
        if user.groups.filter(name='Сотрудник').exists():
            return self.author == user
        
        return False


class IncidentComment(models.Model):
    """Комментарии к происшествиям"""
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Происшествие"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='incident_comments',
        verbose_name="Автор"
    )
    comment = models.TextField(verbose_name="Комментарий")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата комментария")
    
    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Комментарий от {self.user.username}"


class IncidentAttachment(models.Model):
    """Вложения к происшествиям"""
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name="Происшествие"
    )
    file = models.FileField(upload_to='incidents/%Y/%m/%d/', verbose_name="Файл")
    file_name = models.CharField(max_length=255, verbose_name="Имя файла")
    file_size = models.IntegerField(null=True, blank=True, verbose_name="Размер файла (байт)")
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_attachments',
        verbose_name="Загрузил"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")
    
    class Meta:
        verbose_name = "Вложение"
        verbose_name_plural = "Вложения"
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.file_name