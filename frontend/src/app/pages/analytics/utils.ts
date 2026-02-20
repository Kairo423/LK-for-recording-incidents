import { ReportParamsSnapshot, ReportSummary } from './types';

export const TYPE_COLORS = ['#CF1217', '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#6366F1', '#F472B6'];

export const MONTH_LABELS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const formatDateToInput = (date: Date) => date.toISOString().slice(0, 10);

export const formatDateForDisplay = (value?: string) => {
  if (!value) {
    return 'Все даты';
  }
  try {
    return new Date(value).toLocaleDateString('ru-RU');
  } catch (error) {
    return value;
  }
};

export const getFileNameFromDisposition = (header?: string | null) => {
  if (header) {
    const match = /filename="?([^";]+)"?/i.exec(header);
    if (match && match[1]) {
      return match[1];
    }
  }
  return `incidents_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

export const getOptionLabel = (
  options: { value: string; label: string }[],
  value: string,
  fallback: string
) => {
  if (!value || value === 'all') {
    return fallback;
  }
  return options.find((option) => option.value === value)?.label || fallback;
};

export const buildReportFilters = (params: ReportParamsSnapshot) => {
  const filters: Record<string, string> = {};

  if (params.dateFrom) {
    filters.date_from = params.dateFrom;
  }
  if (params.dateTo) {
    filters.date_to = params.dateTo;
  }
  if (params.department && params.department !== 'all') {
    filters.department = params.department;
  }
  if (params.type && params.type !== 'all') {
    filters.incident_type = params.type;
  }
  if (params.status && params.status !== 'all') {
    filters.status = params.status;
  }

  return filters;
};

export const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getPeriodSummaryLabel = (summary: ReportSummary) => {
  if (summary.dateFrom && summary.dateTo) {
    return `${formatDateForDisplay(summary.dateFrom)} — ${formatDateForDisplay(summary.dateTo)}`;
  }
  if (summary.dateFrom) {
    return `с ${formatDateForDisplay(summary.dateFrom)}`;
  }
  if (summary.dateTo) {
    return `до ${formatDateForDisplay(summary.dateTo)}`;
  }
  return 'Все даты';
};
