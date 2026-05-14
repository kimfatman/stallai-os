import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

interface DashboardSummary {
  todaySales: number;
  todayOrders: number;
  todayProfit: number;
  weekSales: number;
  weekOrders: number;
  weekProfit: number;
  monthSales: number;
  monthOrders: number;
  monthProfit: number;
  inventoryAlerts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalProducts: number;
  activeProducts: number;
}

interface ScoreResult {
  overallScore: number;
  scoreLevel: string;
  breakdown: {
    salesScore: number;
    profitScore: number;
    inventoryScore: number;
    growthScore: number;
  };
  feedback: string;
}

interface TrendData {
  labels: string[];
  sales: number[];
  orders: number[];
  profits: number[];
}

interface AISummaryResult {
  summary: string;
  highlights: string[];
  warnings: string[];
  recommendations: string[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * 获取经营概览
   */
  async getSummary(userId: number): Promise<DashboardSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Today's stats
    const todayTransactions = await this.getTransactionsInRange(
      userId, today, tomorrow, TransactionType.SALE
    );

    // Week's stats
    const weekTransactions = await this.getTransactionsInRange(
      userId, startOfWeek, endOfWeek, TransactionType.SALE
    );

    // Month's stats
    const monthTransactions = await this.getTransactionsInRange(
      userId, startOfMonth, endOfMonth, TransactionType.SALE
    );

    // Inventory stats
    const inventories = await this.inventoryRepository.find({ where: { userId } });
    const lowStockProducts = inventories.filter(inv => inv.lowStockAlert).length;
    const outOfStockProducts = inventories.filter(inv => inv.quantity === 0).length;

    // Product stats
    const products = await this.productRepository.find({ where: { userId } });
    const activeProducts = products.filter(p => p.isActive).length;

    return {
      todaySales: todayTransactions.totalAmount,
      todayOrders: todayTransactions.count,
      todayProfit: todayTransactions.totalProfit,
      weekSales: weekTransactions.totalAmount,
      weekOrders: weekTransactions.count,
      weekProfit: weekTransactions.totalProfit,
      monthSales: monthTransactions.totalAmount,
      monthOrders: monthTransactions.count,
      monthProfit: monthTransactions.totalProfit,
      inventoryAlerts: lowStockProducts + outOfStockProducts,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: products.length,
      activeProducts,
    };
  }

  /**
   * 获取AI经营评分
   */
  async getScore(userId: number): Promise<ScoreResult> {
    const summary = await this.getSummary(userId);

    // Calculate individual scores
    const salesScore = this.calculateSalesScore(summary.todayOrders, summary.weekOrders);
    const profitScore = this.calculateProfitScore(summary.todayProfit, summary.weekProfit);
    const inventoryScore = this.calculateInventoryScore(summary);
    const growthScore = this.calculateGrowthScore(summary);

    // Overall score (weighted average)
    const overallScore = Math.round(
      salesScore * 0.3 +
      profitScore * 0.35 +
      inventoryScore * 0.2 +
      growthScore * 0.15
    );

    // Determine level
    let scoreLevel: string;
    let feedback: string;

    if (overallScore >= 90) {
      scoreLevel = '优秀';
      feedback = '经营状况极佳！继续保持，关注细节优化。';
    } else if (overallScore >= 75) {
      scoreLevel = '良好';
      feedback = '整体表现不错，建议关注薄弱环节进一步提升。';
    } else if (overallScore >= 60) {
      scoreLevel = '一般';
      feedback = '有提升空间，建议分析问题并制定改进计划。';
    } else {
      scoreLevel = '需改进';
      feedback = '经营遇到挑战，建议全面复盘并寻求突破。';
    }

    return {
      overallScore,
      scoreLevel,
      breakdown: {
        salesScore,
        profitScore,
        inventoryScore,
        growthScore,
      },
      feedback,
    };
  }

  /**
   * 获取趋势数据
   */
  async getTrends(userId: number, days: number = 30): Promise<TrendData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.type = :type', { type: TransactionType.SALE })
      .andWhere('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.createdAt <= :endDate', { endDate })
      .orderBy('transaction.createdAt', 'ASC')
      .getMany();

    // Group by date
    const dailyData = new Map<string, { sales: number; orders: number; profits: number }>();

    // Initialize all days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData.set(dateKey, { sales: 0, orders: 0, profits: 0 });
    }

    // Aggregate transactions
    transactions.forEach(t => {
      const dateKey = new Date(t.createdAt).toISOString().split('T')[0];
      const current = dailyData.get(dateKey) || { sales: 0, orders: 0, profits: 0 };
      current.sales += Number(t.amount);
      current.orders += 1;
      current.profits += Number(t.profit);
      dailyData.set(dateKey, current);
    });

    const labels: string[] = [];
    const sales: number[] = [];
    const orders: number[] = [];
    const profits: number[] = [];

    dailyData.forEach((data, date) => {
      labels.push(date);
      sales.push(Math.round(data.sales * 100) / 100);
      orders.push(data.orders);
      profits.push(Math.round(data.profits * 100) / 100);
    });

    return { labels, sales, orders, profits };
  }

  /**
   * 获取AI一句话总结
   */
  async getAISummary(userId: number): Promise<AISummaryResult> {
    const summary = await this.getSummary(userId);
    const score = await this.getScore(userId);
    const trends = await this.getTrends(userId, 7);

    const highlights: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Analyze highlights
    if (summary.todaySales > summary.weekSales / 7 * 1.2) {
      highlights.push(`今日销售额较日均高出${Math.round((summary.todaySales / (summary.weekSales / 7) - 1) * 100)}%`);
    }

    if (summary.todayOrders > 20) {
      highlights.push('今日订单量表现优异');
    }

    if (score.overallScore >= 75) {
      highlights.push(`AI综合评分为${score.overallScore}分(${score.scoreLevel})`);
    }

    // Analyze warnings
    if (summary.outOfStockProducts > 0) {
      warnings.push(`${summary.outOfStockProducts}种商品已售罄，需立即补货`);
    }

    if (summary.lowStockProducts > 3) {
      warnings.push(`${summary.lowStockProducts}种商品库存不足，建议尽快补货`);
    }

    if (summary.todayOrders < 10) {
      warnings.push('今日订单量偏低，建议加强推广');
    }

    // Generate recommendations
    if (summary.outOfStockProducts + summary.lowStockProducts > 0) {
      recommendations.push('优先处理库存预警商品，避免影响销售');
    }

    if (summary.todayOrders < summary.weekOrders / 7) {
      recommendations.push('本周销售趋势有所下滑，建议分析原因并调整策略');
    }

    recommendations.push('持续关注库存变化，保持合理备货');

    // Generate summary text
    const summaryText = this.generateSummaryText(summary, score);

    return {
      summary: summaryText,
      highlights,
      warnings,
      recommendations,
    };
  }

  // Helper methods
  private async getTransactionsInRange(
    userId: number,
    startDate: Date,
    endDate: Date,
    type: TransactionType
  ) {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalAmount')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.profit)', 'totalProfit')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.type = :type', { type })
      .andWhere('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.createdAt <= :endDate', { endDate })
      .getRawOne();

    return {
      totalAmount: parseFloat(result.totalAmount) || 0,
      count: parseInt(result.count) || 0,
      totalProfit: parseFloat(result.totalProfit) || 0,
    };
  }

  private calculateSalesScore(todayOrders: number, weekOrders: number): number {
    const avgDailyOrders = weekOrders / 7;
    if (todayOrders >= avgDailyOrders * 1.5) return 100;
    if (todayOrders >= avgDailyOrders) return 80;
    if (todayOrders >= avgDailyOrders * 0.7) return 60;
    if (todayOrders >= avgDailyOrders * 0.5) return 40;
    return 20;
  }

  private calculateProfitScore(todayProfit: number, weekProfit: number): number {
    const avgDailyProfit = weekProfit / 7;
    if (todayProfit >= avgDailyProfit * 1.3) return 100;
    if (todayProfit >= avgDailyProfit) return 80;
    if (todayProfit >= avgDailyProfit * 0.7) return 60;
    if (todayProfit >= avgDailyProfit * 0.5) return 40;
    return 20;
  }

  private calculateInventoryScore(summary: DashboardSummary): number {
    if (summary.outOfStockProducts > 0) return 20;
    if (summary.lowStockProducts > 5) return 50;
    if (summary.lowStockProducts > 2) return 70;
    if (summary.lowStockProducts > 0) return 85;
    return 100;
  }

  private calculateGrowthScore(summary: DashboardSummary): number {
    const todayAvg = summary.todaySales;
    const weekAvg = summary.weekSales / 7;

    if (todayAvg >= weekAvg * 1.5) return 100;
    if (todayAvg >= weekAvg * 1.2) return 85;
    if (todayAvg >= weekAvg) return 70;
    if (todayAvg >= weekAvg * 0.8) return 50;
    return 30;
  }

  private generateSummaryText(summary: DashboardSummary, score: ScoreResult): string {
    const parts: string[] = [];

    parts.push(`今日营业${summary.todaySales.toFixed(2)}元，`);
    parts.push(`订单${summary.todayOrders}笔，`);
    parts.push(`利润${summary.todayProfit.toFixed(2)}元。`);

    if (summary.inventoryAlerts > 0) {
      parts.push(`库存预警${summary.inventoryAlerts}项需关注。`);
    }

    parts.push(`本周累计${summary.weekSales.toFixed(2)}元，`);
    parts.push(`AI评分为${score.overallScore}分(${score.scoreLevel})。`);

    return parts.join('');
  }
}
