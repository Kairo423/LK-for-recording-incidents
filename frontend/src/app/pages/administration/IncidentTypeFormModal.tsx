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
    color: initialData?.color || '#3B82F6'
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
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
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
          <p className="text-sm text-[#6B7280] mt-2">
            Этот цвет будет использоваться в разделе аналитики
          </p>
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
