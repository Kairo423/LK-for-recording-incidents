from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import UserProfile, Department


class GroupSerializer(serializers.ModelSerializer):
    """Сериализатор для групп (ролей)"""
    class Meta:
        model = Group
        fields = ['id', 'name']


class DepartmentSerializer(serializers.ModelSerializer):
    """Сериализатор для подразделений"""
    manager_name = serializers.CharField(source='manager.profile.full_name', read_only=True)
    children_count = serializers.IntegerField(source='children.count', read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'parent_department', 'manager', 'manager_name', 
                  'children_count', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Сериализатор для профиля пользователя"""
    class Meta:
        model = UserProfile
        fields = ['patronymic', 'department', 'position', 'phone', 'full_name']


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователя"""
    profile = UserProfileSerializer(read_only=True)
    groups = GroupSerializer(many=True, read_only=True)
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    department_name = serializers.CharField(source='profile.department.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'profile', 'groups', 'full_name', 'department_name', 
                  'is_active', 'last_login']


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания/обновления пользователя"""
    patronymic = serializers.CharField(write_only=True, required=False, allow_blank=True)
    # department_id/position may be omitted during PATCH flows (partial updates)
    # and department_id can be explicitly null from the client — treat that as
    # "no change" on update rather than a validation error.
    department_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    position = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    group_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        required=False,
        help_text="IDs групп (ролей)"
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name',
                  'patronymic', 'department_id', 'position', 'phone', 'group_ids',
                  'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        patronymic = validated_data.pop('patronymic', '')
        department_id = validated_data.pop('department_id', None)
        position = validated_data.pop('position', 'Не указана')
        phone = validated_data.pop('phone', '')
        group_ids = validated_data.pop('group_ids', [])
        
        # Создаем пользователя
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Создаем или обновляем профиль
        # Если department_id не указан, назначаем дефолтное подразделение "Не назначено"
        if department_id is None:
            department, _ = Department.objects.get_or_create(name='Не назначено', defaults={'name': 'Не назначено'})
        else:
            department = Department.objects.get(id=department_id)
        UserProfile.objects.update_or_create(
            user=user,
            defaults={
                'patronymic': patronymic,
                'department': department,
                'position': position,
                'phone': phone
            }
        )
        
        # Добавляем группы
        if group_ids:
            groups = Group.objects.filter(id__in=group_ids)
            user.groups.set(groups)
        
        return user
    
    def update(self, instance, validated_data):
        patronymic = validated_data.pop('patronymic', None)
        department_id = validated_data.pop('department_id', None)
        position = validated_data.pop('position', None)
        phone = validated_data.pop('phone', None)
        group_ids = validated_data.pop('group_ids', None)
        
        # Обновляем пользователя
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        
        # Обновляем профиль
        if hasattr(instance, 'profile'):
            profile = instance.profile
            if patronymic is not None:
                profile.patronymic = patronymic
            # If department_id is provided and not null, update it. If it's null
            # we treat it as "no change" to avoid setting a non-nullable FK to null.
            if department_id is not None:
                try:
                    profile.department_id = department_id
                except Exception:
                    # ignore invalid department ids here; validation should
                    # normally catch this earlier, but be defensive
                    pass
            if position is not None:
                profile.position = position
            if phone is not None:
                profile.phone = phone
            profile.save()
        
        # Обновляем группы
        if group_ids is not None:
            groups = Group.objects.filter(id__in=group_ids)
            instance.groups.set(groups)
        
        return instance


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления профиля (для раздела Профиль)"""
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'first_name', 'last_name', 'patronymic',
                  'department', 'position', 'phone']
        read_only_fields = ['username', 'email', 'first_name', 'last_name', 
                           'patronymic', 'department', 'position']
    
    def update(self, instance, validated_data):
        # Разрешаем обновлять только phone
        if 'phone' in validated_data:
            instance.phone = validated_data['phone']
            instance.save()
        return instance