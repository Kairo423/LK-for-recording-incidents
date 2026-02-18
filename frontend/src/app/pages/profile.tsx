import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Card } from '../components/card';
import { Input } from '../components/input';
import { Button } from '../components/button';
import apiClient from '../../api/client';

interface ProfileProps {
  userName: string;
}

export const ProfilePage: React.FC<ProfileProps> = ({ userName }) => {
  const [formData, setFormData] = useState({
    fullName: userName,
    position: 'Инженер',
    department: 'Производство',
    phone: '+7 (999) 123-45-67',
    email: 'user@company.com'
  });

  useEffect(() => {
    // load profile from backend
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/users/profile/');
        const data = res.data || {};
        const user = data.user || {};

        if (cancelled) return;

        setFormData({
          fullName: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || userName,
          position: (user.profile && user.profile.position) || '',
          department: user.department_name || (user.profile && user.profile.department) || '',
          phone: (user.profile && user.profile.phone) || '',
          email: user.email || ''
        });
      } catch (err: any) {
        console.error('Failed to load profile', err);
        if (err && err.response && (err.response.status === 401 || err.response.status === 403)) {
          // token expired or unauthorized — clear local state so app will return to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
      }
    })();
    return () => { cancelled = true; };
  }, [userName]);
  
  const [saved, setSaved] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const payload: any = {
          email: formData.email,
          phone: formData.phone
        };
        const res = await apiClient.patch('/users/profile/contact/', payload);
        // optimistic success
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        // update local stored user display name if server returned updated user
        if (res.data && res.data.user) {
          const user = res.data.user;
          const userNameNew = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
          const stored = localStorage.getItem('user');
          try {
            const obj = stored ? JSON.parse(stored) : {};
            obj.userName = userNameNew;
            localStorage.setItem('user', JSON.stringify(obj));
          } catch (e) {
            // ignore
          }
        }
      } catch (err: any) {
        console.error('Failed to update contact', err);
        alert('Ошибка при сохранении: ' + (err?.response?.data?.detail || err?.message || 'unknown'));
      }
    })();
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-[#1F2937]">Мой профиль</h1>
      
      <Card>
        <div className="flex items-start gap-6 mb-8">
          {/* Аватар */}
          <div className="w-24 h-24 bg-[#CF1217] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl font-medium">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          
          <div className="flex-1">
            <h2 className="text-[#1F2937] mb-2">{userName}</h2>
            <p className="text-[#6B7280]">{formData.position} • {formData.department}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Только для чтения */}
            <Input
              label="ФИО"
              value={formData.fullName}
              disabled
              className="bg-[#F3F4F6]"
            />
            
            <Input
              label="Должность"
              value={formData.position}
              disabled
              className="bg-[#F3F4F6]"
            />
            
            <Input
              label="Подразделение"
              value={formData.department}
              disabled
              className="bg-[#F3F4F6]"
            />
            
            {/* Редактируемые поля */}
            <Input
              label="Телефон"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#E5E7EB]">
            {saved && (
              <p className="text-[#10B981]">✓ Изменения сохранены</p>
            )}
            <div className={saved ? '' : 'ml-auto'}>
              <Button type="submit">
                Сохранить изменения
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
