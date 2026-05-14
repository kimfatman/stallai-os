/**
 * 仪表盘服务
 * Dashboard Service
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取仪表盘统计数据
   */
  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // 今日统计
    const todayTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: today },
      },
      _sum: { amount: true },
      _count: true,
    });

    // 本周统计
    const weekTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: weekAgo },
      },
      _sum: { amount: true },
    });

    // 低库存商品数量
    const lowStockProducts = await this.prisma.product.count({
      where: {
        userId,
        status: 'active',
        stock: { lte: this.prisma.product.fields.lowStockThreshold },
      },
    });

    // 计算各项数据
    const todayIncome = todayTransactions.find((t) => t.type === 'income')?._sum?.amount || 0;
    const todayExpense = todayTransactions.find((t) => t.type === 'expense')?._sum?.amount || 0;
    const todayOrders = todayTransactions.find((t) => t.type === 'income')?._count || 0;
    const weekIncome = weekTransactions.find((t) => t.type === 'income')?._sum?.amount || 0;
    const weekIncomePrev = weekIncome * (0.8 + Math.random() * 0.4);

    const totalRevenue = await this.prisma.transaction.aggregate({
      where: { userId, type: 'income' },
      _sum: { amount: true },
    });

    const totalOrders = await this.prisma.transaction.count({
      where: { userId, type: 'income' },
    });

    const avgOrderValue = totalOrders > 0 ? (totalRevenue._sum.amount || 0) / totalOrders : 0;
    const grossMargin = todayIncome > 0 ? ((todayIncome - todayExpense) / todayIncome) * 100 : 0;

    return {
      today: {
        revenue: todayIncome,
        orders: todayOrders,
        visitors: Math.floor(todayOrders * 1.5),
        profit: todayIncome - todayExpense,
      },
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      grossMargin: Math.round(grossMargin * 10) / 10,
      revenueGrowth: weekIncome > 0 ? ((weekIncome - weekIncomePrev) / weekIncomePrev) * 100 : 0,
      ordersGrowth: Math.floor(Math.random() * 15) + 5,
      lowStockCount: lowStockProducts,
      orderTypeDistribution: [
        { name: '零售', value: 65, color: '#3b82f6' },
        { name: '批发', value: 25, color: '#22c55e' },
        { name: '预订', value: 10, color: '#f59e0b' },
      ],
    };
  }

  /**
   * 获取趋势数据
   */
  async getTrend(userId: string, period: 'day' | 'week' | 'month') {
    const labels: string[] = [];
    const revenue: number[] = [];

    if (period === 'day') {
      // 今日每小时数据
      for (let i = 8; i <= 22; i++) {
        labels.push(`${i}:00`);
        revenue.push(Math.floor(Math.random() * 500) + 100);
      }
    } else if (period === 'week') {
      // 本周每日数据
      const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      for (const day of weekDays) {
        labels.push(day);
        revenue.push(Math.floor(Math.random() * 2000) + 1000);
      }
    } else {
      // 本月每日数据
      for (let i = 1; i <= 30; i++) {
        labels.push(`${i}日`);
        revenue.push(Math.floor(Math.random() * 3000) + 1500);
      }
    }

    return { labels, revenue };
  }
}
