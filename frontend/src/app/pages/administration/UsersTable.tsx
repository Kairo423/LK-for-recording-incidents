import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { AppUser } from '../../types/index';

const UsersTable: React.FC<{
  users: AppUser[];
  onEdit: (user: AppUser) => void;
  onDelete: (id: number) => void;
}> = ({ users, onEdit, onDelete }) => {
  return (
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
                    onClick={() => onEdit(user)}
                    className="p-1.5 text-[#6B7280] hover:text-[#CF1217] hover:bg-[#FEE2E2] rounded transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
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
  );
};

export default UsersTable;
