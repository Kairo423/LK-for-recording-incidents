from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Создает группы сотрудников и назначает права'
    
    def handle(self, *args, **options):
        # Создаем группы
        groups_data = {
            'Сотрудник': {
                'can_view_own_profile': True,
                'can_edit_own_profile': True,
                'can_view_tasks': True,
                'can_create_tasks': False,
            },
            'Руководитель': {
                'can_view_all_profiles': True,
                'can_view_department_reports': True,
                'can_approve_requests': True,
                'can_create_tasks': True,
                'can_assign_tasks': True,
            },
            'Администратор': {
                'can_manage_users': True,
                'can_manage_groups': True,
                'can_manage_all_data': True,
                'can_view_system_logs': True,
            },
        }
        
        for group_name in groups_data.keys():
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Группа "{group_name}" создана'))
            else:
                self.stdout.write(f'Группа "{group_name}" уже существует')
        
        # Назначаем права для групп
        self.assign_permissions()
        
        self.stdout.write(self.style.SUCCESS('Группы успешно настроены!'))
    
    def assign_permissions(self):
        # Права для Сотрудника
        employee_group = Group.objects.get(name='Сотрудник')
        employee_permissions = [
            'view_user',  # просмотр своего профиля
            'change_user',  # редактирование своего профиля
        ]
        
        # Права для Руководителя
        manager_group = Group.objects.get(name='Руководитель')
        manager_permissions = [
            'view_user',  # просмотр всех пользователей
            'view_department_reports',  # просмотр отчетов отдела
        ]
        
        # Права для Администратора
        admin_group = Group.objects.get(name='Администратор')
        admin_permissions = [
            'add_user',
            'change_user',
            'delete_user',
            'view_user',
            'add_group',
            'change_group',
            'delete_group',
            'view_group',
        ]
        
        # Назначаем разрешения
        for perm_code in employee_permissions:
            try:
                perm = Permission.objects.get(codename=perm_code)
                employee_group.permissions.add(perm)
            except Permission.DoesNotExist:
                pass
        
        for perm_code in manager_permissions:
            try:
                perm = Permission.objects.get(codename=perm_code)
                manager_group.permissions.add(perm)
            except Permission.DoesNotExist:
                pass
        
        for perm_code in admin_permissions:
            try:
                perm = Permission.objects.get(codename=perm_code)
                admin_group.permissions.add(perm)
            except Permission.DoesNotExist:
                pass