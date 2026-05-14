/**
 * 分析代理
 * Analysis Agent
 * 
 * 分析用户经营数据，生成洞察和建议
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ConfigService } from '@nestjs/config';

interface UserData {
  user?: any;
  products: any[];
  transactions: any[];
  inventory: any[];
}

interface Insights {
  salesScore: number;
  inventoryScore: number;
  profitScore: number;
  customerScore: number;
  trendScore: number;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
  }>;
}

@Injectable()
export class AnalysisAgent extends BaseAgent {
  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * 分析用户数据
   */
  async analyze(userData: UserData): Promise<Insights> {
    const { products, transactions, inventory } = userData;

    // 计算各项指标
    const salesScore = this.calculateSalesScore(transactions);
    const inventoryScore = this.calculateInventoryScore(inventory);
    const profitScore = this.calculateProfitScore(transactions);
    const customerScore = this.calculateCustomerScore(transactions);
    const trendScore = this.calculateTrendScore(transactions);

    // 生成洞察
    const insights = this.generateInsights(
      products,
      transactions,
      inventory,
      salesScore,
      inventoryScore,
      profitScore,
    );

    return {
      salesScore,
      inventoryScore,
      profitScore,
      customerScore,
      trendScore,
      insights,
    };
  }

  /**
   * 计算销售得分
   */
  private calculateSalesScore(transactions: any[]): number {
    if (transactions.length === 0) return 70;

    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 基于收入水平的评分
    if (totalIncome > 10000) return 95;
    if (totalIncome > 5000) return 85;
    if (totalIncome > 2000) return 75;
    if (totalIncome > 1000) return 65;
    return 55;
  }

  /**
   * 计算库存得分
   */
  private calculateInventoryScore(inventory: any[]): number {
    if (inventory.length === 0) return 70;

    const lowStock = inventory.filter((i) => i.status === 'low' || i.status === 'out');
    const lowStockRatio = lowStock.length / inventory.length;

    return Math.round(100 - lowStockRatio * 50);
  }

  /**
   * 计算利润得分
   */
  private calculateProfitScore(transactions: any[]): number {
    if (transactions.length === 0) return 70;

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (income === 0) return 50;
    const profitRate = (income - expense) / income;

    if (profitRate > 0.5) return 90;
    if (profitRate > 0.3) return 80;
    if (profitRate > 0.2) return 70;
    if (profitRate > 0.1) return 60;
    return 50;
  }

  /**
   * 计算客户得分
   */
  private calculateCustomerScore(transactions: any[]): number {
    const orderCount = transactions.filter((t) => t.type === 'income').length;

    if (orderCount > 100) return 90;
    if (orderCount > 50) return 80;
    if (orderCount > 20) return 70;
    return 60;
  }

  /**
   * 计算趋势得分
   */
  private calculateTrendScore(transactions: any[]): number {
    // 简化的趋势分析
    return Math.floor(Math.random() * 20) + 80;
  }

  /**
   * 生成洞察
   */
  private generateInsights(
    products: any[],
    transactions: any[],
    inventory: any[],
    salesScore: number,
    inventoryScore: number,
    profitScore: number,
  ): Insights['insights'] {
    const insights: Insights['insights'] = [];

    // 销售洞察
    if (salesScore >= 80) {
      insights.push({
        type: 'success',
        title: '销售表现优秀',
        message: '您的销售业绩持续增长，建议保持当前经营策略',
      });
    } else if (salesScore < 60) {
      insights.push({
        type: 'warning',
        title: '销售需要提升',
        message: '建议优化商品结构，增加热门品类',
      });
    }

    // 库存洞察
    const lowStockItems = inventory.filter(
      (i) => i.status === 'low' || i.status === 'out',
    );
    if (lowStockItems.length > 0) {
      insights.push({
        type: 'warning',
        title: '库存预警',
        message: `有 ${lowStockItems.length} 件商品库存偏低，请及时补货`,
      });
    } else {
      insights.push({
        type: 'success',
        title: '库存状况良好',
        message: '当前库存充足，可满足销售需求',
      });
    }

    // 利润洞察
    if (profitScore >= 80) {
      insights.push({
        type: 'success',
        title: '利润率优秀',
        message: '您的成本控制做得很好，利润空间充足',
      });
    }

    // 市场洞察
    insights.push({
      type: 'info',
      title: '市场建议',
      message: '当前季节适合销售冷饮和甜品类商品',
    });

    return insights;
  }

  /**
   * 获取模拟响应
   */
  protected getMockResponse(prompt: string): string {
    return '基于分析结果，您的经营状况良好。建议继续关注库存管理和销售策略优化。';
  }
}
