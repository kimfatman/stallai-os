import { request } from './api';

interface DailyReport {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  topProducts: { name: string; count: number; revenue: number }[];
  peakHours: { hour: string; orders: number }[];
  aiSummary: string;
  suggestions: { type: string; content: string }[];
}

interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  profitMargin: number;
  popularity: number;
  difficulty: '简单' | '中等' | '困难';
  reason: string;
  matchScore: number;
}

interface TrendProduct {
  id: string;
  name: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  growth: number;
  reason: string;
  risk: '低' | '中' | '高';
  potential: number;
}

interface MarketInsight {
  id: string;
  title: string;
  content: string;
  type: 'trend' | 'tip' | 'warning';
  publishedAt: string;
}

export const aiService = {
  /**
   * Get daily report
   */
  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const response = await request<DailyReport>('GET', '/ai/daily-report', {
      params: { date },
    });
    return response.data!;
  },

  /**
   * Get product suggestions
   */
  getProductSuggestions: async (params?: {
    location?: string;
    targetAudience?: string;
    category?: string;
  }): Promise<ProductSuggestion[]> => {
    const response = await request<ProductSuggestion[]>('GET', '/ai/product-suggestions', {
      params,
    });
    return response.data || [];
  },

  /**
   * Get trending products
   */
  getTrendingProducts: async (timeRange?: 'day' | 'week' | 'month'): Promise<TrendProduct[]> => {
    const response = await request<TrendProduct[]>('GET', '/ai/trending-products', {
      params: { timeRange },
    });
    return response.data || [];
  },

  /**
   * Get market insights
   */
  getMarketInsights: async (): Promise<MarketInsight[]> => {
    const response = await request<MarketInsight[]>('GET', '/ai/market-insights');
    return response.data || [];
  },

  /**
   * Get business prediction
   */
  getPrediction: async (type: 'sales' | 'inventory' | 'demand'): Promise<any> => {
    const response = await request('GET', '/ai/prediction', {
      params: { type },
    });
    return response.data;
  },

  /**
   * Get AI chat response
   */
  chat: async (message: string, context?: any): Promise<{ reply: string }> => {
    const response = await request<{ reply: string }>('POST', '/ai/chat', {
      message,
      context,
    });
    return response.data!;
  },

  /**
   * Analyze sales data
   */
  analyzeSales: async (startDate: string, endDate: string): Promise<any> => {
    const response = await request('GET', '/ai/analyze-sales', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Generate business advice
   */
  getBusinessAdvice: async (): Promise<{ advice: string; priority: 'high' | 'medium' | 'low' }[]> => {
    const response = await request<{ advice: string; priority: 'high' | 'medium' | 'low' }[]>(
      'GET',
      '/ai/business-advice'
    );
    return response.data || [];
  },
};

export default aiService;
