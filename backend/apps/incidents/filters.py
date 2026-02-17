import django_filters
from django.db import models
from .models import Incident

class IncidentFilter(django_filters.FilterSet):
    """Фильтры для происшествий"""
    # Фильтры по внешним ключам
    incident_type = django_filters.NumberFilter(field_name='incident_type__id')
    incident_type_name = django_filters.CharFilter(field_name='incident_type__name', lookup_expr='icontains')
    
    department = django_filters.NumberFilter(field_name='department__id')
    department_name = django_filters.CharFilter(field_name='department__name', lookup_expr='icontains')
    
    status = django_filters.NumberFilter(field_name='status__id')
    status_name = django_filters.CharFilter(field_name='status__name', lookup_expr='icontains')
    
    author = django_filters.NumberFilter(field_name='author__id')
    author_name = django_filters.CharFilter(field_name='author__profile__full_name', lookup_expr='icontains')
    
    assigned_to = django_filters.NumberFilter(field_name='assigned_to__id')
    
    # Фильтры по датам
    date_from = django_filters.DateFilter(field_name='incident_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='incident_date', lookup_expr='lte')
    
    created_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    resolved_from = django_filters.DateTimeFilter(field_name='resolved_at', lookup_expr='gte')
    resolved_to = django_filters.DateTimeFilter(field_name='resolved_at', lookup_expr='lte')
    
    # Булевы фильтры
    is_closed = django_filters.BooleanFilter(method='filter_is_closed')
    is_overdue = django_filters.BooleanFilter(method='filter_is_overdue')
    
    # Числовые фильтры
    min_cost = django_filters.NumberFilter(field_name='incident_cost', lookup_expr='gte')
    max_cost = django_filters.NumberFilter(field_name='incident_cost', lookup_expr='lte')
    
    min_downtime = django_filters.NumberFilter(field_name='downtime_hours', lookup_expr='gte')
    max_downtime = django_filters.NumberFilter(field_name='downtime_hours', lookup_expr='lte')
    
    class Meta:
        model = Incident
        fields = {
            'incident_number': ['exact', 'icontains'],
            'description': ['icontains'],
            'responsible_person': ['icontains'],
            'measures_taken': ['icontains'],
        }
    
    def filter_is_closed(self, queryset, name, value):
        """Фильтр по завершенным/незавершенным"""
        if value:
            return queryset.filter(status__is_closed=True)
        return queryset.filter(status__is_closed=False)
    
    def filter_is_overdue(self, queryset, name, value):
        """Фильтр по просроченным (в работе более 7 дней)"""
        from django.utils import timezone
        from datetime import timedelta
        
        if value:
            # Просроченные - в работе более 7 дней и не закрыты
            return queryset.filter(
                status__is_closed=False,
                created_at__lte=timezone.now() - timedelta(days=7)
            )
        else:
            # Не просроченные
            return queryset.exclude(
                status__is_closed=False,
                created_at__lte=timezone.now() - timedelta(days=7)
            )