from django.db import models
from django.contrib.auth.models import User


class Department(models.Model):
    """Модель подразделения"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Название")
    parent_department = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='children',
        verbose_name="Родительское подразделение"
    )
    manager = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='managed_departments',
        verbose_name="Руководитель"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Подразделение"
        verbose_name_plural = "Подразделения"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Профиль пользователя (расширение стандартной модели User)"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name="Пользователь"
    )
    patronymic = models.CharField(max_length=50, blank=True, verbose_name="Отчество")
    department = models.ForeignKey(
        Department, 
        on_delete=models.PROTECT,
        related_name='employees',
        verbose_name="Подразделение"
    )
    position = models.CharField(max_length=100, verbose_name="Должность")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Телефон")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.department.name}"
    
    @property
    def full_name(self):
        """Полное имя с отчеством"""
        parts = [self.user.last_name, self.user.first_name, self.patronymic]
        return ' '.join(filter(None, parts))
    
    @property
    def roles(self):
        """Получение списка ролей пользователя (из групп)"""
        return self.user.groups.all()
    
    def has_role(self, role_name):
        """Проверка наличия роли (группы)"""
        return self.user.groups.filter(name=role_name).exists()
    
    def get_main_role(self):
        """Получение основной роли (первой группы)"""
        return self.user.groups.first()


class SystemSettings(models.Model):
    """Глобальные системные настройки (singleton)."""

    access_token_lifetime_minutes = models.PositiveIntegerField(
        default=60,
        verbose_name="Время жизни access-токена (мин)",
        help_text="Продолжительность действия access-токена в минутах"
    )
    refresh_token_lifetime_days = models.PositiveIntegerField(
        default=7,
        verbose_name="Время жизни refresh-токена (дни)",
        help_text="Продолжительность действия refresh-токена в днях"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    singleton_enforcer = models.BooleanField(default=True, editable=False, unique=True)

    class Meta:
        verbose_name = "Системная настройка"
        verbose_name_plural = "Системные настройки"

    def __str__(self):
        return "Настройки токенов"

    def save(self, *args, **kwargs):
        # гарантируем единичную запись
        self.singleton_enforcer = True
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(defaults={
            'access_token_lifetime_minutes': 60,
            'refresh_token_lifetime_days': 7,
        })
        return obj