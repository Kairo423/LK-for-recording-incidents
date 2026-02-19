import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Modal } from '../components/modal';
import { IncidentForm } from '../components/incident-form';
import { ConfirmDialog } from '../components/confirm-dialog';
import { getStatusVariant } from '../utils/mock-data';
import apiClient from '../../api/client';
import { PageType, UserRole } from '../types/index.ts';

interface IncidentDetailProps {
  incidentId: number;
  onNavigate: (page: PageType) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailProps> = ({ 
  incidentId, 
  onNavigate 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incident, setIncident] = useState<any | null>(null);
  const [typesOptions, setTypesOptions] = useState<{ value: string; label: string }[]>([]);
  const [statusesOptions, setStatusesOptions] = useState<{ value: string; label: string }[]>([]);
  const [departmentsOptions, setDepartmentsOptions] = useState<{ value: string; label: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load incident and options
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [incRes, typesRes, statusesRes, deptsRes] = await Promise.all([
          apiClient.get(`/incidents/${incidentId}/`),
          apiClient.get('/incidents/types/'),
          apiClient.get('/incidents/statuses/'),
          apiClient.get('/users/departments/')
        ]);

        if (cancelled) return;

        setIncident(incRes.data || null);

        const types = Array.isArray(typesRes.data) ? typesRes.data : (typesRes.data.results || []);
        const statuses = Array.isArray(statusesRes.data) ? statusesRes.data : (statusesRes.data.results || []);
        const depts = Array.isArray(deptsRes.data) ? deptsRes.data : (deptsRes.data.results || []);

        setTypesOptions(types.filter((t:any)=>t.is_active!==false).map((t:any)=>({ value: String(t.id), label: t.name })));
        setStatusesOptions(statuses.map((s:any)=>({ value: String(s.id), label: s.name })));
        setDepartmentsOptions(depts.map((d:any)=>({ value: String(d.id), label: d.name })));
      } catch (e: any) {
        console.error('Failed to load incident detail', e);
        setError(e?.response?.data?.detail || e.message || 'Ошибка при загрузке');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [incidentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => onNavigate('incidents')}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к списку
        </button>
        <Card>
          <p className="text-[#6B7280]">Загрузка...</p>
        </Card>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => onNavigate('incidents')}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к списку
        </button>
        <Card>
          <p className="text-[#6B7280]">{error || 'Происшествие не найдено'}</p>
        </Card>
      </div>
    );
  }
  
  const handleEdit = async (data: any) => {
    setIsSaving(true);
    try {
      const res = await apiClient.patch(`/incidents/${incidentId}/`, data);
      setIncident(res.data);
      setShowEditModal(false);
    } catch (e: any) {
      console.error('Failed to update incident', e, e?.response?.data);
      // rethrow so form shows validation errors
      throw (e?.response?.data || e);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/incidents/${incidentId}/`);
      setShowDeleteDialog(false);
      onNavigate('incidents');
    } catch (e: any) {
      console.error('Failed to delete incident', e, e?.response?.data);
      alert('Ошибка при удалении: ' + (e?.response?.data?.detail || e.message || 'unknown'));
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Навигация назад */}
      <button
        onClick={() => onNavigate('incidents')}
        className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Назад к списку
      </button>
      
      {/* Заголовок и действия */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[#1F2937] mb-2">Происшествие #{incident.incident_number}</h1>
          <Badge variant={getStatusVariant(incident.status?.name || '')}>
            {incident.status?.name}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => setShowEditModal(true)}
          >
            Редактировать
          </Button>
          <Button 
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Удалить
          </Button>
        </div>
      </div>
      
      {/* Основная информация */}
      <Card title="Основная информация">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[#6B7280] mb-1">Номер</p>
            <p className="text-[#1F2937] font-medium">{incident.incident_number}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Тип происшествия</p>
              <p className="text-[#1F2937] font-medium">{incident.incident_type?.name}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Дата и время</p>
              <p className="text-[#1F2937] font-medium">{incident.incident_date}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Статус</p>
              <Badge variant={getStatusVariant(incident.status?.name || '')}>
                {incident.status?.name}
              </Badge>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Автор</p>
              <p className="text-[#1F2937] font-medium">{incident.author?.profile?.full_name || incident.author?.username}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Подразделение</p>
              <p className="text-[#1F2937] font-medium">{incident.department?.name}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Ответственный</p>
              <p className="text-[#1F2937] font-medium">{incident.responsible_person || '—'}</p>
          </div>
        </div>
      </Card>
      
      {/* Детали */}
      <Card title="Описание происшествия">
        <p className="text-[#1F2937] leading-relaxed">{incident.description}</p>
      </Card>
      
      {/* Принятые меры */}
      <Card title="Принятые меры">
        <p className="text-[#1F2937] leading-relaxed">
          {incident.measures_taken || 'Меры пока не приняты'}
        </p>
      </Card>
      
      {/* Модальное окно редактирования */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Редактирование происшествия #${incident.incident_number}`}
        size="lg"
      >
        <IncidentForm
          initialData={{
            number: incident.incident_number,
            type: incident.incident_type?.id ? String(incident.incident_type.id) : '',
            department: incident.department?.id ? String(incident.department.id) : '',
            date: incident.incident_date,
            description: incident.description,
            status: incident.status?.id ? String(incident.status.id) : '',
            responsible: incident.responsible_person,
            measures: incident.measures_taken
          }}
          onSubmit={handleEdit}
          onCancel={() => setShowEditModal(false)}
          isEdit
          typeOptions={typesOptions}
          statusOptions={statusesOptions}
          departmentOptions={departmentsOptions}
        />
      </Modal>
      
      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Удалить происшествие?"
  message={`Вы действительно хотите удалить происшествие ${incident.incident_number}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};