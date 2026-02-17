from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Department


class UserProfileInline(admin.StackedInline):
    """Инлайн для профиля пользователя в админке"""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Профиль'


class UserAdmin(BaseUserAdmin):
    """Кастомный UserAdmin с профилем"""
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_department', 'is_active')
    list_select_related = ('profile', 'profile__department')
    
    def get_department(self, instance):
        return instance.profile.department.name if hasattr(instance, 'profile') else '-'
    get_department.short_description = 'Подразделение'


class DepartmentAdmin(admin.ModelAdmin):
    """Админка для подразделений"""
    list_display = ('name', 'parent_department', 'manager', 'created_at')
    list_filter = ('parent_department',)
    search_fields = ('name',)


# Перерегистрируем User модель
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Department, DepartmentAdmin)