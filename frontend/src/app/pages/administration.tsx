import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select } from '../components/select';
import { Modal } from '../components/modal';
import { ConfirmDialog } from '../components/confirm-dialog';
import { AppUser, Department} from '../types/index';
import apiClient from '../../api/client';

// Моковые данные
const mockIncidentTypes = [
  { id: 1, name: 'Авария', color: '#EF4444' },
  { id: 2, name: 'Несчастный случай', color: '#F59E0B' }
];

const roles = [
  { value: 'Администратор', label: 'Администратор' },
  { value: 'Руководитель', label: 'Руководитель' },
  { value: 'Сотрудник', label: 'Сотрудник' }
];
const UserFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  departments: Department[];
  groups: { id: number; name: string }[];
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

  const departmentOptions = [{ value: '', label: '— Нет —' }, ...departments.map(dept => ({ value: String(dept.id), label: dept.name }))];
  const groupOptions = [{ value: '', label: '— Выберите роль —' }, ...groups.map(g => ({ value: String(g.id), label: g.name }))];

  // If parent didn't load departments/groups yet, fetch locally to ensure selects are populated
  const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
  const [localGroups, setLocalGroups] = useState<{ id: number; name: string }[]>(groups);

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
    // validate password confirmation
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

export const AdministrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'incident-types' | 'departments' | 'settings'>('users');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [incidentTypes, setIncidentTypes] = useState(mockIncidentTypes);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showIncidentTypeModal, setShowIncidentTypeModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [editingIncidentType, setEditingIncidentType] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<number | null>(null);
  const [deletingIncidentTypeId, setDeletingIncidentTypeId] = useState<number | null>(null);
  const [systemSettings, setSystemSettings] = useState({
    accessTokenLifetime: '60',
    refreshTokenLifetime: '7'
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  const handleAddUser = (data: any) => {
    (async () => {
      try {
        const payload: any = {
          username: data.email,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name
        };
        if (data.patronymic) payload.patronymic = data.patronymic;
        if (data.department_id) payload.department_id = data.department_id;
        if (data.position) payload.position = data.position;
        if (data.phone) payload.phone = data.phone;
        if (data.role_id) payload.group_ids = [data.role_id];
        if (typeof data.is_active === 'boolean') payload.is_active = !!data.is_active;

        const res = await apiClient.post('/users/register/', payload);
        const created = res.data?.user || res.data;
        // normalize created user shape (backend may return 'user' wrapper)
        if (created) setUsers(prev => [...prev, created]);
        setShowUserModal(false);
      } catch (err: any) {
        console.error('Failed to create user', err);
        alert('Ошибка при создании пользователя: ' + (err?.response?.data?.error || err?.message));
      }
    })();
  };
  
  const handleEditUser = (data: any) => {
    (async () => {
      try {
        if (!editingUser) return;
        const payload: any = {};
        // only send fields that are present to avoid triggering validation errors
        if (data.email) payload.email = data.email;
        if (data.first_name) payload.first_name = data.first_name;
        if (data.last_name) payload.last_name = data.last_name;
        if (data.patronymic) payload.patronymic = data.patronymic;
        if (data.department_id) payload.department_id = data.department_id;
        if (data.position) payload.position = data.position;
        if (data.phone) payload.phone = data.phone;
        if (data.role_id) payload.group_ids = [data.role_id];
        if (typeof data.is_active === 'boolean') payload.is_active = !!data.is_active;
        if (data.password) payload.password = data.password;

        const res = await apiClient.patch(`/users/${editingUser.id}/`, payload);
        const updated = res.data?.user || res.data;
        if (updated) setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
        setEditingUser(null);
      } catch (err: any) {
        console.error('Failed to edit user', err);
        alert('Ошибка при обновлении пользователя: ' + (err?.response?.data?.error || err?.message));
      }
    })();
  };
  
  const handleDeleteUser = () => {
    (async () => {
      try {
        if (deletingUserId == null) return;
        // Instead of removing user from list, mark inactive on backend
        const res = await apiClient.patch(`/users/${deletingUserId}/`, { is_active: false });
        const updated = res.data?.user || res.data;
        if (updated) {
          setUsers(prev => prev.map(u => u.id === deletingUserId ? updated : u));
        } else {
          // fallback: mark locally
          setUsers(prev => prev.map(u => u.id === deletingUserId ? { ...u, is_active: false } : u));
        }
        setDeletingUserId(null);
      } catch (err: any) {
        console.error('Failed to deactivate user', err);
        alert('Ошибка при деактивации пользователя: ' + (err?.response?.data?.error || err?.message));
      }
    })();
  };

  const handleAddDepartment = (data: any) => {
    (async () => {
      try {
        const res = await apiClient.post('/users/departments/create/', data);
        const created = res.data;
        setDepartments(prev => [...prev, created]);
        setShowDepartmentModal(false);
      } catch (err: any) {
        console.error('Failed to create department', err);
        alert('Ошибка при создании подразделения: ' + (err?.response?.data?.error || err?.message));
      }
    })();
  };
  
  const handleEditDepartment = (data: any) => {
    console.log('Редактирование подразделения:', data);
    setDepartments(departments.map(d => d.id === editingDepartment.id ? { ...d, ...data } : d));
    setEditingDepartment(null);
  };
  
  const handleDeleteDepartment = () => {
    (async () => {
      try {
        if (deletingDepartmentId == null) return;
        await apiClient.delete(`/users/departments/${deletingDepartmentId}/`);
        setDepartments(prev => prev.filter(d => d.id !== deletingDepartmentId));
        setDeletingDepartmentId(null);
      } catch (err: any) {
        console.error('Failed to delete department', err);
        alert('Ошибка при удалении подразделения: ' + (err?.response?.data?.error || err?.message));
      }
    })();
  };

  const handleAddIncidentType = (data: any) => {
    console.log('Добавление типа происшествия:', data);
    setIncidentTypes([...incidentTypes, { id: incidentTypes.length + 1, ...data }]);
    setShowIncidentTypeModal(false);
  };
  
  const handleEditIncidentType = (data: any) => {
    console.log('Редактирование типа происшествия:', data);
    setIncidentTypes(incidentTypes.map(t => t.id === editingIncidentType.id ? { ...t, ...data } : t));
    setEditingIncidentType(null);
  };
  
  const handleDeleteIncidentType = () => {
    console.log('Удаление типа происшествия:', deletingIncidentTypeId);
    setIncidentTypes(incidentTypes.filter(t => t.id !== deletingIncidentTypeId));
    setDeletingIncidentTypeId(null);
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Сохранение настроек:', systemSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  useEffect(() => {
    // Load departments from backend
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/users/departments/');
        if (cancelled) return;
        setDepartments(res.data || []);
      } catch (err: any) {
        console.error('Failed to load departments', err);
        // keep existing mock data if desired or empty
      }
    })();
    (async () => {
      // Load users for manager select
      try {
        const res = await apiClient.get('/users/');
        if (cancelled) return;
        const usersData = res.data || [];
        setUsers(usersData);
      } catch (err: any) {
        console.error('Failed to load users', err);
      }
    })();
    (async () => {
      // Load all groups (roles) for role dropdown
      try {
        const res = await apiClient.get('/users/all-groups/');
        if (cancelled) return;
        setGroups(res.data || []);
      } catch (err: any) {
        console.error('Failed to load groups', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  
  return (
    <div className="space-y-6">
      <h1 className="text-[#1F2937]">Администрирование</h1>
      
      {/* Вкладки */}
      <div className="flex gap-2 border-b border-[#E5E7EB] overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#CF1217] text-[#CF1217]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Пользователи
        </button>
        <button
          onClick={() => setActiveTab('incident-types')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'incident-types'
              ? 'border-[#CF1217] text-[#CF1217]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Типы происшествий
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'departments'
              ? 'border-[#CF1217] text-[#CF1217]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Подразделения
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-[#CF1217] text-[#CF1217]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Настройки системы
        </button>
      </div>
      
      {/* Управление пользователями */}
      {activeTab === 'users' && (
        <Card 
          title="Список пользователей"
          actions={
            <Button 
              onClick={() => setShowUserModal(true)}
              icon={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Добавить пользователя
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">ФИО</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Роль</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Подразделение</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 text-[#1F2937]">{user.email}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{user.full_name || user.fullName || user.email}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{user.role || (user.groups && user.groups[0]?.name) || '-'}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{user.department_name || user.department || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-[#6B7280] hover:text-[#CF1217] hover:bg-[#FEE2E2] rounded transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUserId(user.id)}
                          disabled={user.id === 1}
                          className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.id === 1 ? 'Нельзя удалить администратора' : 'Удалить'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Управление типами происшествий */}
      {activeTab === 'incident-types' && (
        <Card 
          title="Типы происшествий"
          actions={
            <Button 
              onClick={() => setShowIncidentTypeModal(true)}
              icon={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Добавить тип
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Название</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Цвет</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {incidentTypes.map((type) => (
                  <tr key={type.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 text-[#1F2937]">{type.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-[#E5E7EB]"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-[#6B7280] text-sm">{type.color}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingIncidentType(type)}
                          className="p-1.5 text-[#6B7280] hover:text-[#CF1217] hover:bg-[#FEE2E2] rounded transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingIncidentTypeId(type.id)}
                          className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Управление подразделениями */}
      {activeTab === 'departments' && (
        <Card 
          title="Подразделения"
          actions={
            <Button 
              onClick={() => setShowDepartmentModal(true)}
              icon={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Добавить подразделение
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Название</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Родитель</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Руководитель</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => {
                  const parentName = departments.find(d => d.id === department.parent_department)?.name || '-';
                  const managerUser = users.find(u => u.id === department.manager);
                  const managerDisplay = department.manager_name || (managerUser ? (managerUser.full_name || managerUser.fullName || managerUser.email) : '-');
                  return (
                    <tr key={department.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4 text-[#1F2937]">{department.name}</td>
                      <td className="py-3 px-4 text-[#1F2937]">{parentName}</td>
                      <td className="py-3 px-4 text-[#1F2937]">{managerDisplay}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingDepartment(department)}
                            className="p-1.5 text-[#6B7280] hover:text-[#CF1217] hover:bg-[#FEE2E2] rounded transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingDepartmentId(department.id)}
                            className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {/* Настройки системы */}
      {activeTab === 'settings' && (
        <Card title="Настройки безопасности">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="max-w-xl space-y-4">
              <Input
                label="Время жизни Access Token (минут)"
                type="number"
                value={systemSettings.accessTokenLifetime}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, accessTokenLifetime: e.target.value }))}
                required
              />
              <Input
                label="Время жизни Refresh Token (дней)"
                type="number"
                value={systemSettings.refreshTokenLifetime}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, refreshTokenLifetime: e.target.value }))}
                required
              />
              
              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-4">
                  <strong>Примечание:</strong> Изменение этих параметров влияет на безопасность системы. 
                  Убедитесь, что вы понимаете последствия перед изменением.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
              {settingsSaved && (
                <p className="text-[#10B981]">✓ Настройки сохранены</p>
              )}
              <div className={settingsSaved ? '' : 'ml-auto'}>
                <Button type="submit" icon={<Save className="w-4 h-4" />}>
                  Сохранить настройки
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}
      
      {/* Модальное окно добавления */}
      <UserFormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleAddUser}
        departments={departments}
        groups={groups}
      />
      
      {/* Модальное окно редактирования */}
      {editingUser && (
        <UserFormModal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUser}
          initialData={editingUser}
          departments={departments}
          groups={groups}
          isEdit
        />
      )}

      {/* Модальное окно добавления подразделения */}
      <DepartmentFormModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSubmit={handleAddDepartment}
        departments={departments}
        users={users}
      />
      
      {/* Модальное окно редактирования подразделения */}
      {editingDepartment && (
        <DepartmentFormModal
          isOpen={true}
          onClose={() => setEditingDepartment(null)}
          onSubmit={handleEditDepartment}
          initialData={editingDepartment}
          isEdit
          departments={departments}
          users={users}
        />
      )}

      {/* Модальное окно добавления типа происшествия */}
      <IncidentTypeFormModal
        isOpen={showIncidentTypeModal}
        onClose={() => setShowIncidentTypeModal(false)}
        onSubmit={handleAddIncidentType}
      />
      
      {/* Модальное окно редактирования типа происшествия */}
      {editingIncidentType && (
        <IncidentTypeFormModal
          isOpen={true}
          onClose={() => setEditingIncidentType(null)}
          onSubmit={handleEditIncidentType}
          initialData={editingIncidentType}
          isEdit
        />
      )}
      
      {/* Диалог удаления */}
      <ConfirmDialog
        isOpen={deletingUserId !== null}
        onClose={() => setDeletingUserId(null)}
        onConfirm={handleDeleteUser}
        title="Удалить пользователя?"
        message="Вы действительно хотите удалить этого пользователя? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />

      {/* Диалог удаления подразделения */}
      <ConfirmDialog
        isOpen={deletingDepartmentId !== null}
        onClose={() => setDeletingDepartmentId(null)}
        onConfirm={handleDeleteDepartment}
        title="Удалить подразделение?"
        message="Вы действительно хотите удалить это подразделение? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />

      {/* Диалог удаления типа происшествия */}
      <ConfirmDialog
        isOpen={deletingIncidentTypeId !== null}
        onClose={() => setDeletingIncidentTypeId(null)}
        onConfirm={handleDeleteIncidentType}
        title="Удалить тип происшествия?"
        message="Вы действительно хотите удалить этот тип происшествия? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};