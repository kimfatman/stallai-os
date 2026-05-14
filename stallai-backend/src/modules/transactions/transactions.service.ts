/**
 * 交易服务
 * Transactions Service
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取交易列表
   */
  async findAll(userId: string, params?: { type?: string; period?: string }) {
    const where: any = { userId };

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.period) {
      const now = new Date();
      let startDate: Date;

      switch (params.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }

      where.createdAt = { gte: startDate };
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } },
      },
    });

    return transactions;
  }

  /**
   * 获取交易统计
   */
  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // 今日统计
    const todayTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: today },
      },
      _sum: { amount: true },
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

    // 本月统计
    const monthTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: monthAgo },
      },
      _sum: { amount: true },
    });

    const calcProfit = (transactions: any[]) => {
      const income = transactions.find((t) => t.type === 'income')?._sum?.amount || 0;
      const expense = transactions.find((t) => t.type === 'expense')?._sum?.amount || 0;
      return income - expense;
    };

    return {
      todayIncome: todayTransactions.find((t) => t.type === 'income')?._sum?.amount || 0,
      todayExpense: todayTransactions.find((t) => t.type === 'expense')?._sum?.amount || 0,
      todayProfit: calcProfit(todayTransactions),
      weekIncome: weekTransactions.find((t) => t.type === 'income')?._sum?.amount || 0,
      weekExpense: weekTransactions.find((t) => t.type === 'expense')?._sum?.amount || 0,
      weekProfit: calcProfit(weekTransactions),
      monthIncome: monthTransactions.find((t) => t.type === 'income')?._sum?.amount || 0,
      monthExpense: monthTransactions.find((t) => t.type === 'expense')?._sum?.amount || 0,
      monthProfit: calcProfit(monthTransactions),
    };
  }

  /**
   * 创建交易
   */
  async create(userId: string, data: { type: string; amount: number; category?: string; description?: string; productId?: string }) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        productId: data.productId,
      },
    });
  }

  /**
   * 删除交易
   */
  async remove(id: string, userId: string) {
    await this.prisma.transaction.delete({
      where: { id },
    });
    return { message: '删除成功' };
  }
}
