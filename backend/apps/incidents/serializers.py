from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Incident, IncidentType, IncidentStatus, 
    IncidentComment, IncidentAttachment
)
from apps.users.serializers import UserSerializer, DepartmentSerializer


class IncidentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentType
        fields = ['id', 'name', 'severity_level', 'is_active']


class IncidentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentStatus
        fields = ['id', 'name', 'is_closed', 'sort_order']


class IncidentCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.profile.full_name', read_only=True)
    
    class Meta:
        model = IncidentComment
        fields = ['id', 'user', 'user_name', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']


class IncidentAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.profile.full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = IncidentAttachment
        fields = ['id', 'file_name', 'file_url', 'file_size', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at', 'file_name', 'file_size']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class IncidentListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка происшествий"""
    incident_type_name = serializers.CharField(source='incident_type.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    status_color = serializers.SerializerMethodField()
    author_name = serializers.CharField(source='author.profile.full_name', read_only=True)
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_number', 'incident_type_name', 'department_name',
            'incident_date', 'status_name', 'status_color', 'description',
            'author_name', 'created_at'
        ]
    
    def get_status_color(self, obj):
        if obj.status.is_closed:
            return 'green'
        elif obj.status.name == 'В работе':
            return 'blue'
        elif obj.status.name == 'На рассмотрении':
            return 'orange'
        return 'gray'


class IncidentDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детальной информации о происшествии"""
    incident_type = IncidentTypeSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    status = IncidentStatusSerializer(read_only=True)
    author = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    comments = IncidentCommentSerializer(many=True, read_only=True)
    attachments = IncidentAttachmentSerializer(many=True, read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = '__all__'
    
    def get_can_edit(self, obj):
        user = self.context['request'].user
        return (user == obj.author or 
                user.groups.filter(name='Администратор').exists() or
                (user.groups.filter(name='Руководитель').exists() and 
                 user.profile.department == obj.department))
    
    def get_can_delete(self, obj):
        user = self.context['request'].user
        return user.groups.filter(name='Администратор').exists()


class IncidentCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания/обновления происшествий"""
    
    class Meta:
        model = Incident
        fields = [
            'incident_number', 'incident_type', 'department', 'status',
            'description', 'measures_taken', 'responsible_person',
            'assigned_to', 'incident_date', 'incident_cost',
            'downtime_hours', 'affected_employees'
        ]
    
    def validate_incident_number(self, value):
        """Проверка уникальности номера происшествия"""
        if self.instance:
            if Incident.objects.exclude(pk=self.instance.pk).filter(incident_number=value).exists():
                raise serializers.ValidationError("Происшествие с таким номером уже существует")
        else:
            if Incident.objects.filter(incident_number=value).exists():
                raise serializers.ValidationError("Происшествие с таким номером уже существует")
        return value
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)