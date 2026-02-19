import React, { useState, useEffect } from 'react';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Modal } from '../../components/modal';
import { Button } from '../../components/button';
import { Department } from '../../types/index';
import apiClient from '../../../api/client';

type Group = { id: number; name: string };

const UserFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  departments: Department[];
  groups: Group[];
}> = ({ isOpen, onClose, onSubmit, initialData, isEdit = false, departments, groups }) => {
  const [formData, setFormData] = useState(() => ({
    email: initialData?.email || '',
    first_name: initialData?.first_name || (initialData?.full_name ? initialData.full_name.split(' ')[1] : '') || '',
    last_name: initialData?.last_name || (initialData?.full_name ? initialData.full_name.split(' ')[0] : '') || '',
    patronymic: initialData?.profile?.patronymic || initialData?.patronymic || '',
    role_id: initialData?.groups?.[0]?.id || null,
    department_id: (initialData?.profile && typeof initialData.profile.department === 'number') ? initialData.profile.department : (initialData?.profile?.department?.id || initialData?.department_id || null),
    password: '',
    confirmPassword: '',
    position: initialData?.profile?.position || '',
    phone: initialData?.profile?.phone || '',
    is_active: typeof initialData?.is_active === 'boolean' ? initialData.is_active : true
  }));

  const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);

  useEffect(() => {
    let cancelled = false;
    if ((!localDepartments || localDepartments.length === 0) && departments.length === 0) {
      (async () => {
        try {
          const res = await apiClient.get('/users/departments/');
          if (cancelled) return;
          setLocalDepartments(res.data || []);
        } catch (e) {
          // ignore
        }
      })();
    } else if (departments.length > 0) {
      setLocalDepartments(departments);
    }

    if ((!localGroups || localGroups.length === 0) && groups.length === 0) {
      (async () => {
        try {
          const res = await apiClient.get('/users/all-groups/');
          if (cancelled) return;
          setLocalGroups(res.data || []);
        } catch (e) {
          // ignore
        }
      })();
    } else if (groups.length > 0) {
      setLocalGroups(groups);
    }

    return () => { cancelled = true; };
  }, [departments, groups]);

  const effectiveDepartmentOptions = [{ value: '', label: '— Нет —' }, ...localDepartments.map(dept => ({ value: String(dept.id), label: dept.name }))];
  const effectiveGroupOptions = [{ value: '', label: '— Выберите роль —' }, ...localGroups.map(g => ({ value: String(g.id), label: g.name }))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактирование пользователя' : 'Добавление пользователя'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Фамилия"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            required
          />
          <Input
            label="Имя"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            required
          />
          <Input
            label="Отчество"
            value={formData.patronymic}
            onChange={(e) => setFormData(prev => ({ ...prev, patronymic: e.target.value }))}
          />
        </div>

        <Select
          label="Роль"
          options={effectiveGroupOptions}
          value={formData.role_id ? String(formData.role_id) : ''}
          onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value ? Number(e.target.value) : null }))}
          required
        />

        <Select
          label="Подразделение"
          options={effectiveDepartmentOptions}
          value={formData.department_id ? String(formData.department_id) : ''}
          onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value ? Number(e.target.value) : null }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Пароль"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            {...(!isEdit ? { required: true } : {})}
          />
          <Input
            label="Подтверждение пароля"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            {...(!isEdit ? { required: true } : {})}
          />
        </div>

        <Input
          label="Должность"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
        />

        <Input
          label="Номер телефона"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />

        <div className="flex items-center gap-2">
          <input
            id="is_active_checkbox"
            type="checkbox"
            checked={!!formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4"
          />
          <label htmlFor="is_active_checkbox" className="text-sm">Активный</label>
        </div>

        <div className="flex gap-3justify-end pt-4 border-t border-[#E5E7EB]">
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

export default UserFormModal;
