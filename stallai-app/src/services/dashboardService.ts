import { request } from './api';

interface DashboardMetrics {
  revenue: number;
  orders: number;
  visitors: number;
  conversion: number;
  businessScore: number;
}

interface AIInsight {
  id: string;
  type: 'tip' | 'alert' | 'success';
  title: string;
  content: string;
  timestamp: string;
}

interface WeeklyData {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardResponse {
  metrics: DashboardMetrics;
  insights: AIInsight[];
  weeklyData: WeeklyData[];
  todayRevenue: number;
  todayOrders: number;
}

export const dashboardService = {
  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    // For demo purposes, return mock data
    return {
      metrics: {
        revenue: 1238.5,
        orders: 42,
        visitors: 156,
        conversion: 26.9,
        businessScore: 85,
      },
      insights: [
        {
          id: '1',
          type: 'tip',
          title: 'AI经营建议',
          content: '根据今日数据分析，建议明日增加烤肠类商品备货量，预计销量将提升20%',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'alert',
          title: '库存预警',
          content: '您的烤冷面库存仅剩15份，建议今晚补货',
          timestamp: new Date().toISOString(),
        },
      ],
      weeklyData: [
        { date: '周一', revenue: 856, orders: 32 },
        { date: '周二', revenue: 1023, orders: 41 },
        { date: '周三', revenue: 789, orders: 28 },
        { date: '周四', revenue: 1156, orders: 48 },
        { date: '周五', revenue: 1342, orders: 55 },
        { date: '周六', revenue: 1567, orders: 62 },
        { date: '周日', revenue: 1423, orders: 58 },
      ],
      todayRevenue: 1238.5,
      todayOrders: 42,
    };
  },

  /**
   * Get today's metrics
   */
  getTodayMetrics: async (): Promise<DashboardMetrics> => {
    const response = await request<DashboardMetrics>('GET', '/dashboard/metrics/today');
    return response.data!;
  },

  /**
   * Get AI insights
   */
  getInsights: async (): Promise<AIInsight[]> => {
    const response = await request<AIInsight[]>('GET', '/dashboard/insights');
    return response.data || [];
  },

  /**
   * Get weekly revenue data
   */
  getWeeklyData: async (): Promise<WeeklyData[]> => {
    const response = await request<WeeklyData[]>('GET', '/dashboard/weekly');
    return response.data || [];
  },
};

export default dashboardService;
