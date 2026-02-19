import { TrendingUp, Clock, CheckCircle, FileText } from 'lucide-react';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { getStatusVariant } from '../utils/mock-data';
import apiClient from '../../api/client';
import React, { useEffect, useState } from 'react';
import { PageType, UserRole } from '../types/index.ts';

interface DashboardProps {
  userName: string;
  onNavigate: (page: PageType, incidentId?: number) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userName, onNavigate }) => {
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState<Array<{ label: string; value: number; icon: any; color: string }>>([
    { label: 'Всего происшествий', value: 0, icon: TrendingUp, color: '#1F2937' },
    { label: 'Новые происшествия', value: 0, icon: FileText, color: '#CF1217' },
    { label: 'В работе', value: 0, icon: Clock, color: '#F59E0B' },
    { label: 'Завершено', value: 0, icon: CheckCircle, color: '#10B981' }
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/incidents/statistics/');
        const data = res.data || {};
        if (!mounted) return;

        // recent incidents come in data.last_5 (IncidentListSerializer)
        setRecentIncidents(data.last_5 || []);

        const total = data.total || 0;
        const by_status = data.by_status || [];
        const newCount = (by_status.find((s: any) => s.status__name === 'Новое') || {}).count || 0;
        const inWork = (by_status.find((s: any) => s.status__name === 'В работе') || {}).count || 0;
        const closedCount = by_status.reduce((acc: number, s: any) => acc + (s.status__is_closed ? s.count : 0), 0);

        setStats([
          { label: 'Всего происшествий', value: total, icon: TrendingUp, color: '#1F2937' },
          { label: 'Новые происшествия', value: newCount, icon: FileText, color: '#CF1217' },
          { label: 'В работе', value: inWork, icon: Clock, color: '#F59E0B' },
          { label: 'Завершено', value: closedCount, icon: CheckCircle, color: '#10B981' }
        ]);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
                  <td className="py-3 px-4 text-[#1F2937] font-medium">{incident.incident_number}</td>
                  <td className="py-3 px-4 text-[#1F2937]">{incident.incident_type_name || '-'}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{incident.incident_date}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusVariant(incident.status_name || incident.status)}>
                      {incident.status_name || '-'}
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