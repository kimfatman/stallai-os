import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { CreateTransactionDto, TransactionQueryDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * 创建交易记录
   */
  async create(createTransactionDto: CreateTransactionDto, userId: number): Promise<Transaction> {
    const { type, amount, cost, quantity = 1 } = createTransactionDto;

    // Calculate profit for sales
    let profit = 0;
    if (type === TransactionType.SALE) {
      profit = amount - (cost || 0) * quantity;
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      userId,
      profit,
      orderNo: this.generateOrderNo(),
    });

    return this.transactionRepository.save(transaction);
  }

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().replace(/[-T:Z]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${dateStr}${random}`;
  }

  /**
   * 查询交易记录
   */
  async findAll(query: TransactionQueryDto, userId?: number) {
    const { page = 1, limit = 10, type, status, startDate, endDate, minAmount, maxAmount } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    if (userId) {
      queryBuilder.where('transaction.userId = :userId', { userId });
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', { maxAmount });
    }

    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const [transactions, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个交易
   */
  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!transaction) {
      throw new NotFoundException(`交易记录ID ${id} 不存在`);
    }

    return transaction;
  }

  /**
   * 取消交易
   */
  async cancel(id: number): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('只能取消待处理的交易');
    }

    transaction.status = TransactionStatus.CANCELLED;
    return this.transactionRepository.save(transaction);
  }

  /**
   * 退款
   */
  async refund(id: number, reason?: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('只能退已完成交易');
    }

    transaction.status = TransactionStatus.REFUNDED;
    transaction.note = reason || '用户申请退款';
    return this.transactionRepository.save(transaction);
  }

  /**
   * 按日期范围获取交易统计
   */
  async getStatsByDateRange(startDate: Date, endDate: Date, userId?: number) {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .where('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.createdAt <= :endDate', { endDate })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    const transactions = await queryBuilder.getMany();

    const totalSales = transactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCost = transactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((sum, t) => sum + Number(t.cost), 0);

    const totalProfit = transactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((sum, t) => sum + Number(t.profit), 0);

    const totalRefunds = transactions
      .filter(t => t.type === TransactionType.REFUND)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const salesCount = transactions.filter(t => t.type === TransactionType.SALE).length;
    const refundCount = transactions.filter(t => t.type === TransactionType.REFUND).length;

    return {
      totalSales,
      totalCost,
      totalProfit,
      totalRefunds,
      salesCount,
      refundCount,
      transactionCount: transactions.length,
      averageOrderValue: salesCount > 0 ? totalSales / salesCount : 0,
    };
  }

  /**
   * 获取今日统计
   */
  async getTodayStats(userId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getStatsByDateRange(today, tomorrow, userId);
  }

  /**
   * 获取本周统计
   */
  async getWeekStats(userId?: number) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.getStatsByDateRange(startOfWeek, endOfWeek, userId);
  }

  /**
   * 获取本月统计
   */
  async getMonthStats(userId?: number) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    return this.getStatsByDateRange(startOfMonth, endOfMonth, userId);
  }

  /**
   * 获取支付方式分布
   */
  async getPaymentMethodStats(startDate: Date, endDate: Date, userId?: number) {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .select('transaction.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'total')
      .where('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.createdAt <= :endDate', { endDate })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.type = :type', { type: TransactionType.SALE })
      .groupBy('transaction.paymentMethod');

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    return queryBuilder.getRawMany();
  }

  /**
   * 获取趋势数据
   */
  async getTrendData(days: number, userId?: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .select("DATE(transaction.createdAt)", 'date')
      .addSelect('SUM(CASE WHEN transaction.type = :sale THEN transaction.amount ELSE 0 END)', 'sales')
      .addSelect('SUM(CASE WHEN transaction.type = :sale THEN transaction.profit ELSE 0 END)', 'profit')
      .addSelect('COUNT(CASE WHEN transaction.type = :sale THEN 1 END)', 'orderCount')
      .where('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.createdAt <= :endDate', { endDate })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .setParameters({ sale: TransactionType.SALE, status: TransactionStatus.COMPLETED })
      .groupBy("DATE(transaction.createdAt)")
      .orderBy("DATE(transaction.createdAt)", 'ASC');

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    return queryBuilder.getRawMany();
  }
}
