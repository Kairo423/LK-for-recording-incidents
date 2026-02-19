import React, { useState } from 'react';
import { Input } from '../../components/input';
import { Modal } from '../../components/modal';
import { Button } from '../../components/button';

const IncidentTypeFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}> = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    color: initialData?.color || '#3B82F6',
    severity_level: initialData?.severity_level || 1
  });
  const [errors, setErrors] = useState<{ name?: string; color?: string; severity_level?: string }>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation to avoid sending invalid payloads
    const nextErrors: typeof errors = {};
    if (!formData.name || !String(formData.name).trim()) {
      nextErrors.name = 'Укажите название типа происшествия';
    }
    // color must match #RRGGBB
    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      nextErrors.color = 'Цвет должен быть в формате #RRGGBB';
    }
    const sev = Number(formData.severity_level || 0);
    if (!Number.isInteger(sev) || sev < 1 || sev > 5) {
      nextErrors.severity_level = 'Уровень серьёзности должен быть целым числом от 1 до 5';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({ ...formData, severity_level: sev });
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактирование типа происшествия' : 'Добавление типа происшествия'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Название типа"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          error={errors.name}
        />
        <div>
          <label className="block text-sm font-medium text-[#1F2937] mb-2">
            Цвет отображения
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="h-10 w-20 rounded border border-[#E5E7EB] cursor-pointer"
            />
            <Input
              name="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="#3B82F6"
              className="flex-1"
              error={errors.color}
            />
          </div>
          <p className="text-sm text-[#6B7280] mt-2">
            Этот цвет будет использоваться в разделе аналитики
          </p>
          {errors.color && <p className="mt-1 text-sm text-[#EF4444]">{errors.color}</p>}
        </div>
        <div>
          <Input
            label="Уровень серьёзности (1–5)"
            type="number"
            min={1}
            max={5}
            name="severity_level"
            value={String(formData.severity_level)}
            onChange={(e) => {
              const v = Number(e.target.value || 1);
              setFormData(prev => ({ ...prev, severity_level: Math.min(5, Math.max(1, v)) }));
            }}
            required
            error={errors.severity_level}
          />
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E7EB]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IncidentTypeFormModal;
