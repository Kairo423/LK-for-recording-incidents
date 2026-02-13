from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'position', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'groups', 'department')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('phone', 'position', 'department'),
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительная информация', {
            'fields': ('phone', 'position', 'department'),
        }),
    )