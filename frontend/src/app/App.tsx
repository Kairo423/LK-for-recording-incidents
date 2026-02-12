import React, { useState } from 'react';
import { Header } from './components/header';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { IncidentsListPage } from './pages/incidents-list';
import { IncidentDetailPage } from './pages/incident-detail';
import { ProfilePage } from './pages/profile';
import { AnalyticsPage } from './pages/analytics';
import { AdministrationPage } from './pages/administration';
import { PageType, UserRole, AppState } from './types/index.ts';


const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentPage: 'login',
    isAuthenticated: false,
    userRole: 'employee',
    userName: '',
    selectedIncidentId: undefined
  });
  
  const handleLogin = (email: string, password: string, role: UserRole) => {
    // Определяем имя пользователя по email
    let userName = 'Пользователь';
    if (email.includes('admin')) {
      userName = 'Админов Админ Админович';
    } else if (email.includes('manager')) {
      userName = 'Менеджеров Менеджер Менеджерович';
    } else {
      userName = 'Иванов Иван Иванович';
    }
    
    setState({
      currentPage: 'dashboard',
      isAuthenticated: true,
      userRole: role,
      userName: userName
    });
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
