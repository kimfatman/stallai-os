import { create } from 'zustand';
import { DashboardData, TodayMetrics, AISuggestion, TrendData } from '../types';

interface DashboardState {
  // Data
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Real-time metrics
  liveRevenue: number;
  liveOrders: number;
  liveCustomers: number;
  
  // Actions
  setDashboardData: (data: DashboardData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateMetrics: (metrics: Partial<TodayMetrics>) => void;
  updateLiveMetrics: (metrics: { revenue?: number; orders?: number; customers?: number }) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  dismissSuggestion: (id: string) => void;
  refresh: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboardData: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  liveRevenue: 0,
  liveOrders: 0,
  liveCustomers: 0,
  
  setDashboardData: (data) => set({
    dashboardData: data,
    lastUpdated: new Date(),
    error: null,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  updateMetrics: (metrics) => set((state) => ({
    dashboardData: state.dashboardData
      ? {
          ...state.dashboardData,
          todayMetrics: {
            ...state.dashboardData.todayMetrics,
            ...metrics,
          },
        }
      : null,
  })),
  
  updateLiveMetrics: (metrics) => set((state) => ({
    liveRevenue: metrics.revenue ?? state.liveRevenue,
    liveOrders: metrics.orders ?? state.liveOrders,
    liveCustomers: metrics.customers ?? state.liveCustomers,
  })),
  
  addSuggestion: (suggestion) => set((state) => ({
    dashboardData: state.dashboardData
      ? {
          ...state.dashboardData,
          aiSuggestions: [suggestion, ...state.dashboardData.aiSuggestions].slice(0, 5),
        }
      : null,
  })),
  
  dismissSuggestion: (id) => set((state) => ({
    dashboardData: state.dashboardData
      ? {
          ...state.dashboardData,
          aiSuggestions: state.dashboardData.aiSuggestions.filter((s) => s.id !== id),
        }
      : null,
  })),
  
  refresh: () => {
    set({ isLoading: true, error: null });
    // Trigger refresh - actual data fetch handled by service
  },
}));
