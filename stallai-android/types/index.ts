// User Types
export interface User {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  stallName: string;
  stallType: string;
  level: number;
  experience: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  total: number;
}

// Dashboard Types
export interface DashboardData {
  businessScore: number;
  aiSummary: string;
  todayMetrics: TodayMetrics;
  weeklyTrend: TrendData[];
  aiSuggestions: AISuggestion[];
}

export interface TodayMetrics {
  revenue: number;
  orders: number;
  profit: number;
  customers: number;
  avgOrderValue: number;
  comparedToYesterday: {
    revenue: number;
    orders: number;
    profit: number;
  };
}

export interface TrendData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface AISuggestion {
  id: string;
  type: 'inventory' | 'pricing' | 'marketing' | 'operation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionText: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  createdAt: Date;
  paymentMethod: string;
}

export interface TransactionSummary {
  todayIncome: number;
  todayExpense: number;
  weekIncome: number;
  weekExpense: number;
  monthIncome: number;
  monthExpense: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Inventory Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  costPrice: number;
  image?: string;
  status: 'normal' | 'low' | 'out';
  salesVelocity: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  currentStock: number;
  suggestedAction: string;
}

export interface RestockSuggestion {
  productId: string;
  productName: string;
  suggestedQuantity: number;
  reason: string;
  predictedDemand: number;
}

// Analytics Types
export interface AnalyticsData {
  revenueChart: ChartData[];
  orderChart: ChartData[];
  customerChart: ChartData[];
  topProducts: TopProduct[];
  peakHours: PeakHour[];
  aiPredictions: AIPrediction;
}

export interface ChartData {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface PeakHour {
  hour: number;
  orders: number;
  revenue: number;
}

export interface AIPrediction {
  tomorrowRevenue: number;
  tomorrowOrders: number;
  confidence: number;
  bestsellerForecast: string[];
  trendDirection: 'up' | 'down' | 'stable';
}

// Theme Types
export interface ThemeColors {
  cream: string;
  darkGray: string;
  wood: string;
  red: string;
  lightGray: string;
  mediumGray: string;
  white: string;
  black: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
