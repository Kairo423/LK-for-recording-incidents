import React, { useState } from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { PageType, UserRole } from '../types/index.ts';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  userRole: 'employee' | 'manager' | 'admin';
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onNavigate,
  userRole,
  userName
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const canSeeAnalytics = userRole === 'manager' || userRole === 'admin';
  const canSeeAdmin = userRole === 'admin';
  
  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип и название */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#CF1217] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">IMS</span>
            </div>
            <span className="text-xl font-semibold text-[#1F2937]">Incident Management System</span>
          </div>
          
          {/* Навигация */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-[#CF1217] text-white'
                  : 'text-[#6B7280] hover:bg-[#E5E4E2]'
              }`}
            >
              Главная
            </button>
            <button
              onClick={() => onNavigate('incidents')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'incidents' || currentPage === 'incident-detail'
                  ? 'bg-[#CF1217] text-white'
                  : 'text-[#6B7280] hover:bg-[#E5E4E2]'
              }`}
            >
              Происшествия
            </button>
            {canSeeAnalytics && (
              <button
                onClick={() => onNavigate('analytics')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'analytics'
                    ? 'bg-[#CF1217] text-white'
                    : 'text-[#6B7280] hover:bg-[#E5E4E2]'
                }`}
              >
                Аналитика
              </button>
            )}
            {canSeeAdmin && (
              <button
                onClick={() => onNavigate('administration')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'administration'
                    ? 'bg-[#CF1217] text-white'
                    : 'text-[#6B7280] hover:bg-[#E5E4E2]'
                }`}
              >
                Администрирование
              </button>
            )}
          </nav>
          
          {/* Пользователь */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#E5E4E2] transition-colors"
            >
              <div className="w-9 h-9 bg-[#CF1217] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span className="text-[#1F2937] hidden sm:inline">{userName}</span>
            </button>
            
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-20">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-[#1F2937] hover:bg-[#F9FAFB] flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Профиль
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-[#EF4444] hover:bg-[#FEE2E2] flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};