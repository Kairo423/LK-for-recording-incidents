import React, { useState } from 'react';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Modal } from '../../components/modal';
import { Button } from '../../components/button';
import { Department, AppUser } from '../../types/index';

const DepartmentFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  departments: Department[];
  users: AppUser[];
}> = ({ isOpen, onClose, onSubmit, initialData, isEdit = false, departments, users }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    parent_department: initialData?.parent_department || null,
    manager: initialData?.manager || null,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактирование подразделения' : 'Добавление подразделения'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Название подразделения"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <div>
          <Select
            label="Родительское подразделение"
            options={[{ value: '', label: '— Нет —' }, ...departments.map(d => ({ value: String(d.id), label: d.name }))]}
            value={formData.parent_department ? String(formData.parent_department) : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, parent_department: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>
        <div>
          <Select
            label="Руководитель"
            options={[{ value: '', label: '— Нет —' }, ...users.map(u => ({ value: String(u.id), label: u.full_name || (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email) }))]}
            value={formData.manager ? String(formData.manager) : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value ? Number(e.target.value) : null }))}
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

export default DepartmentFormModal;
