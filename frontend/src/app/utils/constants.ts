// Цветовая палитра приложения
export const COLORS = {
  // Основные цвета
  primary: '#CF1217',
  primaryDark: '#A00E13',
  
  // Фон
  background: '#F9FAFB',
  backgroundCard: '#FFFFFF',
  
  // Текст
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  // Границы
  border: '#E5E7EB',
  
  // Статусы
  statusInProgress: '#F59E0B',
  statusCompleted: '#10B981',
  statusCritical: '#EF4444',
  
  // Дополнительные
  white: '#FFFFFF',
  muted: '#F3F4F6',
} as const;

// Типы происшествий
export const INCIDENT_TYPES = [
  'Авария',
  'Несчастный случай',
  'Технический инцидент',
  'Пожар',
  'ДТП'
] as const;

// Статусы происшествий
export const INCIDENT_STATUSES = [
  'Новое',
  'В работе',
  'Завершено'
] as const;

// Роли пользователей
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
