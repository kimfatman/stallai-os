import { api } from './api';
import { DashboardData, TrendData, AISuggestion } from '../types';

// Mock data for development
const mockDashboardData: DashboardData = {
  businessScore: 87,
  aiSummary: '今日经营状况良好，销售额较昨日增长15%，建议关注库存预警商品并及时补货。周末客流高峰即将到来，可适当增加热门商品备货。',
  todayMetrics: {
    revenue: 2580.5,
    orders: 42,
    profit: 1548.3,
    customers: 38,
    avgOrderValue: 61.44,
    comparedToYesterday: {
      revenue: 15.2,
      orders: 8.5,
      profit: 12.3,
    },
  },
  weeklyTrend: [
    { date: '周一', revenue: 1850, orders: 32, profit: 1110 },
    { date: '周二', revenue: 2100, orders: 35, profit: 1260 },
    { date: '周三', revenue: 1950, orders: 30, profit: 1170 },
    { date: '周四', revenue: 2240, orders: 38, profit: 1344 },
    { date: '周五', revenue: 2580, orders: 42, profit: 1548 },
    { date: '周六', revenue: 3200, orders: 55, profit: 1920 },
    { date: '周日', revenue: 2900, orders: 48, profit: 1740 },
  ],
  aiSuggestions: [
    {
      id: '1',
      type: 'inventory',
      title: '库存预警',
      description: '烤肠库存仅剩5根，预计今日售罄，建议立即补货',
      impact: 'high',
      actionText: '去补货',
    },
    {
      id: '2',
      type: 'pricing',
      title: '定价建议',
      description: '根据周边竞品分析，奶茶价格可上调1元，预计增收8%',
      impact: 'medium',
      actionText: '查看详情',
    },
    {
      id: '3',
      type: 'marketing',
      title: '营销机会',
      description: '周末客流高峰将至，建议推出套餐优惠提升客单价',
      impact: 'medium',
      actionText: '创建活动',
    },
  ],
};

export const dashboardService = {
  // Get dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      // In production, use actual API
      // const response = await api.get<DashboardData>('/dashboard');
      // return response.data;
      
      // Mock data for development
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockDashboardData;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  },
  
  // Get real-time metrics
  getRealtimeMetrics: async (): Promise<{
    revenue: number;
    orders: number;
    customers: number;
  }> => {
    try {
      // const response = await api.get('/dashboard/realtime');
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        revenue: Math.floor(Math.random() * 100) + 2500,
        orders: Math.floor(Math.random() * 10) + 40,
        customers: Math.floor(Math.random() * 8) + 35,
      };
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
      throw error;
    }
  },
  
  // Get weekly trend
  getWeeklyTrend: async (): Promise<TrendData[]> => {
    try {
      // const response = await api.get<TrendData[]>('/dashboard/trend');
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockDashboardData.weeklyTrend;
    } catch (error) {
      console.error('Failed to fetch weekly trend:', error);
      throw error;
    }
  },
  
  // Get AI suggestions
  getAISuggestions: async (): Promise<AISuggestion[]> => {
    try {
      // const response = await api.get<AISuggestion[]>('/dashboard/suggestions');
      // return response.data;
      
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockDashboardData.aiSuggestions;
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      throw error;
    }
  },
  
  // Update business score
  updateBusinessScore: async (score: number): Promise<void> => {
    try {
      // await api.post('/dashboard/score', { score });
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Failed to update business score:', error);
      throw error;
    }
  },
};
