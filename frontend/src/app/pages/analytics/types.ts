export interface StatusStat {
  status__name: string;
  status__is_closed: boolean;
  count: number;
}

export interface TypeStat {
  incident_type__name: string;
  incident_type__color?: string;
  count: number;
}

export interface DepartmentStat {
  department__name: string;
  count: number;
}

export interface MonthStat {
  month: string;
  count: number;
  closed_count?: number;
}

export interface StatisticsResponse {
  total?: number;
  by_status?: StatusStat[];
  by_type?: TypeStat[];
}

export interface AnalyticsResponse {
  by_department?: DepartmentStat[];
  by_month?: MonthStat[];
}

export interface ReportParamsSnapshot {
  dateFrom?: string;
  dateTo?: string;
  department: string;
  type: string;
  status: string;
}

export interface ReportSummary {
  dateFrom?: string;
  dateTo?: string;
  departmentLabel: string;
  typeLabel: string;
  statusLabel: string;
}
