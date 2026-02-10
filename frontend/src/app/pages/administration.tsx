import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select } from '../components/select';
import { Modal } from '../components/modal';
import { ConfirmDialog } from '../components/confirm-dialog';

// Моковые данные пользователей
const mockUsers = [
  { id: 1, email: 'admin@company.com', fullName: 'Админов Админ Админович', role: 'Администратор', department: 'ИТ' },
  { id: 2, email: 'manager@company.com', fullName: 'Менеджеров Менеджер Менеджерович', role: 'Руководитель', department: 'Производство' },
  { id: 3, email: 'user@company.com', fullName: 'Иванов Иван Иванович', role: 'Сотрудник', department: 'Производство' },
  { id: 4, email: 'user2@company.com', fullName: 'Петров Петр Петрович', role: 'Сотрудник', department: 'Склад' },
  { id: 5, email: 'user3@company.com', fullName: 'Сидоров Сидор Сидорович', role: 'Сотрудник', department: 'Логистика' }
];

// Моковые данные подразделений
const mockDepartments = [
  { id: 1, name: 'ИТ' },
  { id: 2, name: 'Производство' },
  { id: 3, name: 'Склад' },
  { id: 4, name: 'Логистика' },
  { id: 5, name: 'Цех №1' },
  { id: 6, name: 'Энергетика' }
];

// Моковые данные типов происшествий
const mockIncidentTypes = [
  { id: 1, name: 'Авария', color: '#EF4444' },
  { id: 2, name: 'Несчастный случай', color: '#F59E0B' },
  { id: 3, name: 'Технический инцидент', color: '#3B82F6' },
  { id: 4, name: 'Пожар', color: '#DC2626' },
  { id: 5, name: 'ДТП', color: '#8B5CF6' }
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
  departments: Array<{ id: number; name: string }>;
}> = ({ isOpen, onClose, onSubmit, initialData, isEdit = false, departments }) => {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    fullName: initialData?.fullName || '',
    role: initialData?.role || 'Сотрудник',
    department: initialData?.department || ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const departmentOptions = departments.map(dept => ({
    value: dept.name,
    label: dept.name
  }));
  
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
        <Input
          label="ФИО"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          required
        />
        <Select
          label="Роль"
          options={roles}
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          required
        />
        <Select
          label="Подразделение"
          options={departmentOptions}
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          required
        />
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
}> = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || ''
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
  const [users, setUsers] = useState(mockUsers);
  const [departments, setDepartments] = useState(mockDepartments);
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
    console.log('Добавление пользователя:', data);
    setUsers([...users, { id: users.length + 1, ...data }]);
    setShowUserModal(false);
  };
  
  const handleEditUser = (data: any) => {
    console.log('Редактирование пользователя:', data);
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
    setEditingUser(null);
  };
  
  const handleDeleteUser = () => {
    console.log('Удаление пользователя:', deletingUserId);
    setUsers(users.filter(u => u.id !== deletingUserId));
    setDeletingUserId(null);
  };

  const handleAddDepartment = (data: any) => {
    console.log('Добавление подразделения:', data);
    setDepartments([...departments, { id: departments.length + 1, ...data }]);
    setShowDepartmentModal(false);
  };
  
  const handleEditDepartment = (data: any) => {
    console.log('Редактирование подразделения:', data);
    setDepartments(departments.map(d => d.id === editingDepartment.id ? { ...d, ...data } : d));
    setEditingDepartment(null);
  };
  
  const handleDeleteDepartment = () => {
    console.log('Удаление подразделения:', deletingDepartmentId);
    setDepartments(departments.filter(d => d.id !== deletingDepartmentId));
    setDeletingDepartmentId(null);
  };

  const handleAddIncidentType = (data: any) => {
    console.log('Добавление типа происшествия:', data);
    setIncidentTypes([...incidentTypes, { id: incidentTypes.length + 1, ...data }]);
    setShowIncidentTypeModal(false);
  };
  
  const handleEditIncidentType = (data: any) => {
    console.log('Редактирова��ие типа происшествия:', data);
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
                    <td className="py-3 px-4 text-[#1F2937]">{user.fullName}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{user.role}</td>
                    <td className="py-3 px-4 text-[#1F2937]">{user.department}</td>
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
                  <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 text-[#1F2937]">{department.name}</td>
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
                ))}
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
      />
      
      {/* Модальное окно редактирования */}
      {editingUser && (
        <UserFormModal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEditUser}
          initialData={editingUser}
          departments={departments}
          isEdit
        />
      )}

      {/* Модальное окно добавления подразделения */}
      <DepartmentFormModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSubmit={handleAddDepartment}
      />
      
      {/* Модальное окно редактирования подразделения */}
      {editingDepartment && (
        <DepartmentFormModal
          isOpen={true}
          onClose={() => setEditingDepartment(null)}
          onSubmit={handleEditDepartment}
          initialData={editingDepartment}
          isEdit
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