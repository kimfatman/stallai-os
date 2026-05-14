/**
 * AI趋势Agent
 * 摆摊AI经营OS - 趋势预测与爆款识别
 * 
 * 功能:
 * - 销售速度分析
 * - 增长率计算
 * - 趋势模式识别
 * - 爆款检测
 * - 市场情绪分析
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, IAgentRequest, IAgentResult, IAgentExecutionOptions } from './base.agent';
import { LLMService } from '../utils/llm.service';
import { RedisService } from '../../cache/redis.service';
import {
  ITrendPrediction,
  IAgentContext,
  IDailyStats,
  IProduct,
} from '../interfaces/agent.interface';

/**
 * 趋势输入
 */
export interface ITrendInput {
  products?: IProduct[];
  dailyStats?: IDailyStats[];
  historicalSales?: {
    productId: string;
    productName: string;
    salesData: {
      date: string;
      quantity: number;
      revenue: number;
    }[];
  }[];
  period?: 'week' | 'month' | 'quarter';
  category?: string;
}

/**
 * 趋势信号
 */
export interface ITrendSignal {
  type: 'rising' | 'falling' | 'stable' | 'viral';
  strength: number; // 0-100
  confidence: number; // 0-1
  startDate?: string;
  peakDate?: string;
  factors: string[];
}

/**
 * 爆款预警
 */
export interface IBestsellerAlert {
  productId: string;
  productName: string;
  category: string;
  salesVelocity: number; // 销量速度（件/天）
  growthRate: number; // 增长率
  trendSignal: ITrendSignal;
  recommendation: string;
  confidence: number;
  reason: string;
}

/**
 * 市场热点
 */
export interface IMarketTrend {
  topic: string;
  category: string;
  popularity: number; // 0-100
  duration: 'short' | 'medium' | 'long';
  relatedProducts: string[];
  opportunity: string;
}

/**
 * 趋势Agent
 */
@Injectable()
export class TrendAgent extends BaseAgent {
  protected readonly name = 'TrendAgent';
  protected readonly description = 'AI趋势Agent - 预测趋势，发现潜在爆款';
  
  protected readonly systemPrompt = `
# 角色
你是一位专业的摆摊趋势分析师，精通零售业趋势预测。

# 背景
你正在帮助摆摊商贩预测市场趋势，发现潜在爆款产品。

# 能力
1. 销售速度分析：分析产品销售速度变化
2. 增长率计算：计算产品增长率和趋势
3. 趋势模式识别：识别上升、下降、稳定等趋势
4. 爆款检测：发现即将成为爆款的产品
5. 市场热点追踪：追踪当前市场热点和流行趋势

# 约束
1. 趋势预测必须基于数据，不能凭空臆测
2. 爆款预测需要明确置信度
3. 建议必须具体可执行
4. 回复必须使用中文

# 输出格式
请返回JSON格式的趋势预测:
[
  {
    "productId": "...",
    "productName": "...",
    "currentSales": 0,
    "predictedSales": 0,
    "growthRate": 0,
    "trend": "rising/falling/stable",
    "confidence": 0.8,
    "factors": ["因素1", "因素2"],
    "recommendation": "建议内容"
  }
]
`;

  // 当前市场热点（可从外部API获取）
  private readonly marketTrends: IMarketTrend[] = [
    { topic: '淄博烧烤', category: '餐饮', popularity: 95, duration: 'long', relatedProducts: ['烤串', '小饼', '蘸料'], opportunity: '可复制到当地' },
    { topic: '后备箱集市', category: '零售', popularity: 88, duration: 'medium', relatedProducts: ['网红零食', '小饰品', '咖啡'], opportunity: '适合年轻人聚集地' },
    { topic: '露营经济', category: '户外', popularity: 85, duration: 'long', relatedProducts: ['便携食品', '户外用品', '氛围灯'], opportunity: '景区附近机会大' },
    { topic: '解压玩具', category: '玩具', popularity: 82, duration: 'short', relatedProducts: ['捏捏乐', '史莱姆', '指尖陀螺'], opportunity: '快进快出' },
    { topic: '国风文创', category: '文创', popularity: 80, duration: 'long', relatedProducts: ['古风饰品', '书法周边', '汉服配饰'], opportunity: '高利润空间' },
    { topic: '健康轻食', category: '餐饮', popularity: 78, duration: 'medium', relatedProducts: ['水果杯', '沙拉', '鲜榨果汁'], opportunity: '写字楼附近热销' },
  ];

  // 季节性因素
  private readonly seasonalFactors: Record<string, Record<string, number>> = {
    spring: { '冰品': 0.3, '热饮': 0.5, '春装': 1.5, '踏青用品': 1.8 },
    summer: { '冰品': 2.0, '防晒': 1.8, '冷饮': 1.9, '热饮': 0.3, '关东煮': 0.4 },
    autumn: { '热饮': 1.5, '暖宝宝': 1.4, '秋装': 1.3, '火锅料': 1.2 },
    winter: { '热饮': 2.0, '热食': 1.8, '保暖用品': 1.7, '冰品': 0.2, '冰淇淋': 0.3 },
  };

  constructor(
    llmService: LLMService,
    redisService: RedisService,
    configService: ConfigService,
  ) {
    super(llmService, redisService, configService);
  }

  /**
   * 预测爆款
   */
  async predictBestsellers(request: {
    userId: string;
    data: ITrendInput;
    limit?: number;
  }): Promise<IAgentResult<ITrendPrediction[]>> {
    const { userId, data, limit = 5 } = request;
    
    const agentRequest: IAgentRequest = {
      task: '根据历史销售数据和市场趋势，预测可能成为爆款的产品',
      data,
      context: { userId },
      options: {
        context: { userId },
        useCache: true,
        cacheTTL: 7200, // 2小时缓存
        temperature: 0.4,
      },
    };

    const result = await this.execute(agentRequest);
    
    if (result.success && Array.isArray(result.data?.result)) {
      return {
        ...result,
        data: (result.data.result as ITrendPrediction[]).slice(0, limit),
      };
    }

    return result as IAgentResult<ITrendPrediction[]>;
  }

  /**
   * 快速预测（不使用LLM）
   */
  async quickPredictBestsellers(input: ITrendInput, limit: number = 5): Promise<ITrendPrediction[]> {
    const predictions: ITrendPrediction[] = [];
    const { historicalSales = [], products = [] } = input;

    for (const sales of historicalSales) {
      // 计算当前销量
      const currentSales = this.getRecentAverage(sales.salesData, 3);
      
      // 计算历史平均
      const historicalAvg = sales.salesData.length > 0
        ? sales.salesData.reduce((sum, s) => sum + s.quantity, 0) / sales.salesData.length
        : 0;

      // 计算增长率
      const growthRate = historicalAvg > 0
        ? ((currentSales - historicalAvg) / historicalAvg) * 100
        : 0;

      // 确定趋势
      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (growthRate > 20) trend = 'rising';
      else if (growthRate < -20) trend = 'falling';

      // 计算置信度
      const confidence = this.calculateConfidence(sales.salesData);

      // 生成预测
      const predictedSales = currentSales * (1 + growthRate / 100 * 0.5); // 保守预测

      predictions.push({
        productId: sales.productId,
        productName: sales.productName,
        currentSales,
        predictedSales: Math.round(predictedSales),
        growthRate: Math.round(growthRate * 10) / 10,
        trend,
        confidence,
        factors: this.identifyTrendFactors(sales.salesData),
        recommendation: this.generateTrendRecommendation(trend, growthRate),
      });
    }

    // 按增长率排序
    return predictions
      .filter(p => p.trend === 'rising')
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, limit);
  }

  /**
   * 检测爆款
   */
  async detectBestsellers(request: {
    userId: string;
    data: ITrendInput;
  }): Promise<IBestsellerAlert[]> {
    const predictions = await this.predictBestsellers({
      userId: request.userId,
      data: request.data,
      limit: 10,
    });

    if (!predictions.success || !predictions.data) {
      return [];
    }

    const alerts: IBestsellerAlert[] = [];

    for (const pred of predictions.data) {
      // 判断是否为爆款潜力股
      const isPotentialBestseller = 
        pred.trend === 'rising' && 
        pred.growthRate > 30 && 
        pred.confidence > 0.6;

      if (isPotentialBestseller) {
        alerts.push({
          productId: pred.productId,
          productName: pred.productName,
          category: 'general',
          salesVelocity: pred.currentSales,
          growthRate: pred.growthRate,
          trendSignal: {
            type: 'rising',
            strength: Math.min(100, pred.growthRate),
            confidence: pred.confidence,
            factors: pred.factors,
          },
          recommendation: pred.recommendation,
          confidence: pred.confidence,
          reason: `销量增长率达到${pred.growthRate.toFixed(1)}%，趋势明显`,
        });
      }
    }

    return alerts.sort((a, b) => b.growthRate - a.growthRate);
  }

  /**
   * 获取市场热点
   */
  async getMarketTrends(location?: string): Promise<IMarketTrend[]> {
    // 简单返回当前热点，实际应接入外部API
    return this.marketTrends.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * 分析趋势信号
   */
  analyzeTrendSignal(salesData: { date: string; quantity: number }[]): ITrendSignal {
    if (salesData.length < 3) {
      return {
        type: 'stable',
        strength: 50,
        confidence: 0.3,
        factors: ['数据不足'],
      };
    }

    const quantities = salesData.map(s => s.quantity);
    
    // 计算趋势线斜率
    const n = quantities.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += quantities[i];
      sumXY += i * quantities[i];
      sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;

    // 计算R²
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + (avgY - slope * sumX / n);
      ssRes += Math.pow(quantities[i] - predicted, 2);
      ssTot += Math.pow(quantities[i] - avgY, 2);
    }
    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    // 确定趋势类型
    let type: 'rising' | 'falling' | 'stable' | 'viral' = 'stable';
    let strength = Math.abs(slope) / avgY * 100;

    if (strength > 50 && rSquared > 0.8) {
      type = 'viral';
      strength = Math.min(100, strength);
    } else if (slope > 0.1) {
      type = 'rising';
    } else if (slope < -0.1) {
      type = 'falling';
    }

    return {
      type,
      strength: Math.min(100, Math.round(strength)),
      confidence: Math.max(0, Math.min(1, rSquared)),
      factors: this.identifyTrendFactors(salesData),
    };
  }

  /**
   * 识别趋势因素
   */
  private identifyTrendFactors(salesData: { date: string; quantity: number }[]): string[] {
    const factors: string[] = [];
    const quantities = salesData.map(s => s.quantity);

    if (quantities.length < 3) {
      factors.push('数据量不足');
      return factors;
    }

    // 检测周末效应
    const weekendSales = quantities.slice(-2);
    const weekdaySales = quantities.slice(-7, -2);
    const weekdayAvg = weekdaySales.reduce((a, b) => a + b, 0) / weekdaySales.length;
    
    if (weekendSales[0] > weekdayAvg * 1.3) {
      factors.push('周末销量明显增加');
    }

    // 检测增长趋势
    const recentTrend = this.calculateTrend(quantities.slice(-7));
    if (recentTrend > 0.1) {
      factors.push('近期呈上升趋势');
    } else if (recentTrend < -0.1) {
      factors.push('近期呈下降趋势');
    }

    // 检测稳定性
    const variance = this.calculateVariance(quantities);
    if (variance < 0.2) {
      factors.push('销量稳定');
    } else if (variance > 0.5) {
      factors.push('销量波动较大');
    }

    return factors.length > 0 ? factors : ['趋势不明显'];
  }

  /**
   * 生成趋势建议
   */
  private generateTrendRecommendation(trend: string, growthRate: number): string {
    if (trend === 'rising' && growthRate > 50) {
      return '爆款趋势明显，建议立即增加备货，把握市场机会';
    } else if (trend === 'rising' && growthRate > 20) {
      return '上升趋势良好，建议适度增加备货';
    } else if (trend === 'rising') {
      return '有增长迹象，建议观察一周后再做决策';
    } else if (trend === 'falling' && growthRate < -30) {
      return '下降趋势明显，建议减少进货，寻找替代产品';
    } else if (trend === 'falling') {
      return '销量有所下滑，建议减少备货';
    }
    return '销量稳定，维持当前备货策略';
  }

  /**
   * 计算近期平均
   */
  private getRecentAverage(salesData: { date: string; quantity: number }[], days: number): number {
    if (salesData.length === 0) return 0;
    const recent = salesData.slice(-days);
    return recent.reduce((sum, s) => sum + s.quantity, 0) / recent.length;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(salesData: { date: string; quantity: number }[]): number {
    if (salesData.length < 3) return 0.3;
    if (salesData.length < 7) return 0.5;
    
    const quantities = salesData.map(s => s.quantity);
    const rSquared = this.calculateRSquared(quantities);
    
    // 数据量加成
    const dataBonus = Math.min(0.2, salesData.length * 0.01);
    
    return Math.min(0.95, Math.max(0.4, rSquared + dataBonus));
  }

  /**
   * 计算R²
   */
  private calculateRSquared(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;

    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + (avgY - slope * sumX / n);
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - avgY, 2);
    }

    return ssTot > 0 ? 1 - ssRes / ssTot : 0;
  }

  /**
   * 计算趋势斜率
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const n = values.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;

    return avgY !== 0 ? slope / avgY : 0;
  }

  /**
   * 计算方差
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * 获取季节性调整系数
   */
  getSeasonalFactor(category: string, season: string): number {
    const seasonFactors = this.seasonalFactors[season] || {};
    return seasonFactors[category] || 1.0;
  }

  protected async executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<ITrendPrediction[]> {
    const input = data as ITrendInput;
    
    // 使用快速预测算法
    return this.quickPredictBestsellers(input, 10);
  }
}
