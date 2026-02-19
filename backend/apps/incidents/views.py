from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
import openpyxl
from django.http import HttpResponse
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    Incident, IncidentType, IncidentStatus, 
    IncidentComment, IncidentAttachment
)
from .serializers import (
    IncidentListSerializer, IncidentDetailSerializer,
    IncidentCreateUpdateSerializer, IncidentTypeSerializer,
    IncidentStatusSerializer, IncidentCommentSerializer,
    IncidentAttachmentSerializer
)
from .permissions import (
    CanViewIncident, CanEditIncident, CanDeleteIncident,
    CanExportReports, CanViewAnalytics
)
from .filters import IncidentFilter


class IncidentViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с происшествиями"""
    queryset = Incident.objects.all().select_related(
        'incident_type', 'department', 'status', 
        'author', 'assigned_to', 'author__profile', 'assigned_to__profile'
    ).prefetch_related('comments', 'attachments')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = IncidentFilter
    search_fields = ['incident_number', 'description', 'responsible_person']
    ordering_fields = ['incident_date', 'created_at', 'incident_number']
    ordering = ['-incident_date']
    
    def get_permissions(self):
        """Разные права для разных действий"""
        if self.action in ['create']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, CanEditIncident]
        elif self.action in ['destroy']:
            permission_classes = [IsAuthenticated, CanDeleteIncident]
        elif self.action in ['export', 'analytics']:
            permission_classes = [IsAuthenticated, CanExportReports]
        elif self.action in ['statistics']:
            # Statistics endpoint should be available to any authenticated user
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, CanViewIncident]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Разные сериализаторы для разных действий"""
        if self.action == 'list':
            return IncidentListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return IncidentCreateUpdateSerializer
        return IncidentDetailSerializer
    
    def get_queryset(self):
        """Фильтрация queryset в зависимости от роли пользователя"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Администратор видит всё
        if user.groups.filter(name='Администратор').exists():
            return queryset
        
        # Для всех остальных ролей (Руководитель и Сотрудник) показываем
        # происшествия, относящиеся к подразделению пользователя.
        # Если профиль или подразделение не указаны — возвращаем пустой набор.
        try:
            dept = user.profile.department
        except Exception:
            dept = None

        if dept is None:
            return queryset.none()

        return queryset.filter(department=dept)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Добавление комментария к происшествию"""
        incident = self.get_object()
        serializer = IncidentCommentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                incident=incident,
                user=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """Добавление вложения к происшествию"""
        incident = self.get_object()
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attachment = IncidentAttachment.objects.create(
            incident=incident,
            file=file_obj,
            file_name=file_obj.name,
            file_size=file_obj.size,
            uploaded_by=request.user
        )
        
        serializer = IncidentAttachmentSerializer(
            attachment, 
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Статистика для главной страницы"""
        user = request.user
        queryset = self.get_queryset()
        
        # Общая статистика
        total = queryset.count()
        
        # Статистика по статусам
        by_status = queryset.values('status__name', 'status__is_closed').annotate(
            count=Count('id')
        ).order_by('status__sort_order')
        
        # Статистика по типам
        by_type = queryset.values('incident_type__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Последние 5 происшествий
        last_5 = IncidentListSerializer(
            queryset.order_by('-incident_date')[:5],
            many=True,
            context={'request': request}
        ).data
        
        # Статистика для текущего пользователя
        user_stats = {}
        if user.groups.filter(name='Сотрудник').exists():
            user_stats = {
                'my_total': queryset.filter(author=user).count(),
                'my_open': queryset.filter(author=user, status__is_closed=False).count(),
                'my_closed': queryset.filter(author=user, status__is_closed=True).count()
            }
        
        return Response({
            'total': total,
            'by_status': by_status,
            'by_type': by_type,
            'last_5': last_5,
            'user_stats': user_stats
        })
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Расширенная аналитика для отчета"""
        if not CanViewAnalytics().has_permission(request, self):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        
        # Параметры из запроса
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(incident_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(incident_date__lte=date_to)
        
        # Аналитика по подразделениям
        by_department = queryset.values(
            'department__name'
        ).annotate(
            count=Count('id'),
            avg_cost=Avg('incident_cost'),
            total_downtime=Sum('downtime_hours')
        ).order_by('-count')
        
        # Аналитика по месяцам
        by_month = queryset.extra(
            {'month': "to_char(incident_date, 'YYYY-MM')"}
        ).values('month').annotate(
            count=Count('id'),
            closed_count=Count('id', filter=Q(status__is_closed=True))
        ).order_by('month')
        
        # Стоимостная аналитика
        cost_analytics = queryset.aggregate(
            total_cost=Sum('incident_cost'),
            avg_cost=Avg('incident_cost'),
            max_cost=models.Max('incident_cost'),
            min_cost=models.Min('incident_cost')
        )
        
        return Response({
            'by_department': by_department,
            'by_month': by_month,
            'cost_analytics': cost_analytics,
            'total_incidents': queryset.count(),
            'closed_incidents': queryset.filter(status__is_closed=True).count(),
            'avg_resolution_days': queryset.filter(
                resolved_at__isnull=False
            ).extra(
                select={'avg_days': "AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400)"}
            ).values('avg_days')
        })
    
    @action(detail=False, methods=['get', 'post'])
    def export(self, request):
        """Экспорт происшествий в Excel"""
        if not CanExportReports().has_permission(request, self):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Получаем отфильтрованный queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Создаем Excel файл
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Происшествия"
        
        # Заголовки
        headers = [
            'Номер', 'Тип', 'Подразделение', 'Статус', 
            'Дата', 'Описание', 'Автор', 'Ответственный',
            'Меры', 'Стоимость', 'Простой (часы)'
        ]
        ws.append(headers)
        
        # Данные
        for incident in queryset:
            ws.append([
                incident.incident_number,
                incident.incident_type.name,
                incident.department.name,
                incident.status.name,
                incident.incident_date.strftime('%d.%m.%Y'),
                incident.description[:100] + ('...' if len(incident.description) > 100 else ''),
                incident.author.profile.full_name,
                incident.assigned_to.profile.full_name if incident.assigned_to else '',
                incident.measures_taken[:100] if incident.measures_taken else '',
                float(incident.incident_cost) if incident.incident_cost else 0,
                incident.downtime_hours or 0
            ])
        
        # Настройка ответа
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=incidents_{timezone.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        wb.save(response)
        return response


class IncidentTypeViewSet(viewsets.ModelViewSet):
    """ViewSet для типов происшествий. Администраторы могут создавать/редактировать/удалять."""
    queryset = IncidentType.objects.all()
    serializer_class = IncidentTypeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def _is_admin(self):
        user = self.request.user
        return user and user.is_authenticated and user.groups.filter(name='Администратор').exists()

    def create(self, request, *args, **kwargs):
        if not self._is_admin():
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not self._is_admin():
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not self._is_admin():
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not self._is_admin():
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        # Soft-delete: mark is_active False instead of deleting
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class IncidentStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для статусов происшествий"""
    queryset = IncidentStatus.objects.all()
    serializer_class = IncidentStatusSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class IncidentCommentViewSet(viewsets.ModelViewSet):
    """ViewSet для комментариев"""
    queryset = IncidentComment.objects.all()
    serializer_class = IncidentCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(incident_id=self.kwargs.get('incident_pk'))
    
    def perform_create(self, serializer):
        serializer.save(
            incident_id=self.kwargs.get('incident_pk'),
            user=self.request.user
        )