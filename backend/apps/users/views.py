from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models import Q
from .serializers import (
    UserSerializer, UserCreateUpdateSerializer, GroupSerializer,
    UserProfileSerializer, DepartmentSerializer
)
from .permissions import IsManager, IsAdmin, IsEmployeeOrReadOnly

User = get_user_model()

# Swagger/OpenAPI helpers
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import DepartmentSerializer
from .permissions import IsAdmin

@swagger_auto_schema(method='post', request_body=UserCreateUpdateSerializer, responses={201: UserSerializer})
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Регистрация нового пользователя.

    Создание пользователя делегируется сериализатору `UserCreateUpdateSerializer`.
    Обычно регистрацией и назначением групп занимается админ через админку;
    endpoint оставлен для совместимости/tests.
    """
    serializer = UserCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'groups': groups,
            'message': 'Пользователь успешно зарегистрирован'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(method='post', request_body=openapi.Schema(type=openapi.TYPE_OBJECT, properties={'email': openapi.Schema(type=openapi.TYPE_STRING), 'username': openapi.Schema(type=openapi.TYPE_STRING), 'password': openapi.Schema(type=openapi.TYPE_STRING)}), responses={200: UserSerializer})
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Вход в систему — поддерживается аутентификация по email или username.

    Ожидаемые поля: `password` и `email` или `username`.
    """
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not password or (not username and not email):
        return Response({'non_field_errors': ['Необходимо указать email/username и пароль']}, status=status.HTTP_400_BAD_REQUEST)

    # Если указан email — найдем username
    if email and not username:
        user_obj = User.objects.filter(email__iexact=email).first()
        if not user_obj:
            return Response({'non_field_errors': ['Неверное имя пользователя или пароль']}, status=status.HTTP_400_BAD_REQUEST)
        username = user_obj.get_username()

    from django.contrib.auth import authenticate
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'non_field_errors': ['Неверное имя пользователя или пароль']}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]
    role = 'employee'
    if user.groups.filter(name__iexact='Администратор').exists():
        role = 'admin'
    elif user.groups.filter(name__iexact='Руководитель').exists():
        role = 'manager'

    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
        'groups': groups,
        'role': role,
        'message': 'Вход выполнен успешно'
    })

@swagger_auto_schema(method='post', responses={200: openapi.Schema(type=openapi.TYPE_OBJECT, properties={'message': openapi.Schema(type=openapi.TYPE_STRING)})})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Выход из системы"""
    try:
        request.user.auth_token.delete()
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'message': 'Выход выполнен успешно'})

@swagger_auto_schema(method='get', responses={200: UserSerializer})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Получение профиля текущего пользователя"""
    user = request.user
    groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]
    
    return Response({
        'user': UserSerializer(user).data,
        'groups': groups,
        'permissions': list(user.get_all_permissions())
    })

@swagger_auto_schema(method='put', request_body=UserSerializer, responses={200: UserSerializer})
@swagger_auto_schema(method='patch', request_body=UserSerializer, responses={200: UserSerializer})
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Обновление профиля"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'user': serializer.data,
            'message': 'Профиль обновлен'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(method='get', responses={200: UserSerializer(many=True)})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list_view(request):
    """Получение списка пользователей (с правами)"""
    user = request.user
    
    if user.groups.filter(name='Администратор').exists():
        # Админ видит всех
        users = User.objects.all()
    elif user.groups.filter(name='Руководитель').exists():
        # Руководитель видит сотрудников своего отдела
        users = User.objects.filter(
            Q(department=user.department) | Q(id=user.id)
        )
    else:
        # Сотрудник видит только себя
        users = User.objects.filter(id=user.id)
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@swagger_auto_schema(method='get', responses={200: UserSerializer})
@swagger_auto_schema(method='patch', request_body=UserCreateUpdateSerializer, responses={200: UserSerializer})
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_detail_view(request, pk):
    """Получение информации о конкретном пользователе"""
    try:
        user = User.objects.get(pk=pk)
        
        # Проверка прав доступа
        if not request.user.groups.filter(name='Администратор').exists():
            if request.user.groups.filter(name='Руководитель').exists():
                if user.department != request.user.department:
                    return Response({'error': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
            elif request.user.id != user.id:
                return Response({'error': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
        
        # Если PATCH — пытаемся обновить (только админ может редактировать других пользователей)
        if request.method == 'PATCH':
            # Разрешаем обновлять только админом или самим пользователем
            is_admin = request.user.groups.filter(name='Администратор').exists()
            if not (is_admin or request.user.id == user.id):
                return Response({'error': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)

            serializer = UserCreateUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'user': UserSerializer(user).data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # GET — вернуть информацию
        serializer = UserSerializer(user)
        groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]

        return Response({
            'user': serializer.data,
            'groups': groups
        })
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

@swagger_auto_schema(method='get', responses={200: openapi.Schema(type=openapi.TYPE_OBJECT, properties={'groups': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT))})})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_groups_view(request):
    """Получение групп текущего пользователя"""
    groups = [{
        'id': g.id,
        'name': g.name,
        'permissions': [p.codename for p in g.permissions.all()]
    } for g in request.user.groups.all()]
    
    return Response({'groups': groups})

@swagger_auto_schema(method='get', responses={200: UserSerializer})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth_view(request):
    """Проверка авторизации"""
    return Response({
        'is_authenticated': True,
        'user': UserSerializer(request.user).data
    })


@swagger_auto_schema(method='get', responses={200: openapi.Schema(type=openapi.TYPE_OBJECT, properties={'user': openapi.Schema(type=openapi.TYPE_OBJECT), 'groups': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)), 'role': openapi.Schema(type=openapi.TYPE_STRING)})})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whoami(request):
    """Return current user info, groups and computed role (based on group membership)."""
    user = request.user
    groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]

    # role based strictly on group membership
    role = 'employee'
    if user.groups.filter(name__iexact='Администратор').exists() or user.groups.filter(name__iexact='Administrator').exists():
        role = 'admin'
    elif user.groups.filter(name__iexact='Руководитель').exists() or user.groups.filter(name__iexact='Manager').exists():
        role = 'manager'

    return Response({
        'user': UserSerializer(user).data,
        'groups': groups,
        'role': role
    })


@swagger_auto_schema(method='get', responses={200: GroupSerializer(many=True)})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_groups_view(request):
    """Возвращает полный список групп (ролей) — используется фронтендом для выпадающего списка ролей."""
    from django.contrib.auth.models import Group as AuthGroup
    groups = AuthGroup.objects.all().order_by('name')
    serializer = GroupSerializer(groups, many=True)
    return Response(serializer.data)


# --- New endpoint: update contact fields (email, phone) for current user ---
contact_request_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
        'phone': openapi.Schema(type=openapi.TYPE_STRING),
    }
)


@swagger_auto_schema(method='patch', request_body=contact_request_body, responses={200: UserSerializer})
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_contact_view(request):
    """Обновление контактных данных пользователя (email и/или phone).

    Обновляет поле `email` у модели User и `phone` в связанном UserProfile.
    При отсутствии профиля — операция по `phone` игнорируется.
    """
    user = request.user
    data = request.data
    updated = False

    # Update email on User
    if 'email' in data:
        email = data.get('email')
        if email and email != user.email:
            user.email = email
            user.save()
            updated = True

    # Update phone on profile (if exists)
    if 'phone' in data:
        phone = data.get('phone')
        profile = getattr(user, 'profile', None)
        if profile is not None and phone is not None:
            profile.phone = phone
            profile.save()
            updated = True

    if not updated:
        return Response({'message': 'Нет изменений'}, status=status.HTTP_200_OK)

    return Response({'user': UserSerializer(user).data, 'message': 'Контакты обновлены'})





# --- Departments API: list, create, delete ---
department_list_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER),
        'name': openapi.Schema(type=openapi.TYPE_STRING),
        'parent_department': openapi.Schema(type=openapi.TYPE_INTEGER, nullable=True),
        'manager': openapi.Schema(type=openapi.TYPE_INTEGER, nullable=True),
        'manager_name': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
        'children_count': openapi.Schema(type=openapi.TYPE_INTEGER)
    }
)


@swagger_auto_schema(method='get', responses={200: UserSerializer})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def departments_list_view(request):
    """Возвращает список подразделений"""
    from .serializers import DepartmentSerializer
    from .models import Department

    qs = Department.objects.all().order_by('name')
    serializer = DepartmentSerializer(qs, many=True)
    return Response(serializer.data)


@swagger_auto_schema(method='post', request_body=openapi.Schema(type=openapi.TYPE_OBJECT, properties={'name': openapi.Schema(type=openapi.TYPE_STRING), 'parent_department': openapi.Schema(type=openapi.TYPE_INTEGER), 'manager': openapi.Schema(type=openapi.TYPE_INTEGER)}), responses={201: department_list_schema})
@api_view(['POST'])
@permission_classes([IsAdmin])
def department_create_view(request):
    """Создание подразделения (только для админов)."""
    from .serializers import DepartmentSerializer
    serializer = DepartmentSerializer(data=request.data)
    if serializer.is_valid():
        dept = serializer.save()
        return Response(DepartmentSerializer(dept).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='delete', responses={204: 'No Content'})
@api_view(['DELETE'])
@permission_classes([IsAdmin])
def department_delete_view(request, pk):
    """Удаление подразделения (только для админов)."""
    from .models import Department
    try:
        dept = Department.objects.get(pk=pk)
        dept.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Department.DoesNotExist:
        return Response({'error': 'Подразделение не найдено'}, status=status.HTTP_404_NOT_FOUND)
