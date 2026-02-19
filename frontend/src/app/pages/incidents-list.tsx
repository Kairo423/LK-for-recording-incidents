import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { Card } from '../components/card';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select } from '../components/select';
import { Modal } from '../components/modal';
import { IncidentForm } from '../components/incident-form';
import { EmptyState } from '../components/empty-state';
import { getStatusVariant, getTypeVariant } from '../utils/mock-data';
import apiClient from '../../api/client';
import { PageType, UserRole } from '../types/index.ts';

interface IncidentsListProps {
  onNavigate: (page: PageType, incidentId?: number) => void;
}

const incidentTypes = [
  { value: 'all', label: 'Все типы' },
  { value: 'Авария', label: 'Авария' },
  { value: 'Несчастный случай', label: 'Несчастный случай' },
  { value: 'Технический инцидент', label: 'Технический инцидент' },
  { value: 'Пожар', label: 'Пожар' },
  { value: 'ДТП', label: 'ДТП' }
];

export const IncidentsListPage: React.FC<IncidentsListProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const itemsPerPage = 10;

  const [incidents, setIncidents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Load incidents from API when filters/page/search change
  useEffect(() => {
    let mounted = true;
    const fetchIncidents = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { page: currentPage };
        if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
        if (typeFilter && typeFilter !== 'all') params.incident_type_name = typeFilter;

        const res = await apiClient.get('/incidents/', { params });
        if (!mounted) return;
        const data = res.data || {};
        // DRF paginated response: {count, next, previous, results}
        setIncidents(data.results || []);
        setTotalCount(data.count || (data.results ? data.results.length : 0));
      } catch (err: any) {
        console.error('Failed to load incidents', err);
        if (mounted) setError(err?.response?.data?.detail || err?.message || 'Ошибка при загрузке');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIncidents();
    return () => { mounted = false; };
  }, [searchQuery, typeFilter, currentPage]);
  
  const handleReset = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCurrentPage(1);
  };
  
  const handleCreateIncident = (data: any) => {
    console.log('Создание происшествия:', data);
    setShowCreateModal(false);
    // Здесь будет логика создания
  };
  
  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1F2937] mb-2">Происшествия</h1>
          <p className="text-[#6B7280]">Управление и мониторинг всех происшествий</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Создать происшествие
        </Button>
      </div>
      
      {/* Фильтры */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Поиск по описанию или номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={incidentTypes}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleReset}
          >
            Сбросить
          </Button>
        </div>
      </Card>
      
      {/* Таблица */}
      <Card>
        {loading ? (
          <div className="p-6 text-center text-[#6B7280]">Загрузка...</div>
        ) : error ? (
          <EmptyState
            icon={<FileX className="w-12 h-12" />}
            title="Ошибка"
            description={String(error)}
            action={<Button variant="secondary" size="sm" onClick={() => { setCurrentPage(1); setSearchQuery(''); setTypeFilter('all'); }}>Сбросить</Button>}
          />
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={<FileX className="w-12 h-12" />}
            title="Происшествия не найдены"
            description="Попробуйте изменить параметры поиска или фильтры"
            action={
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Сбросить фильтры
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">№</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Тип</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Подразделение</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Дата</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Статус</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident, index) => (
                    <tr 
                      key={incident.id}
                      onClick={() => onNavigate('incident-detail', incident.id)}
                      className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                      }`}
                    >
                      <td className="py-3 px-4 text-[#1F2937] font-medium">{incident.incident_number}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getTypeVariant(incident.incident_type_name)}>
                          {incident.incident_type_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#1F2937]">{incident.department_name}</td>
                      <td className="py-3 px-4 text-[#6B7280]">{incident.incident_date}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(incident.status_name)}>
                          {incident.status_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#6B7280] max-w-xs truncate">
                        {incident.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#E5E7EB]">
                <p className="text-[#6B7280]">
                  Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} из {totalCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Назад
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-[#CF1217] text-white'
                            : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Модальное окно создания */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создание происшествия"
        size="lg"
      >
        <IncidentForm
          onSubmit={handleCreateIncident}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};