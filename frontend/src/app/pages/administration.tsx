import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { ConfirmDialog } from '../components/confirm-dialog';
import { AppUser, Department} from '../types/index';
import apiClient from '../../api/client';

// Моковые данные (фоллбек, используем только если API недоступен)
const mockIncidentTypes = [
  { id: 1, name: 'Авария', color: '#EF4444', severity_level: 5 },
  { id: 2, name: 'Несчастный случай', color: '#F59E0B', severity_level: 3 }
];

const roles = [
  { value: 'Администратор', label: 'Администратор' },
  { value: 'Руководитель', label: 'Руководитель' },
  { value: 'Сотрудник', label: 'Сотрудник' }
];
import UserFormModal from './administration/UserFormModal';
import DepartmentFormModal from './administration/DepartmentFormModal';
import IncidentTypeFormModal from './administration/IncidentTypeFormModal';
import UsersTable from './administration/UsersTable';



export const AdministrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'incident-types' | 'departments' | 'settings'>('users');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  // Инициализируем пустым массивом — данные подгрузятся с API в useEffect.
  // Ранее мы использовали mock как начальное значение, из-за чего таблица
  // показывала заглушку до получения ответа от сервера.
  const [incidentTypes, setIncidentTypes] = useState<any[]>([]);
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
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
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
    (async () => {
      try {
        const res = await apiClient.post('/incidents/types/', data);
        const created = res.data;
        setIncidentTypes(prev => [...prev, created]);
        setShowIncidentTypeModal(false);
      } catch (err: any) {
        console.error('Failed to create incident type', err);
        const resp = err?.response?.data;
        let msg = err?.message || 'Ошибка при создании типа происшествия';
        if (resp && typeof resp === 'object') {
          // collect field errors or detail
          if (resp.detail) msg = String(resp.detail);
          else {
            const parts: string[] = [];
            for (const k of Object.keys(resp)) {
              const v = resp[k];
              if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
              else parts.push(`${k}: ${String(v)}`);
            }
            if (parts.length) msg = parts.join('; ');
          }
        }
        alert(msg);
      }
    })();
  };
  
  const handleEditIncidentType = (data: any) => {
    (async () => {
      try {
        if (!editingIncidentType) return;
        const res = await apiClient.patch(`/incidents/types/${editingIncidentType.id}/`, data);
        const updated = res.data;
        setIncidentTypes(prev => prev.map(t => t.id === editingIncidentType.id ? updated : t));
        setEditingIncidentType(null);
      } catch (err: any) {
        console.error('Failed to update incident type', err);
        const resp = err?.response?.data;
        let msg = err?.message || 'Ошибка при обновлении типа происшествия';
        if (resp && typeof resp === 'object') {
          if (resp.detail) msg = String(resp.detail);
          else {
            const parts: string[] = [];
            for (const k of Object.keys(resp)) {
              const v = resp[k];
              if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
              else parts.push(`${k}: ${String(v)}`);
            }
            if (parts.length) msg = parts.join('; ');
          }
        }
        alert(msg);
      }
    })();
  };
  
  const handleDeleteIncidentType = () => {
    (async () => {
      try {
        if (deletingIncidentTypeId == null) return;
        await apiClient.delete(`/incidents/types/${deletingIncidentTypeId}/`);
        setIncidentTypes(prev => prev.filter(t => t.id !== deletingIncidentTypeId));
        setDeletingIncidentTypeId(null);
      } catch (err: any) {
        console.error('Failed to delete incident type', err);
        alert('Ошибка при удалении типа происшествия: ' + (err?.response?.data?.detail || err?.message));
      }
    })();
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        setSettingsError(null);
        const payload = {
          access_token_lifetime_minutes: Number(systemSettings.accessTokenLifetime),
          refresh_token_lifetime_days: Number(systemSettings.refreshTokenLifetime)
        };
        await apiClient.put('/users/system-settings/', payload);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      } catch (err: any) {
        console.error('Failed to save system settings', err);
        const resp = err?.response?.data;
        let message = err?.message || 'Не удалось сохранить настройки';
        if (resp) {
          if (resp.detail) message = resp.detail;
          else if (typeof resp === 'object') {
            const parts = Object.entries(resp).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
            if (parts.length) message = parts.join('; ');
          }
        }
        setSettingsError(message);
      }
    })();
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
    (async () => {
      // Load incident types from backend
      try {
        const res = await apiClient.get('/incidents/types/');
        if (cancelled) return;
        setIncidentTypes(res.data || []);
      } catch (err: any) {
        console.error('Failed to load incident types', err);
        // fallback to mock data so UI remains usable in dev if API is unavailable
        setIncidentTypes(mockIncidentTypes);
      }
    })();
    (async () => {
      try {
        const res = await apiClient.get('/users/system-settings/');
        if (cancelled) return;
        const data = res.data || {};
        setSystemSettings({
          accessTokenLifetime: String(data.access_token_lifetime_minutes ?? '60'),
          refreshTokenLifetime: String(data.refresh_token_lifetime_days ?? '7')
        });
      } catch (err: any) {
        console.error('Failed to load system settings', err);
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
          <UsersTable users={users} onEdit={(u) => setEditingUser(u)} onDelete={(id) => setDeletingUserId(id)} />
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
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Уровень серьёзности</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Цвет</th>
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {incidentTypes.map((type) => (
                  <tr key={type.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 text-[#1F2937]">{type.name}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{type.severity_level ?? '-'}</td>
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
              {settingsError && (
                <p className="text-[#EF4444] text-sm mr-auto">{settingsError}</p>
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