import React, { useCallback, useMemo, useState } from 'react';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select } from '../components/select';
import { Download, TrendingUp } from 'lucide-react';
import apiClient from '../../api/client';
import { UserRole } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  buildReportFilters,
  formatDateToInput,
  getFileNameFromDisposition,
  getOptionLabel,
  getPeriodSummaryLabel,
  MONTH_LABELS,
  triggerBlobDownload,
  TYPE_COLORS
} from './analytics/utils';
import { useAnalyticsData } from './analytics/hooks/useAnalyticsData';
import { useReportFilters } from './analytics/hooks/useReportFilters';
import { useManagerDepartment } from './analytics/hooks/useManagerDepartment';
import { ReportParamsSnapshot, ReportSummary } from './analytics/types';

interface AnalyticsPageProps {
  userRole: UserRole;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'statistics' | 'reports'>('statistics');
  const [reportParams, setReportParams] = useState({
    period: '',
    dateFrom: '',
    dateTo: '',
    department: 'all',
    type: 'all',
    status: 'all'
  });
  const [reportGenerated, setReportGenerated] = useState(false);
  const {
    statisticsData,
    analyticsData,
    isLoadingStatistics,
    statisticsError
  } = useAnalyticsData();
  const {
    departmentOptions,
    typeOptions,
    statusOptions,
    filtersLoading,
    filtersError
  } = useReportFilters();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [lastReportFilters, setLastReportFilters] = useState<Record<string, string>>({});
  const [lastReportSummary, setLastReportSummary] = useState<ReportSummary | null>(null);
  const handleManagerDepartmentResolved = useCallback(
    (departmentId: string) => {
      setReportParams((prev) => ({ ...prev, department: departmentId }));
    },
    [setReportParams]
  );
  const { userDepartment, isProfileLoading, profileError } = useManagerDepartment(
    userRole,
    handleManagerDepartmentResolved
  );

  

  

  

  const exportIncidents = async (
    filters: Record<string, string>,
    summarySource: ReportParamsSnapshot | null
  ) => {
    const response = await apiClient.post(
      '/incidents/export/',
      {},
      {
        params: filters,
        responseType: 'blob'
      }
    );

    const fileName = getFileNameFromDisposition(response.headers?.['content-disposition']);
    triggerBlobDownload(response.data, fileName);

    if (summarySource) {
      setReportGenerated(true);
      setLastReportFilters(filters);
      const departmentOptionsSource = isDepartmentLocked && userDepartment ? departmentLockedOption : departmentOptions;

      setLastReportSummary({
        dateFrom: summarySource.dateFrom,
        dateTo: summarySource.dateTo,
        departmentLabel: getOptionLabel(
          departmentOptionsSource,
          summarySource.department,
          isDepartmentLocked && userDepartment ? userDepartment.label : 'Все подразделения'
        ),
        typeLabel: getOptionLabel(typeOptions, summarySource.type, 'Все типы'),
        statusLabel: getOptionLabel(statusOptions, summarySource.status, 'Все статусы')
      });
    }
  };

  const handlePeriodPreset = (preset: 'current-month' | 'last-month' | 'current-year') => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (preset === 'current-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    }

    setReportParams((prev) => ({
      ...prev,
      period: preset,
      dateFrom: formatDateToInput(start),
      dateTo: formatDateToInput(end)
    }));
  };

  const handleDateChange = (key: 'dateFrom' | 'dateTo', value: string) => {
    setReportParams((prev) => ({
      ...prev,
      period: '',
      [key]: value
    }));
  };

  const handleGenerateReport = async () => {
    setReportError(null);
    setIsGeneratingReport(true);
    const snapshot: ReportParamsSnapshot = {
      dateFrom: reportParams.dateFrom,
      dateTo: reportParams.dateTo,
      department: reportParams.department,
      type: reportParams.type,
      status: reportParams.status
    };
    const filters = buildReportFilters(snapshot);

    try {
      await exportIncidents(filters, snapshot);
    } catch (error: any) {
      console.error('Failed to generate report', error);
      setReportError(error?.response?.data?.detail || 'Не удалось сформировать отчет.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!reportGenerated || !lastReportSummary) {
      await handleGenerateReport();
      return;
    }

    setReportError(null);
    setIsGeneratingReport(true);

    try {
      await exportIncidents(lastReportFilters, null);
    } catch (error: any) {
      console.error('Failed to download report', error);
      setReportError(error?.response?.data?.detail || 'Не удалось скачать отчет.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const typeDistributionData = useMemo(() => {
    const items = statisticsData?.by_type ?? [];
    return items.map((item, index) => ({
      name: item.incident_type__name || 'Не указан',
      value: item.count || 0,
      color:
        item.incident_type__color && /^#[0-9A-Fa-f]{6}$/.test(item.incident_type__color)
          ? item.incident_type__color
          : TYPE_COLORS[index % TYPE_COLORS.length]
    }));
  }, [statisticsData]);

  const statusDistributionData = useMemo(() => {
    const items = statisticsData?.by_status ?? [];
    return items.map((item) => ({
      status: item.status__name || 'Не указан',
      count: item.count || 0,
      isClosed: item.status__is_closed || false
    }));
  }, [statisticsData]);

  const departmentData = useMemo(() => {
    const items = analyticsData?.by_department ?? [];
    return items.map((item) => ({
      department: item.department__name || 'Не указано',
      count: item.count || 0
    })).slice(0, 5);
  }, [analyticsData]);

  const monthlyDynamicsData = useMemo(() => {
    const items = analyticsData?.by_month ?? [];
    const countByMonth = new Map<string, number>();

    items.forEach((item) => {
      if (item.month) {
        countByMonth.set(item.month, item.count || 0);
      }
    });

    const months: { month: string; count: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        month: MONTH_LABELS[date.getMonth()],
        count: countByMonth.get(key) ?? 0
      });
    }

    return months;
  }, [analyticsData]);

  const hasTypeData = typeDistributionData.some((item) => item.value > 0);
  const hasStatusData = statusDistributionData.some((item) => item.count > 0);
  const hasDepartmentData = departmentData.some((item) => item.count > 0);

  const isManager = userRole === 'manager';
  const isDepartmentLocked = isManager;
  const departmentLockedOption = userDepartment
    ? [{ value: userDepartment.id, label: userDepartment.label }]
    : [{ value: '', label: isProfileLoading ? 'Определяем подразделение...' : 'Подразделение недоступно' }];
  const departmentSelectOptions = isDepartmentLocked ? departmentLockedOption : departmentOptions;
  const departmentValue = isDepartmentLocked ? (userDepartment?.id || '') : reportParams.department;
  const departmentControlDisabled = filtersLoading || (isDepartmentLocked ? isProfileLoading || !userDepartment : false);
  const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (isDepartmentLocked) {
      return;
    }
    const { value } = event.target;
    setReportParams((prev) => ({ ...prev, department: value }));
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
        isLoadingStatistics ? (
          <Card title="Общая статистика">
            <p className="text-[#6B7280]">Загружаем актуальные данные...</p>
          </Card>
        ) : statisticsError ? (
          <Card title="Общая статистика">
            <p className="text-[#B91C1C]">{statisticsError}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Распределение по типам */}
            <Card title="Распределение по типам">
              {hasTypeData ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={typeDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          const safePercent = Number.isFinite(percent) ? percent : 0;
                          return `${name}: ${(safePercent * 100).toFixed(0)}%`;
                        }}
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
                </>
              ) : (
                <p className="text-[#6B7280] text-sm">Недостаточно данных для отображения.</p>
              )}
            </Card>
            
            {/* Динамика по месяцам */}
            <Card title="Динамика по месяцам">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyDynamicsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#CF1217" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-[#9CA3AF] mt-2">Показываются последние 6 месяцев, включая текущий.</p>
            </Card>
            
            {/* Топ подразделений */}
            <Card title="Топ подразделений по количеству">
              {hasDepartmentData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" stroke="#6B7280" allowDecimals={false} />
                    <YAxis dataKey="department" type="category" stroke="#6B7280" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#6B7280] text-sm">Нет данных по подразделениям.</p>
              )}
            </Card>
            
            {/* Распределение по статусам */}
            <Card title="Распределение по статусам">
              {hasStatusData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="status" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#6B7280] text-sm">Нет данных по статусам.</p>
              )}
            </Card>
          </div>
        )
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
                    variant={reportParams.period === 'current-month' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePeriodPreset('current-month')}
                  >
                    Текущий месяц
                  </Button>
                  <Button 
                    variant={reportParams.period === 'last-month' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePeriodPreset('last-month')}
                  >
                    Прошлый месяц
                  </Button>
                  <Button 
                    variant={reportParams.period === 'current-year' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePeriodPreset('current-year')}
                  >
                    Текущий год
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    placeholder="От"
                    value={reportParams.dateFrom}
                    onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="До"
                    value={reportParams.dateTo}
                    onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Фильтры */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Подразделение"
                    options={departmentSelectOptions}
                    value={departmentValue}
                    onChange={handleDepartmentChange}
                    disabled={departmentControlDisabled}
                  />
                  <Select
                    label="Тип"
                    options={typeOptions}
                    value={reportParams.type}
                    onChange={(e) => setReportParams(prev => ({ ...prev, type: e.target.value }))}
                    disabled={filtersLoading}
                  />
                  <Select
                    label="Статус"
                    options={statusOptions}
                    value={reportParams.status}
                    onChange={(e) => setReportParams(prev => ({ ...prev, status: e.target.value }))}
                    disabled={filtersLoading}
                  />
                </div>
                {filtersLoading && (
                  <p className="text-sm text-[#6B7280]">Загружаем фильтры...</p>
                )}
                {filtersError && (
                  <p className="text-sm text-[#B91C1C]">{filtersError}</p>
                )}
                {profileError && (
                  <p className="text-sm text-[#B91C1C]">{profileError}</p>
                )}
                {isDepartmentLocked && userDepartment && (
                  <p className="text-xs text-[#6B7280]">Как руководитель вы можете формировать отчеты только по своему подразделению.</p>
                )}
              </div>
              
              <Button 
                onClick={handleGenerateReport} 
                icon={<TrendingUp className="w-4 h-4" />} 
                loading={isGeneratingReport}
                disabled={filtersLoading || (isDepartmentLocked && (!userDepartment || isProfileLoading))}
              >
                Сформировать
              </Button>
              {reportError && (
                <p className="text-sm text-[#B91C1C]">{reportError}</p>
              )}
            </div>
          </Card>
          
          {/* Результаты отчета */}
          {reportGenerated && lastReportSummary && (
            <Card 
              title="Результаты отчета"
              actions={
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleDownloadReport}
                  loading={isGeneratingReport}
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
                    Период: {getPeriodSummaryLabel(lastReportSummary)}<br />
                    Подразделение: {lastReportSummary.departmentLabel}<br />
                    Тип: {lastReportSummary.typeLabel}<br />
                    Статус: {lastReportSummary.statusLabel}
                  </p>
                </div>
                <div className="p-4 border border-dashed border-[#D1D5DB] rounded-lg text-sm text-[#6B7280]">
                  Файл с данными был автоматически выгружен в формате XLSX. При необходимости вы можете повторить выгрузку, нажав кнопку "Скачать".
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
