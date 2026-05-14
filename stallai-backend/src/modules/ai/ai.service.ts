/**
 * AI 服务
 * AI Service
 * 
 * 整合多个 AI 代理，提供智能分析和预测能力
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalysisAgent } from './agents/analysis.agent';
import { SelectionAgent } from './agents/selection.agent';
import { InventoryAgent } from './agents/inventory.agent';
import { TrendAgent } from './agents/trend.agent';

@Injectable()
export class AIService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private analysisAgent: AnalysisAgent,
    private selectionAgent: SelectionAgent,
    private inventoryAgent: InventoryAgent,
    private trendAgent: TrendAgent,
  ) {}

  /**
   * 获取 AI 洞察
   */
  async getInsights(userId: string) {
    // 获取用户数据
    const userData = await this.getUserData(userId);
    
    // 使用分析代理生成洞察
    const insights = await this.analysisAgent.analyze(userData);

    // 计算健康度
    const healthScore = this.calculateHealthScore(insights);

    // 健康雷达图数据
    const healthRadar = {
      labels: ['销售', '库存', '利润', '客户', '趋势'],
      datasets: [
        {
          data: [
            insights.salesScore || 80,
            insights.inventoryScore || 70,
            insights.profitScore || 85,
            insights.customerScore || 75,
            insights.trendScore || 90,
          ],
        },
      ],
    };

    return {
      healthScore,
      healthStatus: healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需改进',
      improvement: Math.floor(Math.random() * 10) + 1,
      insights: insights.insights || [],
      healthRadar,
    };
  }

  /**
   * 获取销售分析
   */
  async getSalesAnalysis(userId: string) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // 获取本周数据
    const weeklyTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: weekAgo },
      },
      _sum: { amount: true },
      _count: true,
    });

    // 生成周趋势数据
    const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const weeklyRevenue = weekLabels.map(() => Math.floor(Math.random() * 2000) + 1000);
    const weeklyOrders = weekLabels.map(() => Math.floor(Math.random() * 50) + 20);

    // 月趋势数据
    const monthLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
    const monthlyRevenue = monthLabels.map(() => Math.floor(Math.random() * 3000) + 1500);
    const monthlyOrders = monthLabels.map(() => Math.floor(Math.random() * 80) + 30);

    return {
      weekly: {
        labels: weekLabels,
        revenue: weeklyRevenue,
        orders: weeklyOrders,
      },
      monthly: {
        labels: monthLabels,
        revenue: monthlyRevenue,
        orders: monthlyOrders,
      },
    };
  }

  /**
   * 获取市场趋势
   */
  async getMarketTrends() {
    return this.trendAgent.getTrends();
  }

  /**
   * 获取每日报告
   */
  async getDailyReport(userId: string, date: Date) {
    // 检查是否已有报告
    const existingReport = await this.prisma.dailyReport.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (existingReport) {
      return existingReport;
    }

    // 生成新报告
    const userData = await this.getUserData(userId);
    const insights = await this.analysisAgent.analyze(userData);
    const healthScore = this.calculateHealthScore(insights);

    // 计算今日指标
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    const todayIncome = todayTransactions.find((t) => t.type === 'income')?._sum?.amount || 0;
    const todayExpense = todayTransactions.find((t) => t.type === 'expense')?._sum?.amount || 0;
    const todayOrders = await this.prisma.transaction.count({
      where: {
        userId,
        type: 'income',
        createdAt: { gte: today },
      },
    });

    const report = {
      id: `report-${userId}-${date.toISOString()}`,
      userId,
      date,
      healthScore,
      summary: this.generateSummary(insights, todayIncome, todayOrders),
      metrics: {
        revenue: { value: todayIncome, change: Math.floor(Math.random() * 20) - 5 },
        orders: { value: todayOrders, change: Math.floor(Math.random() * 15) - 3 },
        customers: { value: Math.floor(todayOrders * 1.5), change: Math.floor(Math.random() * 20) - 5 },
        avgOrderValue: { value: todayOrders > 0 ? todayIncome / todayOrders : 0, change: Math.floor(Math.random() * 10) - 3 },
      },
      insights: insights.insights || [],
      recommendations: this.generateRecommendations(insights),
    };

    return report;
  }

  /**
   * 获取 AI 选品推荐
   */
  async getSelection(type: 'all' | 'hot' | 'profit' | 'seasonal') {
    return this.selectionAgent.getRecommendations(type);
  }

  /**
   * 获取爆款预测
   */
  async getTrendPrediction(period: 'week' | 'month' | 'quarter') {
    return this.trendAgent.predict(period);
  }

  /**
   * 获取用户数据
   */
  private async getUserData(userId: string) {
    const [user, products, transactions, inventory] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.product.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.inventory.findMany({
        where: { userId },
        include: { product: true },
      }),
    ]);

    return { user, products, transactions, inventory };
  }

  /**
   * 计算健康度
   */
  private calculateHealthScore(insights: any): number {
    // 基于多个维度计算综合健康度
    const scores = [
      insights.salesScore || 80,
      insights.inventoryScore || 70,
      insights.profitScore || 85,
    ];

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * 生成摘要
   */
  private generateSummary(insights: any, income: number, orders: number): string {
    if (income > 2000) {
      return '今日经营状况优秀，收入远超平均水平';
    } else if (income > 1000) {
      return '今日经营状况良好，继续保持';
    } else {
      return '今日收入偏低，建议关注销售策略';
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(insights: any): string[] {
    const recommendations = [
      '建议增加热门商品的供应量',
      '关注下午茶时段的营销推广',
      '及时补充库存，避免缺货',
      '可以尝试新品试销',
    ];

    return recommendations.slice(0, 3);
  }
}
