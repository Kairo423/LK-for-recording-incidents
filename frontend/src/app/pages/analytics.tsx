import React, { useState } from 'react';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select } from '../components/select';
import { Download, TrendingUp } from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Данные для диаграмм
const typeDistributionData = [
  { name: 'Авария', value: 6, color: '#CF1217' },
  { name: 'Технические', value: 4, color: '#F59E0B' },
  { name: 'Несчастные случаи', value: 3, color: '#EF4444' },
  { name: 'ДТП', value: 2, color: '#3B82F6' }
];

const monthlyDynamicsData = [
  { month: 'Янв', count: 3 },
  { month: 'Фев', count: 5 },
  { month: 'Мар', count: 4 },
  { month: 'Апр', count: 6 },
  { month: 'Май', count: 4 },
  { month: 'Июн', count: 7 }
];

const departmentData = [
  { department: 'Производство', count: 8 },
  { department: 'Склад', count: 3 },
  { department: 'Логистика', count: 2 },
  { department: 'ИТ', count: 1 },
  { department: 'Энергетика', count: 1 }
];

const statusData = [
  { status: 'В работе', count: 6 },
  { status: 'Завершено', count: 9 }
];

const departments = [
  { value: 'all', label: 'Все подразделения' },
  { value: 'production', label: 'Производство' },
  { value: 'warehouse', label: 'Склад' },
  { value: 'logistics', label: 'Логистика' }
];

const types = [
  { value: 'all', label: 'Все типы' },
  { value: 'accident', label: 'Авария' },
  { value: 'injury', label: 'Несчастный случай' },
  { value: 'technical', label: 'Технический инцидент' }
];

const statuses = [
  { value: 'all', label: 'Все статусы' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'completed', label: 'Завершено' }
];

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'statistics' | 'reports'>('statistics');
  const [reportParams, setReportParams] = useState({
    period: '',
    department: 'all',
    type: 'all',
    status: 'all'
  });
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const handleGenerateReport = () => {
    console.log('Генерация отчета:', reportParams);
    setReportGenerated(true);
  };
  
  const handleDownloadReport = () => {
    console.log('Скачивание отчета');
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-[#1F2937]">Аналитика и отчетность</h1>
      
      {/* Вкладки */}
      <div className="flex gap-2 border-b border-[#E5E7EB]">
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'statistics'
              ? 'border-[#CF1217] text-[#CF1217]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Общая статистика
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'reports'
              ? 'border-[#CF1217] text-[#CF1217]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Сформировать отчет
        </button>
      </div>
      
      {/* Общая статистика */}
      {activeTab === 'statistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Распределение по типам */}
          <Card title="Распределение по типам">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {typeDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-[#6B7280]">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Динамика по месяцам */}
          <Card title="Динамика по месяцам">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyDynamicsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#CF1217" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          
          {/* Топ подразделений */}
          <Card title="Топ подразделений по количеству">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="department" type="category" stroke="#6B7280" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          
          {/* Распределение по статусам */}
          <Card title="Распределение по статусам">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="status" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
      
      {/* Формирование отчета */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card title="Параметры отчета">
            <div className="space-y-4">
              {/* Период */}
              <div>
                <label className="block mb-1.5 text-[#1F2937]">
                  Период <span className="text-[#CF1217]">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setReportParams(prev => ({ ...prev, period: 'current-month' }))}
                  >
                    Текущий месяц
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setReportParams(prev => ({ ...prev, period: 'last-month' }))}
                  >
                    Прошлый месяц
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setReportParams(prev => ({ ...prev, period: 'current-year' }))}
                  >
                    Текущий год
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    placeholder="От"
                  />
                  <Input
                    type="date"
                    placeholder="До"
                  />
                </div>
              </div>
              
              {/* Фильтры */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Подразделение"
                  options={departments}
                  value={reportParams.department}
                  onChange={(e) => setReportParams(prev => ({ ...prev, department: e.target.value }))}
                />
                <Select
                  label="Тип"
                  options={types}
                  value={reportParams.type}
                  onChange={(e) => setReportParams(prev => ({ ...prev, type: e.target.value }))}
                />
                <Select
                  label="Статус"
                  options={statuses}
                  value={reportParams.status}
                  onChange={(e) => setReportParams(prev => ({ ...prev, status: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleGenerateReport} icon={<TrendingUp className="w-4 h-4" />}>
                Сформировать
              </Button>
            </div>
          </Card>
          
          {/* Результаты отчета */}
          {reportGenerated && (
            <Card 
              title="Результаты отчета"
              actions={
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleDownloadReport}
                  icon={<Download className="w-4 h-4" />}
                >
                  Скачать (XLSX)
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <h4 className="text-[#1F2937] mb-2">Отчет по происшествиям</h4>
                  <p className="text-[#6B7280] text-sm">
                    Период: Февраль 2026<br />
                    Подразделение: Все<br />
                    Тип: Все<br />
                    Статус: Все
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Номер</th>
                        <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Тип</th>
                        <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Подразделение</th>
                        <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Дата</th>
                        <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-[#E5E7EB]">
                          <td className="py-3 px-4 text-[#1F2937]">INC-2026-00{i}</td>
                          <td className="py-3 px-4 text-[#1F2937]">Авария</td>
                          <td className="py-3 px-4 text-[#1F2937]">Производство</td>
                          <td className="py-3 px-4 text-[#6B7280]">2026-02-0{i}</td>
                          <td className="py-3 px-4 text-[#10B981]">Завершено</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
