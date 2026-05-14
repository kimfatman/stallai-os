/**
 * AI日报Agent
 * 摆摊AI经营OS - 智能日报生成
 * 
 * 功能:
 * - 每日总结生成
 * - 关键指标分析
 * - 明日预测
 * - 可执行建议
 * - 可视化报告
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, IAgentRequest, IAgentResult, IAgentExecutionOptions } from './base.agent';
import { LLMService } from '../utils/llm.service';
import { RedisService } from '../../cache/redis.service';
import {
  IDailyReport,
  IDailyMetrics,
  IHighlight,
  IIssue,
  IPrediction,
  IAction,
  ITomorrowPlan,
  IAgentContext,
  IDailyStats,
  IOrder,
  IInventoryItem,
} from '../interfaces/agent.interface';

/**
 * 日报输入
 */
export interface IDailyReportInput {
  date: string;
  orders: IOrder[];
  inventory: IInventoryItem[];
  dailyStats?: IDailyStats;
  previousStats?: IDailyStats[];
  weather?: string;
  events?: string[];
  userNotes?: string;
}

/**
 * 简报格式
 */
export interface IBriefReport {
  summary: string;
  keyMetrics: {
    revenue: number;
    profit: number;
    orders: number;
    comparedToYesterday: number;
  };
  alertCount: number;
  actionItems: string[];
}

/**
 * 日报Agent
 */
@Injectable()
export class DailyReportAgent extends BaseAgent {
  protected readonly name = 'DailyReportAgent';
  protected readonly description = 'AI日报Agent - 生成每日经营报告和明日建议';
  
  protected readonly systemPrompt = `
# 角色
你是一位专业的摆摊经营日报分析师，为商贩提供每日经营总结和建议。

# 背景
你正在帮助摆摊商贩生成每日经营报告，包括总结、分析、预测和建议。

# 能力
1. 每日总结：总结今日经营情况
2. 关键指标分析：分析营收、利润、订单量等核心指标
3. 亮点发现：发现今日经营亮点
4. 问题识别：识别今日存在的问题
5. 明日预测：预测明日销售情况
6. 行动建议：提供可执行的具体建议

# 约束
1. 日报必须简洁明了，一目了然
2. 数据必须准确，与实际相符
3. 建议必须具体可执行
4. 预测必须合理，有数据支撑
5. 回复必须使用中文

# 输出格式
请返回JSON格式的日报:
{
  "date": "2024-01-15",
  "summary": "一句话总结今日经营",
  "metrics": { /* 指标数据 */ },
  "highlights": [ /* 亮点列表 */ ],
  "issues": [ /* 问题列表 */ ],
  "predictions": [ /* 预测列表 */ ],
  "actions": [ /* 行动建议 */ ],
  "tomorrowPlan": { /* 明日计划 */ }
}
`;

  constructor(
    llmService: LLMService,
    redisService: RedisService,
    configService: ConfigService,
  ) {
    super(llmService, redisService, configService);
  }

  /**
   * 生成日报
   */
  async generateReport(request: {
    userId: string;
    data: IDailyReportInput;
  }): Promise<IAgentResult<IDailyReport>> {
    const { userId, data } = request;
    
    const agentRequest: IAgentRequest = {
      task: '根据今日经营数据，生成完整的日报',
      data,
      context: { userId },
      options: {
        context: { userId },
        useCache: false, // 日报不缓存
        temperature: 0.5,
      },
    };

    return this.execute(agentRequest);
  }

  /**
   * 生成简报
   */
  async generateBriefReport(input: IDailyReportInput): Promise<IBriefReport> {
    const metrics = this.calculateMetrics(input.orders, input.dailyStats, input.previousStats);
    
    // 一句话总结
    const summary = this.generateSummary(metrics);
    
    // 计算与昨日对比
    let comparedToYesterday = 0;
    if (input.previousStats && input.previousStats.length > 0) {
      const yesterday = input.previousStats[input.previousStats.length - 1];
      comparedToYesterday = yesterday.totalRevenue > 0
        ? ((metrics.revenue - yesterday.totalRevenue) / yesterday.totalRevenue) * 100
        : 0;
    }

    // 统计预警数
    const alertCount = this.countAlerts(input.inventory);

    // 生成行动项
    const actionItems = this.generateActionItems(metrics, input);

    return {
      summary,
      keyMetrics: {
        revenue: metrics.revenue,
        profit: metrics.profit,
        orders: metrics.orders,
        comparedToYesterday: Math.round(comparedToYesterday * 10) / 10,
      },
      alertCount,
      actionItems,
    };
  }

  /**
   * 计算指标
   */
  private calculateMetrics(
    orders: IOrder[],
    dailyStats?: IDailyStats,
    previousStats?: IDailyStats[],
  ): IDailyMetrics {
    if (!dailyStats && orders.length === 0) {
      return {
        revenue: 0,
        profit: 0,
        orders: 0,
        avgOrderValue: 0,
        topProducts: [],
      };
    }

    if (dailyStats) {
      return {
        revenue: dailyStats.totalRevenue,
        profit: dailyStats.totalProfit,
        orders: dailyStats.totalOrders,
        avgOrderValue: dailyStats.avgOrderValue,
        topProducts: dailyStats.topProducts.map(p => ({
          productId: '',
          productName: p,
          quantity: 0,
          revenue: 0,
          profit: 0,
        })),
      };
    }

    // 从订单计算
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const profit = orders.reduce((sum, o) => sum + o.profit, 0);
    const orderCount = orders.length;

    // 计算畅销产品
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
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
        profit: data.profit,
      }));

    return {
      revenue,
      profit,
      orders: orderCount,
      avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
      topProducts,
    };
  }

  /**
   * 生成一句话总结
   */
  private generateSummary(metrics: IDailyMetrics): string {
    const profitMargin = metrics.revenue > 0 ? (metrics.profit / metrics.revenue) * 100 : 0;
    
    if (metrics.orders === 0) {
      return '今日暂无订单，建议检查产品摆放或调整经营时间';
    }
    
    if (profitMargin < 20) {
      return `今日营收${metrics.revenue}元，利润率偏低(${profitMargin.toFixed(1)}%)，建议优化产品结构`;
    }
    
    if (profitMargin > 50) {
      return `今日表现出色！营收${metrics.revenue}元，利润率达${profitMargin.toFixed(1)}%，继续保持`;
    }
    
    if (metrics.orders > 50) {
      return `今日生意兴隆！完成${metrics.orders}笔订单，营收${metrics.revenue}元`;
    }
    
    return `今日营收${metrics.revenue}元，利润${metrics.profit}元，完成${metrics.orders}笔订单`;
  }

  /**
   * 统计预警数
   */
  private countAlerts(inventory: IInventoryItem[]): number {
    return inventory.filter(item => {
      if (item.currentStock === 0) return true;
      if (item.currentStock <= item.safetyStock) return true;
      if (item.expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilExpiry <= 7) return true;
      }
      return false;
    }).length;
  }

  /**
   * 生成行动项
   */
  private generateActionItems(metrics: IDailyMetrics, input: IDailyReportInput): string[] {
    const actions: string[] = [];

    // 库存检查
    if (input.inventory.some(i => i.currentStock <= i.safetyStock)) {
      actions.push('部分产品库存不足，需要补货');
    }

    // 临期产品
    const expiringItems = input.inventory.filter(i => {
      if (!i.expiryDate) return false;
      const days = Math.ceil(
        (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return days <= 7 && days > 0;
    });
    if (expiringItems.length > 0) {
      actions.push(`${expiringItems.length}个产品即将过期，优先销售`);
    }

    // 天气建议
    if (input.weather) {
      if (input.weather.includes('雨')) {
        actions.push('明日预报有雨，建议准备雨具或调整经营地点');
      } else if (input.weather.includes('晴') && input.weather.includes('高温')) {
        actions.push('高温天气，增加冷饮和防晒产品备货');
      }
    }

    // 节日活动
    if (input.events && input.events.length > 0) {
      actions.push(`明日有${input.events.join('、')}，提前准备应节产品`);
    }

    // 滞销产品
    const slowMoving = input.inventory.filter(i => i.turnoverRate < 0.5);
    if (slowMoving.length > 0) {
      actions.push(`${slowMoving.length}个产品滞销，考虑促销或调整进货`);
    }

    // 确保至少有一项
    if (actions.length === 0) {
      actions.push('继续保持当前经营策略');
    }

    return actions;
  }

  /**
   * 分析亮点
   */
  private async analyzeHighlights(
    metrics: IDailyMetrics,
    previousStats?: IDailyStats[],
  ): Promise<IHighlight[]> {
    const highlights: IHighlight[] = [];

    // 营收亮点
    if (metrics.revenue > 0) {
      highlights.push({
        title: '有营收',
        description: `今日营收${metrics.revenue.toFixed(2)}元`,
        metric: metrics.revenue,
      });
    }

    // 利润率亮点
    const profitMargin = metrics.revenue > 0 ? (metrics.profit / metrics.revenue) * 100 : 0;
    if (profitMargin > 50) {
      highlights.push({
        title: '高利润率',
        description: `利润率${profitMargin.toFixed(1)}%，表现优秀`,
        metric: profitMargin,
      });
    }

    // 订单量亮点
    if (metrics.orders > 30) {
      highlights.push({
        title: '订单繁忙',
        description: `完成${metrics.orders}笔订单`,
        metric: metrics.orders,
      });
    }

    // 畅销产品亮点
    if (metrics.topProducts.length > 0) {
      const topProduct = metrics.topProducts[0];
      highlights.push({
        title: '畅销产品',
        description: `${topProduct.productName}销量最佳，贡献${topProduct.revenue.toFixed(2)}元`,
        metric: topProduct.revenue,
      });
    }

    // 与昨日对比
    if (previousStats && previousStats.length > 0) {
      const yesterday = previousStats[previousStats.length - 1];
      const revenueChange = yesterday.totalRevenue > 0
        ? ((metrics.revenue - yesterday.totalRevenue) / yesterday.totalRevenue) * 100
        : 0;

      if (revenueChange > 20) {
        highlights.push({
          title: '增长显著',
          description: `营收较昨日增长${revenueChange.toFixed(1)}%`,
          comparison: `昨日营收${yesterday.totalRevenue.toFixed(2)}元`,
        });
      }
    }

    return highlights;
  }

  /**
   * 分析问题
   */
  private async analyzeIssues(
    metrics: IDailyMetrics,
    inventory: IInventoryItem[],
  ): Promise<IIssue[]> {
    const issues: IIssue[] = [];

    // 无订单问题
    if (metrics.orders === 0) {
      issues.push({
        title: '无订单',
        description: '今日暂无订单，可能需要调整经营策略',
        severity: 'critical',
        suggestion: '检查产品摆放位置，或考虑调整经营时间',
      });
    }

    // 低利润率问题
    const profitMargin = metrics.revenue > 0 ? (metrics.profit / metrics.revenue) * 100 : 0;
    if (profitMargin > 0 && profitMargin < 20) {
      issues.push({
        title: '利润率偏低',
        description: `当前利润率${profitMargin.toFixed(1)}%，低于平均水平`,
        severity: 'warning',
        suggestion: '考虑调整定价或优化产品结构',
      });
    }

    // 缺货问题
    const outOfStock = inventory.filter(i => i.currentStock === 0);
    if (outOfStock.length > 0) {
      issues.push({
        title: '产品缺货',
        description: `${outOfStock.length}个产品已缺货`,
        severity: 'critical',
        suggestion: '立即补货，避免影响销售',
      });
    }

    // 临期问题
    const expiringItems = inventory.filter(i => {
      if (!i.expiryDate) return false;
      const days = Math.ceil(
        (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return days <= 3;
    });
    if (expiringItems.length > 0) {
      issues.push({
        title: '临期产品',
        description: `${expiringItems.length}个产品即将过期`,
        severity: 'warning',
        suggestion: '优先销售临期产品，或做促销处理',
      });
    }

    // 滞销问题
    const slowMoving = inventory.filter(i => i.turnoverRate < 0.3 && i.currentStock > 0);
    if (slowMoving.length > 0) {
      issues.push({
        title: '产品滞销',
        description: `${slowMoving.length}个产品周转率过低`,
        severity: 'warning',
        suggestion: '考虑降价促销或调整进货策略',
      });
    }

    return issues;
  }

  /**
   * 生成预测
   */
  private async generatePredictions(
    metrics: IDailyMetrics,
    previousStats?: IDailyStats[],
    weather?: string,
    events?: string[],
  ): Promise<IPrediction[]> {
    const predictions: IPrediction[] = [];

    // 销售预测（基于历史数据）
    if (previousStats && previousStats.length >= 3) {
      const recentRevenue = previousStats.slice(-3).reduce((sum, s) => sum + s.totalRevenue, 0) / 3;
      const trend = recentRevenue > 0 ? ((metrics.revenue - recentRevenue) / recentRevenue) * 100 : 0;
      const predictedRevenue = metrics.revenue * (1 + trend / 100);

      predictions.push({
        type: 'sales',
        title: '明日销售预测',
        prediction: `预计营收${Math.round(predictedRevenue)}元左右`,
        confidence: 0.7,
      });
    }

    // 天气影响预测
    if (weather) {
      if (weather.includes('雨')) {
        predictions.push({
          type: 'weather',
          title: '天气影响',
          prediction: '雨天可能影响客流，建议准备雨具或调整经营策略',
          confidence: 0.9,
        });
      } else if (weather.includes('晴') && weather.includes('高温')) {
        predictions.push({
          type: 'weather',
          title: '高温天气',
          prediction: '高温天气可能增加冷饮和防晒产品需求',
          confidence: 0.85,
        });
      }
    }

    // 活动影响预测
    if (events && events.length > 0) {
      predictions.push({
        type: 'event',
        title: '活动影响',
        prediction: `明日有${events.join('、')}，预计客流和销量会增加`,
        confidence: 0.85,
      });
    }

    // 需求预测
    const demandProducts = ['冷饮', '冰品'];
    predictions.push({
      type: 'demand',
      title: '需求预测',
      prediction: `${demandProducts.join('、')}类产品的需求可能增加`,
      confidence: 0.75,
    });

    return predictions;
  }

  /**
   * 生成明日计划
   */
  private async generateTomorrowPlan(
    metrics: IDailyMetrics,
    inventory: IInventoryItem[],
    weather?: string,
    events?: string[],
  ): Promise<ITomorrowPlan> {
    const recommendedProducts: string[] = [];
    const restockItems: string[] = [];
    const specialNotes: string[] = [];

    // 根据今日畅销推荐明日产品
    if (metrics.topProducts.length > 0) {
      recommendedProducts.push(...metrics.topProducts.slice(0, 3).map(p => p.productName));
    }

    // 需要补货的产品
    const lowStockItems = inventory.filter(i => i.currentStock <= i.safetyStock * 1.5);
    if (lowStockItems.length > 0) {
      restockItems.push(...lowStockItems.slice(0, 3).map(i => i.productName));
    }

    // 特殊备注
    if (weather) {
      specialNotes.push(`天气预报：${weather}`);
    }
    if (events && events.length > 0) {
      specialNotes.push(`明日活动：${events.join('、')}`);
    }

    // 定价策略
    let pricingStrategy = '维持当前定价策略';
    const profitMargin = metrics.revenue > 0 ? (metrics.profit / metrics.revenue) * 100 : 0;
    if (profitMargin < 30) {
      pricingStrategy = '可考虑小幅提价，提升利润率';
    } else if (metrics.orders < 20) {
      pricingStrategy = '可考虑适当促销，吸引更多顾客';
    }

    return {
      recommendedProducts,
      pricingStrategy,
      restockItems,
      specialNotes,
    };
  }

  protected async executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<IDailyReport> {
    const input = data as IDailyReportInput;
    
    // 计算指标
    const metrics = this.calculateMetrics(
      input.orders,
      input.dailyStats,
      input.previousStats,
    );

    // 生成亮点
    const highlights = await this.analyzeHighlights(metrics, input.previousStats);

    // 分析问题
    const issues = await this.analyzeIssues(metrics, input.inventory);

    // 生成预测
    const predictions = await this.generatePredictions(
      metrics,
      input.previousStats,
      input.weather,
      input.events,
    );

    // 生成行动建议
    const actions: IAction[] = [
      ...issues.map(issue => ({
        priority: issue.severity === 'critical' ? 'high' : issue.severity === 'warning' ? 'medium' : 'low',
        title: issue.title,
        description: issue.suggestion,
      })),
    ];

    // 优先级排序
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // 生成明日计划
    const tomorrowPlan = await this.generateTomorrowPlan(
      metrics,
      input.inventory,
      input.weather,
      input.events,
    );

    return {
      date: input.date || new Date().toISOString().split('T')[0],
      summary: this.generateSummary(metrics),
      metrics,
      highlights,
      issues,
      predictions,
      actions,
      tomorrowPlan,
      generatedAt: new Date(),
    };
  }
}
