import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../../../../api/client';
import { AnalyticsResponse, StatisticsResponse } from '../types';

export const useAnalyticsData = () => {
  const [statisticsData, setStatisticsData] = useState<StatisticsResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statisticsResponse, analyticsResponse] = await Promise.all([
        apiClient.get('/incidents/statistics/'),
        apiClient.get('/incidents/analytics/')
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setStatisticsData(statisticsResponse.data || null);
      setAnalyticsData(analyticsResponse.data || null);
    } catch (err) {
      console.error('Failed to load analytics data', err);
      if (isMountedRef.current) {
        setError('Не удалось загрузить статистику. Попробуйте обновить страницу.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    statisticsData,
    analyticsData,
    isLoadingStatistics: isLoading,
    statisticsError: error,
    reloadStatistics: fetchAnalyticsData
  };
};
