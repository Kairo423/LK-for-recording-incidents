import { useEffect, useRef, useState } from 'react';
import apiClient from '../../../../api/client';

interface Option {
  value: string;
  label: string;
}

const defaultDepartmentOptions: Option[] = [{ value: 'all', label: 'Все подразделения' }];
const defaultTypeOptions: Option[] = [{ value: 'all', label: 'Все типы' }];
const defaultStatusOptions: Option[] = [{ value: 'all', label: 'Все статусы' }];

export const useReportFilters = () => {
  const [departmentOptions, setDepartmentOptions] = useState<Option[]>(defaultDepartmentOptions);
  const [typeOptions, setTypeOptions] = useState<Option[]>(defaultTypeOptions);
  const [statusOptions, setStatusOptions] = useState<Option[]>(defaultStatusOptions);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setFiltersLoading(true);
        setFiltersError(null);

        const [departmentsResponse, typesResponse, statusesResponse] = await Promise.all([
          apiClient.get('/users/departments/'),
          apiClient.get('/incidents/types/'),
          apiClient.get('/incidents/statuses/')
        ]);

        if (!isMountedRef.current) {
          return;
        }

        const departmentsData = Array.isArray(departmentsResponse.data)
          ? departmentsResponse.data
          : departmentsResponse.data?.results || [];
        const typesData = Array.isArray(typesResponse.data)
          ? typesResponse.data
          : typesResponse.data?.results || [];
        const statusesData = Array.isArray(statusesResponse.data)
          ? statusesResponse.data
          : statusesResponse.data?.results || [];

        setDepartmentOptions([
          ...defaultDepartmentOptions,
          ...departmentsData.map((dept: any) => ({ value: String(dept.id), label: dept.name }))
        ]);

        setTypeOptions([
          ...defaultTypeOptions,
          ...typesData
            .filter((type: any) => type.is_active !== false)
            .map((type: any) => ({ value: String(type.id), label: type.name }))
        ]);

        setStatusOptions([
          ...defaultStatusOptions,
          ...statusesData.map((status: any) => ({ value: String(status.id), label: status.name }))
        ]);
      } catch (error) {
        console.error('Failed to load report filters', error);
        if (isMountedRef.current) {
          setFiltersError('Не удалось загрузить фильтры. Попробуйте обновить страницу.');
        }
      } finally {
        if (isMountedRef.current) {
          setFiltersLoading(false);
        }
      }
    };

    loadFilterOptions();
  }, []);

  return {
    departmentOptions,
    typeOptions,
    statusOptions,
    filtersLoading,
    filtersError
  };
};
