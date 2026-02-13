import React, { useState, useEffect } from 'react';
import { Header } from './components/header';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { IncidentsListPage } from './pages/incidents-list';
import { IncidentDetailPage } from './pages/incident-detail';
import { ProfilePage } from './pages/profile';
import { AnalyticsPage } from './pages/analytics';
import { AdministrationPage } from './pages/administration';
import { PageType, UserRole, AppState } from './types';

// Vite exposes env vars on import.meta.env and requires VITE_ prefix for custom vars.
const API_BASE = ((import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentPage: 'login',
    isAuthenticated: false,
    userRole: 'employee',
    userName: '',
    selectedIncidentId: undefined
  });

  useEffect(() => {
    // restore from localStorage
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (token && userRaw) {
      try {
        const u = JSON.parse(userRaw);
        setState({
          currentPage: 'dashboard',
          isAuthenticated: true,
          userRole: (u.role as UserRole) || 'employee',
          userName: u.userName || '',
          selectedIncidentId: undefined
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    // send credentials to backend login endpoint
    try {
      const res = await fetch(`${API_BASE}/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        const err = data.detail || data.error || JSON.stringify(data);
        throw new Error(err);
      }

      const token = data.token || data.key || data.auth_token || (data.data && data.data.token);
      const user = data.user || data || (data.data && data.data.user) || {};

      // Prefer server-provided role; if absent, infer from groups
      let role: UserRole = (data && data.role) || 'employee';
      if (!role) {
        try {
          const groups = user.groups || [];
          const groupNames = groups.map((g: any) => (g.name || '').toString().toLowerCase());
          if (groupNames.some((n: string) => n.includes('админист') || n.includes('admin'))) role = 'admin';
          else if (groupNames.some((n: string) => n.includes('руковод') || n.includes('manager'))) role = 'manager';
        } catch (e) {
          // keep fallback
          if (email.includes('admin')) role = 'admin';
          else if (email.includes('manager')) role = 'manager';
        }
      }

      const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || email;

      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userName, role }));

      setState({
        currentPage: 'dashboard',
        isAuthenticated: true,
        userRole: role,
        userName: userName,
        selectedIncidentId: undefined
      });
    } catch (err: any) {
      // rethrow so LoginPage can show error
      throw err;
    }
  };
  
  const handleNavigate = (page: PageType, incidentId?: number) => {
    if (page === 'login') {
      // Выход из системы
      setState({
        currentPage: 'login',
        isAuthenticated: false,
        userRole: 'employee',
        userName: ''
      });
    } else {
      setState(prev => ({
        ...prev,
        currentPage: page,
        selectedIncidentId: incidentId
      }));
    }
  };
  
  // Страница авторизации
  if (!state.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  // Основной интерфейс
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header
        currentPage={state.currentPage}
        onNavigate={handleNavigate}
        userRole={state.userRole}
        userName={state.userName}
      />
      
      <main className="px-6 py-8 max-w-[1400px] mx-auto">
        {state.currentPage === 'dashboard' && (
          <DashboardPage userName={state.userName} onNavigate={handleNavigate} />
        )}
        
        {state.currentPage === 'incidents' && (
          <IncidentsListPage onNavigate={handleNavigate} />
        )}
        
        {state.currentPage === 'incident-detail' && state.selectedIncidentId && (
          <IncidentDetailPage 
            incidentId={state.selectedIncidentId} 
            onNavigate={handleNavigate}
          />
        )}
        
        {state.currentPage === 'profile' && (
          <ProfilePage userName={state.userName} />
        )}
        
        {state.currentPage === 'analytics' && (
          <AnalyticsPage />
        )}
        
        {state.currentPage === 'administration' && (
          <AdministrationPage />
        )}
      </main>
    </div>
  );
};

export default App;
