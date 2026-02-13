from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.authtoken.models import Token
from .models import User

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователя"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'position', 'department', 'phone', 'is_superuser')
        read_only_fields = ('id', 'is_superuser')

class RegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 
                  'first_name', 'last_name', 'position', 'department', 'phone')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Добавляем в группу "Сотрудник" по умолчанию
        from django.contrib.auth.models import Group
        employee_group, _ = Group.objects.get_or_create(name='Сотрудник')
        user.groups.add(employee_group)
        
        # Создаем токен для пользователя
        Token.objects.create(user=user)
        
        return user

class LoginSerializer(serializers.Serializer):
    """Сериализатор для входа.

    Поддерживает аутентификацию по email или по username. Фронтенд может посылать поле
    `email` и `password` (предпочтительно), либо `username` и `password`.
    """
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        if not password or (not username and not email):
            raise serializers.ValidationError("Необходимо указать email/username и пароль")

        # Если указан email — найдём username по нему (если пользователь существует)
        if email and not username:
            try:
                user_obj = User.objects.filter(email__iexact=email).first()
                if not user_obj:
                    raise serializers.ValidationError("Неверное имя пользователя или пароль")
                username = user_obj.get_username()
            except Exception:
                raise serializers.ValidationError("Неверное имя пользователя или пароль")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Неверное имя пользователя или пароль")

        if not user.is_active:
            raise serializers.ValidationError("Пользователь не активен")

        attrs['user'] = user
        return attrs

class GroupSerializer(serializers.Serializer):
    """Сериализатор для групп пользователя"""
    def to_representation(self, instance):
        return {
            'id': instance.id,
            'name': instance.name,
            'permissions': [p.codename for p in instance.permissions.all()]
        }