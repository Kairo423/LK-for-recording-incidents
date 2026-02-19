from rest_framework import permissions

class CanViewIncident(permissions.BasePermission):
    """Проверка прав на просмотр происшествия"""
    
    def has_permission(self, request, view):
        """Глобальная проверка: позволяем доступ к спискам/статистике авторизованным пользователям."""
        # Allow authenticated users to access list-like endpoints (statistics/list)
        if getattr(view, 'action', None) in ('list', 'statistics'):
            return request.user and request.user.is_authenticated
        # For other actions, defer to object-level checks
        return True

    def has_object_permission(self, request, view, obj):
        return obj.can_user_view(request.user)


class CanEditIncident(permissions.BasePermission):
    """Проверка прав на редактирование происшествия"""
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Администратор может редактировать всё
        if user.groups.filter(name='Администратор').exists():
            return True
        
        # Руководитель может редактировать происшествия своего подразделения
        if user.groups.filter(name='Руководитель').exists():
            return obj.department == user.profile.department
        
        # Сотрудник может редактировать только свои
        return obj.author == user


class CanDeleteIncident(permissions.BasePermission):
    """Проверка прав на удаление происшествия"""
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        # Только администратор может удалять
        return user.groups.filter(name='Администратор').exists()


class CanExportReports(permissions.BasePermission):
    """Проверка прав на экспорт отчетов"""
    
    def has_permission(self, request, view):
        user = request.user
        return (user.groups.filter(name='Администратор').exists() or 
                user.groups.filter(name='Руководитель').exists())


class CanViewAnalytics(permissions.BasePermission):
    """Проверка прав на просмотр аналитики"""
    
    def has_permission(self, request, view):
        user = request.user
        return (user.groups.filter(name='Администратор').exists() or 
                user.groups.filter(name='Руководитель').exists())