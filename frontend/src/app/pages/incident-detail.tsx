import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Modal } from '../components/modal';
import { IncidentForm } from '../components/incident-form';
import { ConfirmDialog } from '../components/confirm-dialog';
import { getIncidentById, getStatusVariant } from '../utils/mock-data';
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
  
  const incidentData = getIncidentById(incidentId);
  
  if (!incidentData) {
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
          <p className="text-[#6B7280]">Происшествие не найдено</p>
        </Card>
      </div>
    );
  }
  
  const handleEdit = (data: any) => {
    console.log('Редактирование:', data);
    setShowEditModal(false);
  };
  
  const handleDelete = () => {
    console.log('Удаление происшествия');
    setShowDeleteDialog(false);
    onNavigate('incidents');
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
          <h1 className="text-[#1F2937] mb-2">Происшествие #{incidentData.number}</h1>
          <Badge variant={getStatusVariant(incidentData.status)}>
            {incidentData.status}
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
            <p className="text-[#1F2937] font-medium">{incidentData.number}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Тип происшествия</p>
            <p className="text-[#1F2937] font-medium">{incidentData.type}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Дата и время</p>
            <p className="text-[#1F2937] font-medium">{incidentData.date} {incidentData.time}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Статус</p>
            <Badge variant={getStatusVariant(incidentData.status)}>
              {incidentData.status}
            </Badge>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Автор</p>
            <p className="text-[#1F2937] font-medium">{incidentData.author}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Подразделение</p>
            <p className="text-[#1F2937] font-medium">{incidentData.department}</p>
          </div>
          <div>
            <p className="text-[#6B7280] mb-1">Ответственный</p>
            <p className="text-[#1F2937] font-medium">{incidentData.responsible || '—'}</p>
          </div>
        </div>
      </Card>
      
      {/* Детали */}
      <Card title="Описание происшествия">
        <p className="text-[#1F2937] leading-relaxed">{incidentData.description}</p>
      </Card>
      
      {/* Принятые меры */}
      <Card title="Принятые меры">
        <p className="text-[#1F2937] leading-relaxed">
          {incidentData.measures || 'Меры пока не приняты'}
        </p>
      </Card>
      
      {/* Модальное окно редактирования */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Редактирование происшествия #${incidentData.number}`}
        size="lg"
      >
        <IncidentForm
          initialData={incidentData}
          onSubmit={handleEdit}
          onCancel={() => setShowEditModal(false)}
          isEdit
        />
      </Modal>
      
      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Удалить происшествие?"
        message={`Вы действительно хотите удалить происшествие ${incidentData.number}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};