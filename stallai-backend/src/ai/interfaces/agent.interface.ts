/**
 * AI Agent 接口定义
 * 定义Agent相关的数据结构
 */

/**
 * Agent执行结果
 */
export interface IAgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  tokensUsed?: ITokenUsage;
  metadata?: Record<string, any>;
}

/**
 * Token使用统计
 */
export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  cost?: number;
}

/**
 * Agent执行上下文
 */
export interface IAgentContext {
  userId: string;
  userProfile?: IUserProfile;
  businessData?: IBusinessData;
  conversationHistory?: IConversationMessage[];
  metadata?: Record<string, any>;
}

/**
 * 用户画像
 */
export interface IUserProfile {
  userId: string;
  nickname: string;
  budget: number;
  location?: ILocation;
  preferences?: Record<string, any>;
}

/**
 * 位置信息
 */
export interface ILocation {
  province: string;
  city: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationType?: 'school' | 'business' | 'residential' | 'market' | 'scenic' | 'other';
}

/**
 * 业务数据
 */
export interface IBusinessData {
  orders: IOrder[];
  products: IProduct[];
  inventory: IInventoryItem[];
  dailyStats: IDailyStats[];
  suppliers: ISupplier[];
}

/**
 * 订单
 */
export interface IOrder {
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  profit: number;
  createdAt: Date;
  status: 'pending' | 'completed' | 'refunded';
}

/**
 * 产品
 */
export interface IProduct {
  productId: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  supplierId?: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

/**
 * 库存项
 */
export interface IInventoryItem {
  productId: string;
  productName: string;
  currentStock: number;
  safetyStock: number;
  optimalStock: number;
  avgDailySales: number;
  turnoverRate: number;
  expiryDate?: Date;
  lastRestockDate?: Date;
}

/**
 * 每日统计
 */
export interface IDailyStats {
  date: string;
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: string[];
  weather?: string;
  events?: string[];
}

/**
 * 供应商
 */
export interface ISupplier {
  supplierId: string;
  name: string;
  contact?: string;
  products: string[];
  avgDeliveryTime: number;
  reliabilityScore: number;
}

/**
 * 对话消息
 */
export interface IConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Agent配置
 */
export interface IAgentConfig {
  name: string;
  description: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'deepseek-chat' | 'deepseek-coder';
  temperature: number;
  maxTokens: number;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

/**
 * 分析结果
 */
export interface IAnalysisResult {
  score: number;
  insights: IInsight[];
  trends: ITrend[];
  recommendations: IRecommendation[];
  anomalies: IAnomaly[];
  metadata: Record<string, any>;
}

/**
 * 洞察
 */
export interface IInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  evidence: string[];
}

/**
 * 趋势
 */
export interface ITrend {
  direction: 'up' | 'down' | 'stable';
  metric: string;
  changeRate: number;
  confidence: number;
  forecast: ITrendForecast[];
}

/**
 * 趋势预测
 */
export interface ITrendForecast {
  date: string;
  predicted: number;
  confidence: number;
}

/**
 * 推荐
 */
export interface IRecommendation {
  type: 'restock' | 'pricing' | 'product' | 'promotion' | 'inventory';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  expectedImpact?: number;
  reason: string;
}

/**
 * 异常
 */
export interface IAnomaly {
  type: 'sales' | 'inventory' | 'profit' | 'customer';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
}

/**
 * 产品推荐
 */
export interface IProductRecommendation {
  productId?: string;
  productName: string;
  category: string;
  estimatedCost: number;
  estimatedPrice: number;
  profitMargin: number;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  seasonalFactor: number;
  locationScore: number;
  reason: string;
}

/**
 * 补货计划
 */
export interface IRestockPlan {
  items: IRestockItem[];
  totalCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  priority: 'urgent' | 'normal' | 'low';
  generatedAt: Date;
  validUntil: Date;
}

/**
 * 补货项
 */
export interface IRestockItem {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
  supplierId: string;
  supplierName: string;
  unitCost: number;
  totalCost: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * 趋势预测
 */
export interface ITrendPrediction {
  productId: string;
  productName: string;
  currentSales: number;
  predictedSales: number;
  growthRate: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  factors: string[];
  recommendation: string;
}

/**
 * 日报
 */
export interface IDailyReport {
  date: string;
  summary: string;
  metrics: IDailyMetrics;
  highlights: IHighlight[];
  issues: IIssue[];
  predictions: IPrediction[];
  actions: IAction[];
  tomorrowPlan: ITomorrowPlan;
  generatedAt: Date;
}

/**
 * 每日指标
 */
export interface IDailyMetrics {
  revenue: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
  topProducts: IProductPerformance[];
  customerCount?: number;
  peakHours?: number[];
}

/**
 * 产品表现
 */
export interface IProductPerformance {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  profit: number;
}

/**
 * 亮点
 */
export interface IHighlight {
  title: string;
  description: string;
  metric?: number;
  comparison?: string;
}

/**
 * 问题
 */
export interface IIssue {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

/**
 * 预测
 */
export interface IPrediction {
  type: 'sales' | 'weather' | 'event' | 'demand';
  title: string;
  prediction: string;
  confidence: number;
}

/**
 * 行动项
 */
export interface IAction {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  deadline?: string;
}

/**
 * 明日计划
 */
export interface ITomorrowPlan {
  recommendedProducts: string[];
  pricingStrategy: string;
  restockItems: string[];
  specialNotes: string[];
}
