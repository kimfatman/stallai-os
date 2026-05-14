import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useDashboardStore } from '@/stores/dashboardStore';

export function useDashboardStats() {
  const { setTodayMetrics, setBusinessScore, setWeeklyRevenue } = useDashboardStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync with store
  useEffect(() => {
    if (data) {
      setTodayMetrics(data.metrics);
      setBusinessScore(data.metrics.businessScore);
      setWeeklyRevenue(data.weeklyData.map(d => d.revenue));
    }
  }, [data, setTodayMetrics, setBusinessScore, setWeeklyRevenue]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

export function useTodayMetrics() {
  return useQuery({
    queryKey: ['todayMetrics'],
    queryFn: dashboardService.getTodayMetrics,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useWeeklyData() {
  return useQuery({
    queryKey: ['weeklyData'],
    queryFn: dashboardService.getWeeklyData,
    staleTime: 1000 * 60 * 5,
  });
}
