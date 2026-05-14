/**
 * AI DTOs - 数据传输对象
 * 摆摊AI经营OS - AI系统DTO定义
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDateString, Min, Max, ValidateNested, IsObject } from 'class-validator';

/**
 * 位置信息
 */
export class LocationDto {
  @ApiPropertyOptional({ description: '省份' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '区县' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '纬度' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: '位置类型' })
  @IsEnum(['school', 'business', 'residential', 'market', 'scenic', 'other'])
  @IsOptional()
  locationType?: 'school' | 'business' | 'residential' | 'market' | 'scenic' | 'other';
}

/**
 * 订单DTO
 */
export class OrderDto {
  @ApiProperty({ description: '订单ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: '单价' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: '总价' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: '利润' })
  @IsNumber()
  profit: number;

  @ApiProperty({ description: '创建时间' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: '订单状态' })
  @IsEnum(['pending', 'completed', 'refunded'])
  status: 'pending' | 'completed' | 'refunded';
}

/**
 * 产品DTO
 */
export class ProductDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '产品分类' })
  @IsString()
  category: string;

  @ApiProperty({ description: '成本价' })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ description: '售价' })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({ description: '供应商ID' })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ description: '图片URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: '产品状态' })
  @IsEnum(['active', 'inactive', 'out_of_stock'])
  status: 'active' | 'inactive' | 'out_of_stock';
}

/**
 * 库存项DTO
 */
export class InventoryItemDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '当前库存' })
  @IsNumber()
  @Min(0)
  currentStock: number;

  @ApiProperty({ description: '安全库存' })
  @IsNumber()
  @Min(0)
  safetyStock: number;

  @ApiProperty({ description: '最优库存' })
  @IsNumber()
  @Min(0)
  optimalStock: number;

  @ApiProperty({ description: '日均销量' })
  @IsNumber()
  @Min(0)
  avgDailySales: number;

  @ApiProperty({ description: '周转率' })
  @IsNumber()
  turnoverRate: number;

  @ApiPropertyOptional({ description: '过期日期' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '最后补货日期' })
  @IsDateString()
  @IsOptional()
  lastRestockDate?: string;
}

/**
 * 每日统计DTO
 */
export class DailyStatsDto {
  @ApiProperty({ description: '日期' })
  @IsString()
  date: string;

  @ApiProperty({ description: '总营收' })
  @IsNumber()
  @Min(0)
  totalRevenue: number;

  @ApiProperty({ description: '总利润' })
  @IsNumber()
  totalProfit: number;

  @ApiProperty({ description: '总订单数' })
  @IsNumber()
  @Min(0)
  totalOrders: number;

  @ApiProperty({ description: '平均订单金额' })
  @IsNumber()
  @Min(0)
  avgOrderValue: number;

  @ApiProperty({ description: '畅销产品' })
  @IsArray()
  @IsString({ each: true })
  topProducts: string[];

  @ApiPropertyOptional({ description: '天气' })
  @IsString()
  @IsOptional()
  weather?: string;

  @ApiPropertyOptional({ description: '活动' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  events?: string[];
}

/**
 * 供应商DTO
 */
export class SupplierDto {
  @ApiProperty({ description: '供应商ID' })
  @IsString()
  supplierId: string;

  @ApiProperty({ description: '供应商名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '联系方式' })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ description: '供应产品' })
  @IsArray()
  @IsString({ each: true })
  products: string[];

  @ApiProperty({ description: '平均交货时间(天)' })
  @IsNumber()
  @Min(1)
  avgDeliveryTime: number;

  @ApiProperty({ description: '可靠性评分' })
  @IsNumber()
  @Min(0)
  @Max(100)
  reliabilityScore: number;
}

/**
 * 业务分析请求DTO
 */
export class AnalyzeBusinessDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: '订单列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  @IsOptional()
  orders?: OrderDto[];

  @ApiPropertyOptional({ description: '产品列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  @IsOptional()
  products?: ProductDto[];

  @ApiPropertyOptional({ description: '每日统计' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyStatsDto)
  @IsOptional()
  dailyStats?: DailyStatsDto[];

  @ApiPropertyOptional({ description: '分析周期' })
  @IsEnum(['today', 'week', 'month', 'custom'])
  @IsOptional()
  period?: 'today' | 'week' | 'month' | 'custom';
}

/**
 * 产品推荐请求DTO
 */
export class RecommendProductsDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: '位置信息' })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @ApiPropertyOptional({ description: '预算' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ description: '目标人群' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetCrowd?: string[];

  @ApiPropertyOptional({ description: '季节' })
  @IsString()
  @IsOptional()
  season?: string;

  @ApiPropertyOptional({ description: '节日' })
  @IsString()
  @IsOptional()
  festival?: string;

  @ApiPropertyOptional({ description: '排除的产品' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludeProducts?: string[];
}

/**
 * 补货计划请求DTO
 */
export class GenerateRestockPlanDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '库存列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory: InventoryItemDto[];

  @ApiPropertyOptional({ description: '供应商列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierDto)
  @IsOptional()
  suppliers?: SupplierDto[];

  @ApiPropertyOptional({ description: '预算限制' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ description: '紧急程度' })
  @IsEnum(['all', 'urgent', 'normal'])
  @IsOptional()
  urgency?: 'all' | 'urgent' | 'normal';
}

/**
 * 日报生成请求DTO
 */
export class GenerateDailyReportDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '日期' })
  @IsString()
  date: string;

  @ApiProperty({ description: '订单列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  orders: OrderDto[];

  @ApiProperty({ description: '库存列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory: InventoryItemDto[];

  @ApiPropertyOptional({ description: '天气信息' })
  @IsString()
  @IsOptional()
  weather?: string;

  @ApiPropertyOptional({ description: '活动信息' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  events?: string[];

  @ApiPropertyOptional({ description: '用户备注' })
  @IsString()
  @IsOptional()
  userNotes?: string;
}

/**
 * AI聊天请求DTO
 */
export class ChatDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '消息内容' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '上下文数据' })
  @IsObject()
  @IsOptional()
  context?: {
    recentOrders?: OrderDto[];
    currentInventory?: InventoryItemDto[];
    dailyStats?: DailyStatsDto[];
  };
}

/**
 * 洞察DTO
 */
export class InsightDto {
  @ApiProperty({ description: '类型' })
  @IsEnum(['positive', 'negative', 'neutral'])
  type: 'positive' | 'negative' | 'neutral';

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '影响程度' })
  @IsEnum(['high', 'medium', 'low'])
  impact: 'high' | 'medium' | 'low';

  @ApiProperty({ description: '证据' })
  @IsArray()
  @IsString({ each: true })
  evidence: string[];
}

/**
 * 异常DTO
 */
export class AnomalyDto {
  @ApiProperty({ description: '类型' })
  @IsEnum(['sales', 'inventory', 'profit', 'customer'])
  type: 'sales' | 'inventory' | 'profit' | 'customer';

  @ApiProperty({ description: '严重程度' })
  @IsEnum(['critical', 'warning', 'info'])
  severity: 'critical' | 'warning' | 'info';

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '指标名称' })
  @IsString()
  metric: string;

  @ApiProperty({ description: '实际值' })
  @IsNumber()
  actualValue: number;

  @ApiProperty({ description: '期望值' })
  @IsNumber()
  expectedValue: number;

  @ApiProperty({ description: '偏差' })
  @IsNumber()
  deviation: number;
}

/**
 * 推荐DTO
 */
export class RecommendationDto {
  @ApiProperty({ description: '类型' })
  @IsEnum(['restock', 'pricing', 'product', 'promotion', 'inventory'])
  type: 'restock' | 'pricing' | 'product' | 'promotion' | 'inventory';

  @ApiProperty({ description: '优先级' })
  @IsEnum(['high', 'medium', 'low'])
  priority: 'high' | 'medium' | 'low';

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '建议行动' })
  @IsString()
  action: string;

  @ApiPropertyOptional({ description: '预期影响' })
  @IsNumber()
  @IsOptional()
  expectedImpact?: number;

  @ApiProperty({ description: '原因' })
  @IsString()
  reason: string;
}

/**
 * 补货项DTO
 */
export class RestockItemDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '当前库存' })
  @IsNumber()
  currentStock: number;

  @ApiProperty({ description: '建议补货量' })
  @IsNumber()
  suggestedQuantity: number;

  @ApiProperty({ description: '供应商ID' })
  @IsString()
  supplierId: string;

  @ApiProperty({ description: '供应商名称' })
  @IsString()
  supplierName: string;

  @ApiProperty({ description: '单位成本' })
  @IsNumber()
  unitCost: number;

  @ApiProperty({ description: '总成本' })
  @IsNumber()
  totalCost: number;

  @ApiProperty({ description: '紧急程度' })
  @IsEnum(['critical', 'high', 'medium', 'low'])
  urgency: 'critical' | 'high' | 'medium' | 'low';

  @ApiProperty({ description: '原因' })
  @IsString()
  reason: string;
}

/**
 * 补货计划DTO
 */
export class RestockPlanDto {
  @ApiProperty({ description: '补货项列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestockItemDto)
  items: RestockItemDto[];

  @ApiProperty({ description: '总成本' })
  @IsNumber()
  totalCost: number;

  @ApiProperty({ description: '预计营收' })
  @IsNumber()
  expectedRevenue: number;

  @ApiProperty({ description: '预计利润' })
  @IsNumber()
  expectedProfit: number;

  @ApiProperty({ description: '优先级' })
  @IsEnum(['urgent', 'normal', 'low'])
  priority: 'urgent' | 'normal' | 'low';

  @ApiProperty({ description: '生成时间' })
  @IsDateString()
  generatedAt: string;

  @ApiProperty({ description: '有效期至' })
  @IsDateString()
  validUntil: string;
}

/**
 * 产品推荐DTO
 */
export class ProductRecommendationDto {
  @ApiPropertyOptional({ description: '产品ID' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '分类' })
  @IsString()
  category: string;

  @ApiProperty({ description: '预估成本' })
  @IsNumber()
  estimatedCost: number;

  @ApiProperty({ description: '预估售价' })
  @IsNumber()
  estimatedPrice: number;

  @ApiProperty({ description: '利润率' })
  @IsNumber()
  profitMargin: number;

  @ApiProperty({ description: '需求评分' })
  @IsNumber()
  @Min(0)
  @Max(100)
  demandScore: number;

  @ApiProperty({ description: '竞争程度' })
  @IsEnum(['low', 'medium', 'high'])
  competitionLevel: 'low' | 'medium' | 'high';

  @ApiProperty({ description: '季节因素' })
  @IsNumber()
  seasonalFactor: number;

  @ApiProperty({ description: '位置评分' })
  @IsNumber()
  locationScore: number;

  @ApiProperty({ description: '推荐原因' })
  @IsString()
  reason: string;
}

/**
 * 趋势预测DTO
 */
export class TrendPredictionDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '当前销量' })
  @IsNumber()
  currentSales: number;

  @ApiProperty({ description: '预测销量' })
  @IsNumber()
  predictedSales: number;

  @ApiProperty({ description: '增长率' })
  @IsNumber()
  growthRate: number;

  @ApiProperty({ description: '趋势' })
  @IsEnum(['rising', 'falling', 'stable'])
  trend: 'rising' | 'falling' | 'stable';

  @ApiProperty({ description: '置信度' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({ description: '影响因素' })
  @IsArray()
  @IsString({ each: true })
  factors: string[];

  @ApiProperty({ description: '建议' })
  @IsString()
  recommendation: string;
}

/**
 * 每日指标DTO
 */
export class DailyMetricsDto {
  @ApiProperty({ description: '营收' })
  @IsNumber()
  revenue: number;

  @ApiProperty({ description: '利润' })
  @IsNumber()
  profit: number;

  @ApiProperty({ description: '订单数' })
  @IsNumber()
  orders: number;

  @ApiProperty({ description: '平均订单金额' })
  @IsNumber()
  avgOrderValue: number;

  @ApiProperty({ description: '畅销产品' })
  @IsArray()
  topProducts: { productId: string; productName: string; quantity: number; revenue: number; profit: number }[];

  @ApiPropertyOptional({ description: '顾客数' })
  @IsNumber()
  @IsOptional()
  customerCount?: number;

  @ApiPropertyOptional({ description: '高峰时段' })
  @IsArray()
  @IsNumber({ each: true })
  @IsOptional()
  peakHours?: number[];
}

/**
 * 亮点DTO
 */
export class HighlightDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '指标值' })
  @IsNumber()
  @IsOptional()
  metric?: number;

  @ApiPropertyOptional({ description: '对比信息' })
  @IsString()
  @IsOptional()
  comparison?: string;
}

/**
 * 问题DTO
 */
export class IssueDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '严重程度' })
  @IsEnum(['critical', 'warning', 'info'])
  severity: 'critical' | 'warning' | 'info';

  @ApiProperty({ description: '建议' })
  @IsString()
  suggestion: string;
}

/**
 * 预测DTO
 */
export class PredictionDto {
  @ApiProperty({ description: '预测类型' })
  @IsEnum(['sales', 'weather', 'event', 'demand'])
  type: 'sales' | 'weather' | 'event' | 'demand';

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '预测内容' })
  @IsString()
  prediction: string;

  @ApiProperty({ description: '置信度' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;
}

/**
 * 行动DTO
 */
export class ActionDto {
  @ApiProperty({ description: '优先级' })
  @IsEnum(['high', 'medium', 'low'])
  priority: 'high' | 'medium' | 'low';

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '截止时间' })
  @IsString()
  @IsOptional()
  deadline?: string;
}

/**
 * 明日计划DTO
 */
export class TomorrowPlanDto {
  @ApiProperty({ description: '推荐产品' })
  @IsArray()
  @IsString({ each: true })
  recommendedProducts: string[];

  @ApiProperty({ description: '定价策略' })
  @IsString()
  pricingStrategy: string;

  @ApiProperty({ description: '需要补货的产品' })
  @IsArray()
  @IsString({ each: true })
  restockItems: string[];

  @ApiProperty({ description: '特别说明' })
  @IsArray()
  @IsString({ each: true })
  specialNotes: string[];
}

/**
 * 日报DTO
 */
export class DailyReportDto {
  @ApiProperty({ description: '日期' })
  @IsString()
  date: string;

  @ApiProperty({ description: '一句话总结' })
  @IsString()
  summary: string;

  @ApiProperty({ description: '每日指标' })
  @ValidateNested()
  @Type(() => DailyMetricsDto)
  metrics: DailyMetricsDto;

  @ApiProperty({ description: '亮点' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HighlightDto)
  highlights: HighlightDto[];

  @ApiProperty({ description: '问题' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueDto)
  issues: IssueDto[];

  @ApiProperty({ description: '预测' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PredictionDto)
  predictions: PredictionDto[];

  @ApiProperty({ description: '行动建议' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];

  @ApiProperty({ description: '明日计划' })
  @ValidateNested()
  @Type(() => TomorrowPlanDto)
  tomorrowPlan: TomorrowPlanDto;

  @ApiProperty({ description: '生成时间' })
  @IsDateString()
  generatedAt: string;
}

/**
 * AI总结响应DTO
 */
export class AISummaryResponseDto {
  @ApiProperty({ description: '一句话总结' })
  @IsString()
  summary: string;

  @ApiProperty({ description: '综合评分' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: '关键洞察' })
  @IsArray()
  @IsString({ each: true })
  keyInsights: string[];

  @ApiProperty({ description: '首要建议' })
  @IsString()
  topRecommendation: string;
}

/**
 * 经营评分响应DTO
 */
export class BusinessScoreResponseDto {
  @ApiProperty({ description: '综合评分' })
  @IsNumber()
  overall: number;

  @ApiProperty({ description: '营收评分' })
  @IsNumber()
  revenue: number;

  @ApiProperty({ description: '利润评分' })
  @IsNumber()
  profit: number;

  @ApiProperty({ description: '效率评分' })
  @IsNumber()
  efficiency: number;

  @ApiProperty({ description: '增长评分' })
  @IsNumber()
  growth: number;

  @ApiProperty({ description: '趋势' })
  @IsEnum(['up', 'down', 'stable'])
  trend: 'up' | 'down' | 'stable';

  @ApiProperty({ description: '对比说明' })
  @IsString()
  comparison: string;
}

/**
 * 分析结果响应DTO
 */
export class AnalysisResultResponseDto {
  @ApiProperty({ description: '综合评分' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: '洞察列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsightDto)
  insights: InsightDto[];

  @ApiProperty({ description: '异常列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnomalyDto)
  anomalies: AnomalyDto[];

  @ApiProperty({ description: '推荐列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationDto)
  recommendations: RecommendationDto[];

  @ApiProperty({ description: '元数据' })
  @IsObject()
  metadata: Record<string, any>;
}

/**
 * 聊天响应DTO
 */
export class ChatResponseDto {
  @ApiProperty({ description: '回复消息' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '建议' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  suggestions?: string[];

  @ApiPropertyOptional({ description: '操作' })
  @IsArray()
  @IsOptional()
  actions?: { type: string; description: string; data?: any }[];
}

/**
 * Agent状态DTO
 */
export class AgentStatusDto {
  @ApiProperty({ description: '分析Agent状态' })
  @IsNumber()
  analysisAgent: boolean;

  @ApiProperty({ description: '选品Agent状态' })
  @IsNumber()
  selectionAgent: boolean;

  @ApiProperty({ description: '库存Agent状态' })
  @IsNumber()
  inventoryAgent: boolean;

  @ApiProperty({ description: '补货Agent状态' })
  @IsNumber()
  restockAgent: boolean;

  @ApiProperty({ description: '趋势Agent状态' })
  @IsNumber()
  trendAgent: boolean;

  @ApiProperty({ description: '日报Agent状态' })
  @IsNumber()
  dailyReportAgent: boolean;
}
