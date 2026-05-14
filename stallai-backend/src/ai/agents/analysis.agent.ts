/**
 * AI经营分析Agent
 * 摆摊AI经营OS - 核心分析Agent
 * 
 * 功能:
 * - 实时数据分析
 * - 利润率计算
 * - 趋势检测
 * - 异常检测
 * - 性能评分 (0-100)
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, IAgentRequest, IAgentResult, IAgentExecutionOptions } from './base.agent';
import { LLMService } from '../utils/llm.service';
import { RedisService } from '../../cache/redis.service';
import {
  IAnalysisResult,
  IAgentContext,
  IInsight,
  ITrend,
  IRecommendation,
  IAnomaly,
  IDailyStats,
  IOrder,
  IProduct,
} from '../interfaces/agent.interface';

/**
 * 分析数据输入
 */
export interface IAnalysisInput {
  orders?: IOrder[];
  products?: IProduct[];
  dailyStats?: IDailyStats[];
  period?: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}

/**
 * 分析请求
 */
export interface IAnalysisRequest {
  userId: string;
  data: IAnalysisInput;
  options?: {
    includeTrends?: boolean;
    includeAnomalies?: boolean;
    includeRecommendations?: boolean;
  };
}

/**
 * 性能评分结果
 */
export interface IPerformanceScore {
  overall: number;
  revenue: number;
  profit: number;
  efficiency: number;
  growth: number;
  details: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

/**
 * 分析Agent
 */
@Injectable()
export class AnalysisAgent extends BaseAgent {
  protected readonly name = 'AnalysisAgent';
  protected readonly description = 'AI经营分析Agent - 分析业务运营数据，提供洞察和建议';
  
  protected readonly systemPrompt = `
# 角色
你是一位专业的摆摊经营分析师，拥有丰富的零售业数据分析经验。

# 背景
你正在帮助一个摆摊商贩分析其经营数据，包括订单、产品销售、库存等信息。

# 能力
1. 销售数据分析：识别畅销/滞销产品，分析销售趋势
2. 利润率分析：计算各项产品的利润率，找出高利润产品
3. 异常检测：发现异常销售模式、库存问题等
4. 趋势预测：基于历史数据预测未来趋势
5. 建议生成：基于分析结果给出具体可执行的建议

# 约束
1. 分析必须基于实际数据，不能凭空臆测
2. 建议必须具体、可执行、有数据支撑
3. 评分必须客观公正，0-100分制
4. 异常检测需要明确标注严重程度
5. 回复必须使用中文

# 输出格式
请返回JSON格式的分析结果，包含：
- score: 综合评分 (0-100)
- insights: 关键洞察数组
- trends: 趋势分析数组
- recommendations: 推荐建议数组
- anomalies: 异常检测数组
`;

  constructor(
    llmService: LLMService,
    redisService: RedisService,
    configService: ConfigService,
  ) {
    super(llmService, redisService, configService);
  }

  /**
   * 执行分析
   */
  async analyze(request: IAnalysisRequest): Promise<IAgentResult<IAnalysisResult>> {
    const { userId, data, options } = request;
    
    const agentRequest: IAgentRequest = {
      task: '对提供的经营数据进行全面分析',
      data: {
        ...data,
        analysisOptions: options,
      },
      context: {
        userId,
      },
      options: {
        context: { userId },
        useCache: true,
        cacheTTL: 1800, // 30分钟缓存
        temperature: 0.3,
      },
    };

    return this.execute(agentRequest) as Promise<IAgentResult<IAnalysisResult>>;
  }

  /**
   * 获取性能评分
   */
  async getPerformanceScore(
    userId: string,
    data: IAnalysisInput,
  ): Promise<IAgentResult<IPerformanceScore>> {
    const { orders = [], dailyStats = [] } = data;

    // 计算基础指标
    const metrics = this.calculateMetrics(orders, dailyStats);
    
    // 使用LLM进行综合评分
    const scorePrompt = `
# 任务
根据以下经营数据，计算综合性能评分(0-100分制)

## 经营指标
${JSON.stringify(metrics, null, 2)}

## 评分标准
- 营收得分 (25分): 基于日均营收、周转率
- 利润得分 (25分): 基于利润率、毛利率
- 效率得分 (25分): 基于客单价、转化率
- 增长得分 (25分): 基于同比/环比增长率

请按以下JSON格式返回评分结果:
{
  "overall": 75,
  "revenue": 80,
  "profit": 70,
  "efficiency": 75,
  "growth": 75,
  "details": {
    "strengths": ["优势1", "优势2"],
    "weaknesses": ["劣势1", "劣势2"],
    "suggestions": ["改进建议1", "改进建议2"]
  }
}
`;

    try {
      const result = await this.llmService.chat({
        messages: [
          { role: 'system', content: '你是一个专业的经营分析师。' },
          { role: 'user', content: scorePrompt },
        ],
        temperature: 0.3,
        maxTokens: 1500,
      });

      const scoreData = JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || '{}');
      
      return {
        success: true,
        data: scoreData as IPerformanceScore,
        executionTime: result.usage ? 0 : Date.now(),
        tokensUsed: result.usage,
      };
    } catch (error) {
      this.logger.error('Failed to calculate performance score:', error);
      return {
        success: false,
        error: 'Failed to calculate performance score',
        executionTime: 0,
      };
    }
  }

  /**
   * 计算基础指标
   */
  private calculateMetrics(orders: IOrder[], dailyStats: IDailyStats[]): Record<string, any> {
    if (orders.length === 0 && dailyStats.length === 0) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        avgProfitMargin: 0,
        topProducts: [],
        dailyBreakdown: [],
      };
    }

    // 从订单计算
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // 产品统计
    const productSales: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
    orders.forEach(order => {
      if (!productSales[order.productId]) {
        productSales[order.productId] = {
          name: order.productName,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productSales[order.productId].quantity += order.quantity;
      productSales[order.productId].revenue += order.totalAmount;
      productSales[order.productId].profit += order.profit;
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id, data]) => ({
        productId: id,
        ...data,
      }));

    // 从dailyStats计算趋势
    const dailyBreakdown = dailyStats.map(stat => ({
      date: stat.date,
      revenue: stat.totalRevenue,
      profit: stat.totalProfit,
      orders: stat.totalOrders,
      avgOrderValue: stat.avgOrderValue,
    }));

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      avgOrderValue,
      avgProfitMargin,
      topProducts,
      dailyBreakdown,
      periodDays: dailyStats.length || 1,
    };
  }

  /**
   * 检测销售异常
   */
  async detectAnomalies(
    userId: string,
    orders: IOrder[],
    dailyStats: IDailyStats[],
  ): Promise<IAnomaly[]> {
    const anomalies: IAnomaly[] = [];

    // 计算统计值
    const revenues = dailyStats.map(s => s.totalRevenue);
    const profits = dailyStats.map(s => s.totalProfit);
    const orderCounts = dailyStats.map(s => s.totalOrders);

    if (revenues.length < 2) return anomalies;

    // 计算均值和标准差
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    const stdDev = Math.sqrt(
      revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length,
    );

    // 检测营收异常
    dailyStats.forEach((stat, index) => {
      const deviation = Math.abs(stat.totalRevenue - avgRevenue);
      const zScore = stdDev > 0 ? deviation / stdDev : 0;

      if (zScore > 2) {
        anomalies.push({
          type: 'sales',
          severity: zScore > 3 ? 'critical' : 'warning',
          title: `营收${stat.totalRevenue > avgRevenue ? '异常高' : '异常低'}`,
          description: `第${index + 1}天营收${stat.totalRevenue}元，与平均${avgRevenue.toFixed(2)}元偏差${(zScore * 100).toFixed(0)}%`,
          metric: 'dailyRevenue',
          actualValue: stat.totalRevenue,
          expectedValue: avgRevenue,
          deviation: zScore,
        });
      }
    });

    // 检测利润率为负的产品
    const productProfits: Record<string, { name: string; profit: number; revenue: number }> = {};
    orders.forEach(order => {
      if (!productProfits[order.productId]) {
        productProfits[order.productId] = { name: order.productName, profit: 0, revenue: 0 };
      }
      productProfits[order.productId].profit += order.profit;
      productProfits[order.productId].revenue += order.totalAmount;
    });

    Object.entries(productProfits).forEach(([id, data]) => {
      if (data.profit < 0) {
        anomalies.push({
          type: 'profit',
          severity: 'critical',
          title: '产品亏损',
          description: `${data.name}累计亏损${Math.abs(data.profit).toFixed(2)}元`,
          metric: 'productProfit',
          actualValue: data.profit,
          expectedValue: 0,
          deviation: 1,
        });
      }
    });

    return anomalies;
  }

  /**
   * 分析趋势
   */
  async analyzeTrends(
    dailyStats: IDailyStats[],
  ): Promise<ITrend[]> {
    const trends: ITrend[] = [];

    if (dailyStats.length < 3) return trends;

    // 营收趋势
    const revenues = dailyStats.map(s => s.totalRevenue);
    const revenueTrend = this.calculateTrend(revenues, 'dailyRevenue');
    if (revenueTrend) trends.push(revenueTrend);

    // 利润趋势
    const profits = dailyStats.map(s => s.totalProfit);
    const profitTrend = this.calculateTrend(profits, 'dailyProfit');
    if (profitTrend) trends.push(profitTrend);

    // 订单量趋势
    const orders = dailyStats.map(s => s.totalOrders);
    const orderTrend = this.calculateTrend(orders, 'orderCount');
    if (orderTrend) trends.push(orderTrend);

    return trends;
  }

  /**
   * 计算趋势
   */
  private calculateTrend(
    values: number[],
    metric: string,
  ): ITrend | null {
    if (values.length < 2) return null;

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const changeRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    const direction = changeRate > 5 ? 'up' : changeRate < -5 ? 'down' : 'stable';

    // 简单线性回归计算置信度
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
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + (avgY - slope * sumX / n);
      ssRes += Math.pow(values[i] - predicted, 2);
      ssTot += Math.pow(values[i] - avgY, 2);
    }
    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return {
      direction,
      metric,
      changeRate,
      confidence: Math.max(0, Math.min(1, rSquared)),
      forecast: this.generateForecast(values, 3),
    };
  }

  /**
   * 生成预测
   */
  private generateForecast(values: number[], days: number): { date: string; predicted: number; confidence: number }[] {
    const forecast: { date: string; predicted: number; confidence: number }[] = [];
    const n = values.length;
    
    // 简单移动平均预测
    const recentAvg = values.slice(-Math.min(7, n)).reduce((a, b) => a + b, 0) / Math.min(7, n);
    
    // 计算趋势
    let trend = 0;
    if (n >= 2) {
      trend = (values[n - 1] - values[0]) / n;
    }

    const today = new Date();
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.max(0, recentAvg + trend * i),
        confidence: Math.max(0.5, 1 - i * 0.1),
      });
    }

    return forecast;
  }

  /**
   * 生成洞察
   */
  async generateInsights(
    orders: IOrder[],
    dailyStats: IDailyStats[],
  ): Promise<IInsight[]> {
    const insights: IInsight[] = [];

    if (orders.length === 0) {
      insights.push({
        type: 'neutral',
        title: '暂无数据',
        description: '当前时间段内没有订单数据',
        impact: 'low',
        evidence: [],
      });
      return insights;
    }

    // 使用LLM生成洞察
    const metrics = this.calculateMetrics(orders, dailyStats);
    
    const insightPrompt = `
# 任务
基于以下经营数据，生成关键洞察

## 数据
${JSON.stringify(metrics, null, 2)}

## 洞察类型
1. positive: 正面发现，如增长趋势、爆款产品等
2. negative: 负面发现，如亏损产品、下降趋势等
3. neutral: 中性发现，如季节性规律等

请返回3-5个关键洞察，JSON格式:
[
  {
    "type": "positive",
    "title": "洞察标题",
    "description": "详细描述",
    "impact": "high/medium/low",
    "evidence": ["证据1", "证据2"]
  }
]
`;

    try {
      const result = await this.llmService.chat({
        messages: [
          { role: 'system', content: '你是一个专业的商业分析师。' },
          { role: 'user', content: insightPrompt },
        ],
        temperature: 0.5,
        maxTokens: 1500,
      });

      const parsedInsights = JSON.parse(result.content.match(/\[[\s\S]*\]/)?.[0] || '[]');
      insights.push(...parsedInsights);
    } catch (error) {
      this.logger.warn('Failed to generate insights via LLM, using defaults');
      // 回退到基础洞察
      insights.push({
        type: 'neutral',
        title: '数据已收集',
        description: `共分析${orders.length}笔订单，涉及${metrics.topProducts?.length || 0}种产品`,
        impact: 'medium',
        evidence: [`总营收: ${metrics.totalRevenue}`, `总利润: ${metrics.totalProfit}`],
      });
    }

    return insights;
  }

  /**
   * 生成推荐
   */
  async generateRecommendations(
    insights: IInsight[],
    anomalies: IAnomaly[],
    trends: ITrend[],
  ): Promise<IRecommendation[]> {
    const recommendations: IRecommendation[] = [];

    // 基于异常生成紧急推荐
    anomalies
      .filter(a => a.severity === 'critical')
      .forEach(anomaly => {
        recommendations.push({
          type: anomaly.type === 'profit' ? 'pricing' : 'inventory',
          priority: 'high',
          title: `紧急处理: ${anomaly.title}`,
          description: anomaly.description,
          action: `立即检查${anomaly.metric}相关数据`,
          expectedImpact: Math.abs(anomaly.actualValue - anomaly.expectedValue),
          reason: '异常检测触发',
        });
      });

    // 基于趋势生成增长推荐
    trends
      .filter(t => t.direction === 'up')
      .forEach(trend => {
        recommendations.push({
          type: 'product',
          priority: 'medium',
          title: `把握增长趋势`,
          description: `${trend.metric}呈现上升趋势，增长率${trend.changeRate.toFixed(1)}%`,
          action: '增加相关产品备货',
          expectedImpact: trend.changeRate,
          reason: '上升趋势确认',
        });
      });

    // 基于洞察生成优化推荐
    insights
      .filter(i => i.type === 'negative')
      .forEach(insight => {
        recommendations.push({
          type: 'promotion',
          priority: 'medium',
          title: `优化建议: ${insight.title}`,
          description: insight.description,
          action: '调整营销策略',
          reason: '负面洞察需要改进',
        });
      });

    return recommendations;
  }

  protected async executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<IAnalysisResult> {
    const analysisInput = data as IAnalysisInput;
    const { orders = [], dailyStats = [], products = [] } = analysisInput;

    // 1. 计算性能评分
    const metrics = this.calculateMetrics(orders, dailyStats);
    const score = Math.min(100, Math.max(0, 
      (metrics.totalRevenue > 0 ? 50 : 0) +
      (metrics.avgProfitMargin > 0 ? 30 : 0) +
      (metrics.totalOrders > 0 ? 20 : 0)
    ));

    // 2. 生成洞察
    const insights = await this.generateInsights(orders, dailyStats);

    // 3. 分析趋势
    const trends = await this.analyzeTrends(dailyStats);

    // 4. 检测异常
    const anomalies = await this.detectAnomalies(
      context?.userId || '',
      orders,
      dailyStats,
    );

    // 5. 生成推荐
    const recommendations = await this.generateRecommendations(insights, anomalies, trends);

    return {
      score,
      insights,
      trends,
      recommendations,
      anomalies,
      metadata: {
        analyzedOrders: orders.length,
        analyzedDays: dailyStats.length,
        analyzedProducts: products.length,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
