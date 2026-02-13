from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Доступ только для администраторов"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Администратор').exists() or
            request.user.is_superuser
        )

class IsManager(permissions.BasePermission):
    """Доступ для руководителей и администраторов"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.groups.filter(name='Руководитель').exists() or
            request.user.groups.filter(name='Администратор').exists() or
            request.user.is_superuser
        )

class IsEmployeeOrReadOnly(permissions.BasePermission):
    """Сотрудник может только читать, руководитель и админ могут изменять"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.groups.filter(
            name__in=['Руководитель', 'Администратор']
        ).exists() or request.user.is_superuser

class IsOwnerOrAdmin(permissions.BasePermission):
    """Доступ только владельцу или администратору"""
    
    def has_object_permission(self, request, view, obj):
        return obj.id == request.user.id or (
            request.user.groups.filter(name='Администратор').exists() or
            request.user.is_superuser
        )