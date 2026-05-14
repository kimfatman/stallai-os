/**
 * 类型定义
 * Type Definitions
 */

// ==================== 用户相关 ====================

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  level: string;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  days: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== 商品相关 ====================

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  maxStock?: number;
  status: 'active' | 'inactive';
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  category?: string;
  description?: string;
  image?: string;
  price: number;
  cost: number;
  stock?: number;
  lowStockThreshold?: number;
}

// ==================== 交易相关 ====================

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description?: string;
  productId?: string;
  createdAt: string;
}

export interface CreateTransactionInput {
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description?: string;
  productId?: string;
}

// ==================== 库存相关 ====================

export interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  status: 'normal' | 'low' | 'out';
  lastRestockDate?: string;
  updatedAt: string;
}

// ==================== 供应商相关 ====================

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone?: string;
  address?: string;
  rating: number;
  verified: boolean;
  productCount: number;
  minOrder: number;
  deliveryDays: string;
  ordersServed: number;
  reviewCount: number;
  reviews?: SupplierReview[];
  createdAt: string;
}

export interface SupplierReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
}

// ==================== 社区相关 ====================

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: 'experience' | 'help' | 'trade' | 'announcement';
  title: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CreatePostInput {
  category: 'experience' | 'help' | 'trade' | 'announcement';
  title: string;
  content: string;
  images?: string[];
}

// ==================== AI 相关 ====================

export interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  createdAt: string;
}

export interface TrendPrediction {
  id: string;
  name: string;
  category: string;
  popularity: number;
  heatLevel: string;
  startDate: string;
  peakDate: string;
  confidence: number;
  reasons: string[];
}

export interface DailyReport {
  date: string;
  healthScore: number;
  summary: string;
  metrics: {
    revenue: { value: number; change: number };
    orders: { value: number; change: number };
    customers: { value: number; change: number };
    avgOrderValue: { value: number; change: number };
  };
  insights: AIInsight[];
  recommendations: string[];
}

// ==================== 仪表盘相关 ====================

export interface DashboardStats {
  today: {
    revenue: number;
    orders: number;
    visitors: number;
    profit: number;
  };
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  grossMargin: number;
  revenueGrowth: number;
  ordersGrowth: number;
  lowStockCount: number;
  orderTypeDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface AIInsightSummary {
  status: 'normal' | 'warning';
  highlights: string[];
  suggestions: string[];
}

// ==================== API 响应 ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
