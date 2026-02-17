from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Incident, IncidentType, IncidentStatus, 
    IncidentComment, IncidentAttachment
)


@admin.register(IncidentType)
class IncidentTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'severity_level', 'is_active', 'created_at']
    list_filter = ['is_active', 'severity_level']
    search_fields = ['name']
    list_editable = ['severity_level', 'is_active']


@admin.register(IncidentStatus)
class IncidentStatusAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_closed', 'sort_order']
    list_filter = ['is_closed']
    search_fields = ['name']
    list_editable = ['is_closed', 'sort_order']


class IncidentCommentInline(admin.TabularInline):
    model = IncidentComment
    extra = 0
    readonly_fields = ['user', 'comment', 'created_at']
    can_delete = False


class IncidentAttachmentInline(admin.TabularInline):
    model = IncidentAttachment
    extra = 0
    readonly_fields = ['file_name', 'file_size', 'uploaded_by', 'uploaded_at']
    can_delete = True


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = [
        'incident_number', 'incident_type', 'department', 
        'status_colored', 'incident_date', 'author_name', 'is_overdue'
    ]
    list_filter = ['incident_type', 'department', 'status', 'incident_date']
    search_fields = ['incident_number', 'description', 'responsible_person']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']
    inlines = [IncidentCommentInline, IncidentAttachmentInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('incident_number', 'incident_type', 'department', 'status')
        }),
        ('Детали', {
            'fields': ('description', 'measures_taken', 'responsible_person')
        }),
        ('Участники', {
            'fields': ('author', 'assigned_to')
        }),
        ('Даты', {
            'fields': ('incident_date', 'created_at', 'updated_at', 'resolved_at')
        }),
        ('Аналитика', {
            'fields': ('incident_cost', 'downtime_hours', 'affected_employees'),
            'classes': ('collapse',)
        }),
    )
    
    def status_colored(self, obj):
        colors = {
            'На рассмотрении': 'orange',
            'В работе': 'blue',
            'Завершено': 'green',
            'Отклонено': 'red'
        }
        color = colors.get(obj.status.name, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.status.name
        )
    status_colored.short_description = 'Статус'
    status_colored.admin_order_field = 'status'
    
    def author_name(self, obj):
        return obj.author.profile.full_name
    author_name.short_description = 'Автор'
    author_name.admin_order_field = 'author__last_name'
    
    def is_overdue(self, obj):
        if not obj.status.is_closed and obj.created_at:
            from django.utils import timezone
            from datetime import timedelta
            if timezone.now() - obj.created_at > timedelta(days=7):
                return format_html('<span style="color: red;">Просрочено</span>')
        return format_html('<span style="color: green;">Нет</span>')
    is_overdue.short_description = 'Просрочено'


@admin.register(IncidentComment)
class IncidentCommentAdmin(admin.ModelAdmin):
    list_display = ['incident', 'user', 'short_comment', 'created_at']
    list_filter = ['created_at']
    search_fields = ['comment', 'user__username']
    readonly_fields = ['created_at']
    
    def short_comment(self, obj):
        return obj.comment[:50] + ('...' if len(obj.comment) > 50 else '')
    short_comment.short_description = 'Комментарий'


@admin.register(IncidentAttachment)
class IncidentAttachmentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'incident', 'file_size_kb', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['file_name', 'incident__incident_number']
    readonly_fields = ['file_name', 'file_size', 'uploaded_at']
    
    def file_size_kb(self, obj):
        if obj.file_size:
            return f"{obj.file_size / 1024:.1f} KB"
        return '-'
    file_size_kb.short_description = 'Размер'