import React, { useState } from 'react';
import { Input } from './input';
import { Select } from './select';
import { Textarea } from './textarea';
import { Button } from './button';

interface IncidentFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const incidentTypes = [
  { value: '', label: 'Выберите тип' },
  { value: 'Авария', label: 'Авария' },
  { value: 'Несчастный случай', label: 'Несчастный случай' },
  { value: 'Технический инцидент', label: 'Технический инцидент' },
  { value: 'Пожар', label: 'Пожар' },
  { value: 'ДТП', label: 'ДТП' }
];

const statuses = [
  { value: 'Новое', label: 'Новое' },
  { value: 'В работе', label: 'В работе' },
  { value: 'Завершено', label: 'Завершено' }
];

export const IncidentForm: React.FC<IncidentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    number: initialData?.number || `INC-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    type: initialData?.type || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    description: initialData?.description || '',
    status: initialData?.status || 'Новое',
    responsible: initialData?.responsible || '',
    measures: initialData?.measures || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) newErrors.type = 'Выберите тип происшествия';
    if (!formData.date) newErrors.date = 'Укажите дату';
    if (!formData.description) newErrors.description = 'Введите описание';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Левая колонка - Обязательные поля */}
        <div className="space-y-4">
          <h3 className="text-[#1F2937] pb-2 border-b border-[#E5E7EB]">Обязательные поля</h3>
          
          <Input
            label="Номер"
            value={formData.number}
            onChange={(e) => handleChange('number', e.target.value)}
            disabled
            className="bg-[#F3F4F6]"
          />
          
          <Select
            label="Тип происшествия"
            options={incidentTypes}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            error={errors.type}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Дата"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              error={errors.date}
              required
            />
            <Input
              label="Время"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
            />
          </div>
          
          <Textarea
            label="Описание"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Подробное описание произошедшего..."
            error={errors.description}
            required
          />
        </div>
        
        {/* Правая колонка - Автоматические/Дополнительные поля */}
        <div className="space-y-4">
          <h3 className="text-[#1F2937] pb-2 border-b border-[#E5E7EB]">Дополнительные поля</h3>
          
          <Input
            label="Автор"
            value="Иванов И.И."
            disabled
            className="bg-[#F3F4F6]"
          />
          
          <Input
            label="Подразделение"
            value="Производство"
            disabled
            className="bg-[#F3F4F6]"
          />
          
          <Select
            label="Статус"
            options={statuses}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          />
          
          <Input
            label="Ответственный"
            value={formData.responsible}
            onChange={(e) => handleChange('responsible', e.target.value)}
            placeholder="Фамилия И.О."
          />
          
          <Textarea
            label="Принятые меры"
            value={formData.measures}
            onChange={(e) => handleChange('measures', e.target.value)}
            placeholder="Описание принятых мер..."
          />
        </div>
      </div>
      
      {/* Кнопки действий */}
      <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-[#E5E7EB]">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          {isEdit ? 'Сохранить изменения' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
