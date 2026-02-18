// Основные типы приложения

export type PageType = 
  | 'login' 
  | 'dashboard' 
  | 'incidents' 
  | 'incident-detail' 
  | 'profile' 
  | 'analytics' 
  | 'administration';

export type UserRole = 'employee' | 'manager' | 'admin';

export type IncidentStatus = 'Новое' | 'В работе' | 'Завершено';

export type IncidentType = 
  | 'Авария' 
  | 'Несчастный случай' 
  | 'Технический инцидент' 
  | 'Пожар' 
  | 'ДТП';

export type AppUser = {
  id: number;
  email: string;
  full_name?: string;
  fullName?: string; // legacy
  first_name?: string;
  last_name?: string;
  groups?: { id: number; name: string }[];
  department_name?: string;
  // UI fields used in the admin table/forms
  role?: string;
  department?: string;
};

export type Department = {
  id: number;
  name: string;
  parent_department?: number | null;
  manager?: number | null;
  manager_name?: string | null;
};

export interface Incident {
  id: number;
  number: string;
  type: IncidentType;
  department: string;
  date: string;
  time?: string;
  status: IncidentStatus;
  description: string;
  author?: string;
  responsible?: string;
  measures?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  department: string;
}

export interface AppState {
  currentPage: PageType;
  isAuthenticated: boolean;
  userRole: UserRole;
  userName: string;
  selectedIncidentId?: number;
}

/*export type PageType = 
  | 'login' 
  | 'dashboard' 
  | 'incidents' 
  | 'incident-detail' 
  | 'profile' 
  | 'analytics' 
  | 'administration';
*/

export interface StatCard {
  label: string;
  value: number;
  icon: any;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface FilterOptions {
  searchQuery: string;
  typeFilter: string;
  statusFilter?: string;
  departmentFilter?: string;
}
