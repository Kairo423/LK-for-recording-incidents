from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import (
    UserSerializer, RegisterSerializer, 
    LoginSerializer, GroupSerializer
)
from .permissions import IsManager, IsAdmin, IsEmployeeOrReadOnly

User = get_user_model()

# Swagger/OpenAPI helpers
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(method='post', request_body=RegisterSerializer, responses={201: UserSerializer})
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Регистрация нового пользователя"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        
        # Получаем группы пользователя
        groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'groups': groups,
            'message': 'Пользователь успешно зарегистрирован'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(method='post', request_body=LoginSerializer, responses={200: UserSerializer})
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Вход в систему"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        
        # Получаем группы пользователя
        groups = [{'id': g.id, 'name': g.name} for g in user.groups.all()]
        
        # Определяем роль
        role = 'employee'
        if user.groups.filter(name='Администратор').exists():
            role = 'admin'
        elif user.groups.filter(name='Руководитель').exists():
            role = 'manager'
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'groups': groups,
            'role': role,
            'message': 'Вход выполнен успешно'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(method='post', responses={200: openapi.Schema(type=openapi.TYPE_OBJECT, properties={'message': openapi.Schema(type=openapi.TYPE_STRING)})})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Выход из системы"""
    try:
        request.user.auth_token.delete()
    except:
        pass
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
@api_view(['GET'])
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
