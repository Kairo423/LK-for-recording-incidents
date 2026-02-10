import React from 'react';
import { TrendingUp, Clock, CheckCircle, FileText } from 'lucide-react';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { mockIncidents, getStatusVariant } from '../utils/mock-data';
import { PageType, UserRole } from '../types/index.ts';

interface DashboardProps {
  userName: string;
  onNavigate: (page: PageType, incidentId?: number) => void;
}

// Статистика на основе реальных данных
const totalIncidents = mockIncidents.length;
const newIncidents = mockIncidents.filter(i => i.status === 'Новое').length;
const inProgressIncidents = mockIncidents.filter(i => i.status === 'В работе').length;
const completedThisMonth = mockIncidents.filter(i => i.status === 'Завершено').length;

const stats = [
  { label: 'Всего происшествий', value: totalIncidents, icon: TrendingUp, color: '#1F2937' },
  { label: 'Новые происшествия', value: newIncidents, icon: FileText, color: '#CF1217' },
  { label: 'В работе', value: inProgressIncidents, icon: Clock, color: '#F59E0B' },
  { label: 'Завершено за месяц', value: completedThisMonth, icon: CheckCircle, color: '#10B981' }
];

// Последние 5 происшествий
const recentIncidents = mockIncidents.slice(0, 5);

export const DashboardPage: React.FC<DashboardProps> = ({ userName, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div>
        <h1 className="text-[#1F2937] mb-2">Добрый день, {userName}!</h1>
        <p className="text-[#6B7280]">Обзор происшествий и текущей статистики</p>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#6B7280] text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-semibold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Последние происшествия */}
      <Card title="Последние происшествия">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Номер</th>
                <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Тип</th>
                <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Дата</th>
                <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((incident) => (
                <tr 
                  key={incident.id}
                  onClick={() => onNavigate('incident-detail', incident.id)}
                  className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-[#1F2937] font-medium">{incident.number}</td>
                  <td className="py-3 px-4 text-[#1F2937]">{incident.type}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{incident.date}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusVariant(incident.status)}>
                      {incident.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={() => onNavigate('incidents')}
            className="text-[#CF1217] hover:text-[#A00E13] font-medium transition-colors"
          >
            Все происшествия →
          </button>
        </div>
      </Card>
    </div>
  );
};