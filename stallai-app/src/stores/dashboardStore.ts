import { create } from 'zustand';

interface TodayMetrics {
  revenue: number;
  orders: number;
  visitors: number;
  conversion: number;
}

interface AIInsight {
  id: string;
  type: 'tip' | 'alert' | 'success';
  title: string;
  content: string;
  timestamp: Date;
}

interface DashboardState {
  todayMetrics: TodayMetrics;
  businessScore: number;
  aiInsights: AIInsight[];
  weeklyRevenue: number[];
  isLoading: boolean;
  error: string | null;
  
  setTodayMetrics: (metrics: Partial<TodayMetrics>) => void;
  setBusinessScore: (score: number) => void;
  addAIInsight: (insight: Omit<AIInsight, 'id' | 'timestamp'>) => void;
  removeAIInsight: (id: string) => void;
  setWeeklyRevenue: (revenue: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  todayMetrics: {
    revenue: 0,
    orders: 0,
    visitors: 0,
    conversion: 0,
  },
  businessScore: 0,
  aiInsights: [],
  weeklyRevenue: [],
  isLoading: false,
  error: null,
  
  setTodayMetrics: (metrics) => {
    const current = get().todayMetrics;
    set({ todayMetrics: { ...current, ...metrics } });
  },
  
  setBusinessScore: (score) => set({ businessScore: score }),
  
  addAIInsight: (insight) => {
    const newInsight: AIInsight = {
      ...insight,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const current = get().aiInsights;
    set({ aiInsights: [newInsight, ...current].slice(0, 10) });
  },
  
  removeAIInsight: (id) => {
    const current = get().aiInsights;
    set({ aiInsights: current.filter((i) => i.id !== id) });
  },
  
  setWeeklyRevenue: (revenue) => set({ weeklyRevenue: revenue }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  refreshDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      set({
        todayMetrics: {
          revenue: 1238.5,
          orders: 42,
          visitors: 156,
          conversion: 26.9,
        },
        businessScore: 85,
        weeklyRevenue: [856, 1023, 789, 1156, 1342, 1567, 1423],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: 'Failed to refresh dashboard',
        isLoading: false,
      });
    }
  },
}));
