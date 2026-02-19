import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Input } from './input';
import { Select } from './select';
import { Textarea } from './textarea';
import { Button } from './button';

interface IncidentFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<any> | void;
  onCancel: () => void;
  isEdit?: boolean;
  typeOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  departmentOptions?: { value: string; label: string }[];
}

const defaultIncidentTypes = [
  { value: '', label: 'Выберите тип' },
  { value: '', label: 'Авария' },
];

const defaultStatuses = [
  { value: '', label: 'Новое' },
  { value: '', label: 'В работе' },
  { value: '', label: 'Завершено' }
];

export const IncidentForm: React.FC<IncidentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  typeOptions = [],
  statusOptions = [],
  departmentOptions = []
}) => {
  const [authorName, setAuthorName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Load current user profile (to get department and username)
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/users/profile/');
        if (cancelled) return;
        const data = res.data || {};
        const user = data.user || {};
        const name = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '';
        setAuthorName(name);

        // role is stored in localStorage user object
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const obj = JSON.parse(stored);
            setIsAdmin((obj.role || '').toString().toLowerCase() === 'admin');
          }
        } catch (e) {
          // ignore
        }
        // set default department for non-admin users if available
        try {
          const dept = user.profile && (user.profile.department || user.profile.department_id) || data.department || data.department_id;
          const deptId = dept ? String(typeof dept === 'object' ? (dept.id || dept) : dept) : '';
          if (deptId && !initialData?.department) {
            setFormData(prev => ({ ...prev, department: deptId }));
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [formData, setFormData] = useState({
    number: initialData?.number || `INC-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    // store ids (string) for selects when options are passed
    type: initialData?.type || '',
    department: initialData?.department || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    description: initialData?.description || '',
    status: initialData?.status || '',
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
    if (!formData.department) newErrors.department = 'Укажите подразделение';
    if (!formData.date) newErrors.date = 'Укажите дату';
    if (!formData.description) newErrors.description = 'Введите описание';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // helper to resolve numeric id from select value or label
    const resolveId = (val: string, opts: { value: string; label: string }[]) => {
      if (!val) return null;
      if (/^\d+$/.test(String(val))) return Number(val);
      const byValue = opts.find(o => String(o.value) === String(val));
      if (byValue) return Number(byValue.value);
      const byLabel = opts.find(o => (o.label || '').toString() === String(val));
      if (byLabel) return Number(byLabel.value);
      return null;
    };

    const payload: any = {
      incident_number: formData.number,
      incident_type: resolveId(formData.type, typeOptions.length ? typeOptions : defaultIncidentTypes),
      department: resolveId(formData.department, departmentOptions.length ? departmentOptions : [{ value: '', label: '' }]),
      status: resolveId(formData.status, statusOptions.length ? statusOptions : defaultStatuses),
      description: formData.description,
      measures_taken: formData.measures || undefined,
      responsible_person: formData.responsible || undefined,
      incident_date: formData.date
    };

    try {
      const res = await onSubmit(payload);
      // If onSubmit returns errors, it's expected to reject with an object
      // Otherwise, close handled by parent
    } catch (err: any) {
      // err could be validation errors from server in form { field: [..] }
      if (err && typeof err === 'object') {
        const mapped: Record<string, string> = {};
        Object.keys(err).forEach(k => {
          const val = err[k];
          if (Array.isArray(val)) mapped[k] = String(val.join(' '));
          else mapped[k] = String(val);
        });
        setErrors(mapped);
      } else {
        alert(err?.message || 'Ошибка при создании');
      }
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
            options={typeOptions && typeOptions.length ? [{ value: '', label: '— Выберите тип —' }, ...typeOptions] : defaultIncidentTypes}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            error={errors.type}
            required
          />

          <Select
            label="Подразделение"
            options={departmentOptions && departmentOptions.length ? [{ value: '', label: '— Выберите подразделение —' }, ...departmentOptions] : [{ value: '', label: '— Нет —' }]}
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            error={errors.department}
            required
            disabled={!isAdmin}
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
            value={authorName || ''}
            disabled
            className="bg-[#F3F4F6]"
          />
          
          <Input
            label="Подразделение"
            value={
              (departmentOptions && departmentOptions.find(o => String(o.value) === String(formData.department))?.label) || ''
            }
            disabled
            className="bg-[#F3F4F6]"
          />
          
          <Select
            label="Статус"
            options={statusOptions && statusOptions.length ? statusOptions : defaultStatuses}
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
