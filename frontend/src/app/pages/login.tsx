import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/input';
import { Button } from '../components/button';

interface LoginProps {
  onLogin: (email: string, password: string, role: 'employee' | 'manager' | 'admin') => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setLoading(true);
    
    // Имитация проверки
    setTimeout(() => {
      // Простая логика для демонстрации разных ролей
      let role: 'employee' | 'manager' | 'admin' = 'employee';
      if (email.includes('admin')) {
        role = 'admin';
      } else if (email.includes('manager')) {
        role = 'manager';
      }
      
      onLogin(email, password, role);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#CF1217] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">IMS</span>
          </div>
          <h1 className="text-[#1F2937] mb-2">Вход в систему</h1>
          <p className="text-[#6B7280]">Incident Management System</p>
        </div>
        
        {/* Форма */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Логин (Email)"
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div>
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-[#1F2937] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg">
                <p className="text-[#EF4444] text-sm">{error}</p>
              </div>
            )}
            
            <Button type="submit" className="w-full" loading={loading}>
              Войти
            </Button>
          </form>
          
          {/* Подсказка для демонстрации */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280] mb-2">Для демонстрации используйте:</p>
            <div className="space-y-1 text-sm">
              <p className="text-[#6B7280]">• <strong>admin@company.com</strong> — Администратор</p>
              <p className="text-[#6B7280]">• <strong>manager@company.com</strong> — Руководитель</p>
              <p className="text-[#6B7280]">• <strong>user@company.com</strong> — Сотрудник</p>
              <p className="text-[#9CA3AF] text-xs mt-2">Пароль: любой</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
