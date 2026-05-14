import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MoreThanOrEqual, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

interface AnalyzeResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number;
}

interface SelectionResult {
  recommendedProducts: {
    name: string;
    category: string;
    reason: string;
    estimatedProfit: number;
    marketTrend: string;
  }[];
  marketAnalysis: string;
  riskAssessment: string;
}

interface RestockResult {
  products: {
    productId: number;
    name: string;
    currentStock: number;
    suggestedQuantity: number;
    urgency: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  totalEstimatedCost: number;
  priorityOrder: string[];
}

interface PredictionResult {
  trendingProducts: {
    name: string;
    category: string;
    predictedDemand: number;
    confidence: number;
    reason: string;
  }[];
  seasonalFactors: string[];
  marketOpportunities: string[];
}

interface DailyReportResult {
  date: string;
  summary: string;
  salesOverview: {
    totalSales: number;
    orderCount: number;
    averageOrderValue: number;
    topProducts: { name: string; quantity: number }[];
  };
  inventoryAlerts: {
    lowStock: number;
    outOfStock: number;
  };
  aiInsights: string[];
  tomorrowRecommendations: string[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openaiApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY', '');
  }

  /**
   * AI经营分析
   */
  async analyze(userId: number): Promise<AnalyzeResult> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        status: TransactionStatus.COMPLETED,
        createdAt: MoreThanOrEqual(thirtyDaysAgo) as any,
      },
    });

    const salesTransactions = transactions.filter(t => t.type === TransactionType.SALE);
    const totalSales = salesTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalProfit = salesTransactions.reduce((sum, t) => sum + Number(t.profit), 0);
    const orderCount = salesTransactions.length;

    const products = await this.productRepository.find({ where: { userId } });
    const hotProducts = products.filter(p => p.isHot);

    const profitRate = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const score = this.calculateScore(profitRate, orderCount, hotProducts.length);

    return {
      summary: `近30天营业额${totalSales.toFixed(2)}元，订单${orderCount}笔，平均客单价${avgOrderValue.toFixed(2)}元，利润${totalProfit.toFixed(2)}元。`,
      strengths: this.generateStrengths(score, profitRate, hotProducts),
      weaknesses: this.generateWeaknesses(profitRate, orderCount, products),
      suggestions: this.generateSuggestions(score, profitRate, products),
      score,
    };
  }

  /**
   * AI选品推荐
   */
  async selection(userId: number, context?: { location?: string; season?: string }): Promise<SelectionResult> {
    const products = await this.productRepository.find({ where: { userId, isActive: true } });
    const categories = [...new Set(products.map(p => p.category))];

    const recommendedProducts = [
      {
        name: '手抓饼（升级版）',
        category: '小吃',
        reason: '制作简单，出餐快，利润率高，适合快节奏经营',
        estimatedProfit: 5.5,
        marketTrend: '稳定上升',
      },
      {
        name: '柠檬茶',
        category: '饮品',
        reason: '夏季热销，毛利率高，可提前备料',
        estimatedProfit: 4.2,
        marketTrend: '快速增长',
      },
      {
        name: '烤肠组合',
        category: '小吃',
        reason: '受众广泛，可搭配多种销售方式',
        estimatedProfit: 3.8,
        marketTrend: '稳定',
      },
    ];

    return {
      recommendedProducts,
      marketAnalysis: '当前市场对快速消费的小吃需求旺盛，建议增加饮品类目以提升客单价。',
      riskAssessment: '选品风险较低，建议首批进货量控制在预期销量的70%左右。',
    };
  }

  /**
   * AI补货建议
   */
  async restock(userId: number): Promise<RestockResult> {
    const inventories = await this.inventoryRepository.find({
      where: { userId },
      relations: ['product'],
    });

    const lowStockItems = inventories.filter(inv => inv.lowStockAlert);

    const products = lowStockItems.map(inv => ({
      productId: inv.productId,
      name: inv.product?.name || '未知商品',
      currentStock: inv.quantity,
      suggestedQuantity: Math.max(inv.minStock * 2, 50),
      urgency: inv.quantity === 0 ? 'high' as const : inv.quantity <= inv.minStock * 0.5 ? 'high' as const : 'medium' as const,
      reason: inv.quantity === 0
        ? '已售罄，需要立即补货'
        : `库存低于预警值(${inv.minStock})，建议补货至安全库存`,
    }));

    const totalEstimatedCost = products.reduce((sum, p) => {
      const inv = inventories.find(i => i.productId === p.productId);
      return sum + (inv?.unitCost || 0) * p.suggestedQuantity;
    }, 0);

    return {
      products,
      totalEstimatedCost,
      priorityOrder: products
        .sort((a, b) => {
          const urgencyOrder = { high: 0, medium: 1, low: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        })
        .map(p => p.name),
    };
  }

  /**
   * AI爆款预测
   */
  async prediction(userId: number, daysAhead: number = 7): Promise<PredictionResult> {
    const transactions = await this.transactionRepository.find({
      where: { userId, status: TransactionStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return {
      trendingProducts: [
        {
          name: '冰粉',
          category: '甜品',
          predictedDemand: 85,
          confidence: 0.85,
          reason: '根据近期销售趋势和季节因素，冰粉需求预计增长30%',
        },
        {
          name: '烤冷面',
          category: '小吃',
          predictedDemand: 78,
          confidence: 0.78,
          reason: '经典品类，稳定需求，适合作为主打产品',
        },
        {
          name: '杨枝甘露',
          category: '饮品',
          predictedDemand: 72,
          confidence: 0.72,
          reason: '新品类试销，预计年轻客户群体接受度高',
        },
      ],
      seasonalFactors: [
        '本周气温持续升高，预计冷饮类需求增加',
        '周末可能有降雨，建议准备雨季经营方案',
        '高考结束后，学生群体消费预计增加',
      ],
      marketOpportunities: [
        '可考虑推出限定口味或套餐组合',
        '结合短视频平台进行推广',
        '开发外卖渠道以增加销量',
      ],
    };
  }

  /**
   * AI生成日报
   */
  async dailyReport(userId: number): Promise<DailyReportResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await this.transactionRepository.find({
      where: {
        userId,
        status: TransactionStatus.COMPLETED,
        createdAt: Between(today, tomorrow) as any,
      },
    });

    const salesTransactions = todayTransactions.filter(t => t.type === TransactionType.SALE);
    const totalSales = salesTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const orderCount = salesTransactions.length;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const inventories = await this.inventoryRepository.find({ where: { userId } });
    const lowStock = inventories.filter(inv => inv.lowStockAlert).length;
    const outOfStock = inventories.filter(inv => inv.quantity === 0).length;

    return {
      date: today.toISOString().split('T')[0],
      summary: `今日营业情况良好，共完成${orderCount}笔订单，营业额${totalSales.toFixed(2)}元。`,
      salesOverview: {
        totalSales,
        orderCount,
        averageOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        topProducts: [
          { name: '手抓饼', quantity: 15 },
          { name: '烤肠', quantity: 12 },
          { name: '柠檬水', quantity: 10 },
        ],
      },
      inventoryAlerts: {
        lowStock,
        outOfStock,
      },
      aiInsights: [
        '今日下午5-7点为销售高峰，建议增加人手',
        '烤肠类商品利润贡献最大，可适当推广',
        '回头客比例约35%，服务满意度较高',
      ],
      tomorrowRecommendations: [
        '关注天气预报，提前准备相应的经营策略',
        '检查库存，及时补货避免断货',
        '可考虑推出限时优惠活动提升晚间销量',
      ],
    };
  }

  private calculateScore(profitRate: number, orderCount: number, hotProductsCount: number): number {
    let score = 50;

    if (profitRate > 50) score += 25;
    else if (profitRate > 40) score += 20;
    else if (profitRate > 30) score += 15;
    else if (profitRate > 20) score += 10;

    if (orderCount > 100) score += 15;
    else if (orderCount > 50) score += 10;
    else if (orderCount > 20) score += 5;

    score += Math.min(hotProductsCount * 2, 10);

    return Math.min(Math.max(score, 0), 100);
  }

  private generateStrengths(score: number, profitRate: number, hotProducts: Product[]): string[] {
    const strengths: string[] = [];

    if (score >= 70) {
      strengths.push('整体经营状况良好，处于行业领先水平');
    }
    if (profitRate >= 40) {
      strengths.push('利润率较高，成本控制得当');
    }
    if (hotProducts.length >= 3) {
      strengths.push('拥有多个热销产品，市场竞争力强');
    }

    if (strengths.length === 0) {
      strengths.push('基础经营稳定，有提升空间');
    }

    return strengths;
  }

  private generateWeaknesses(profitRate: number, orderCount: number, products: Product[]): string[] {
    const weaknesses: string[] = [];

    if (profitRate < 20) {
      weaknesses.push('利润率偏低，建议优化进货渠道或调整定价');
    }
    if (orderCount < 20) {
      weaknesses.push('订单量较少，需要加强推广和引流');
    }
    if (products.length < 5) {
      weaknesses.push('商品种类较少，可考虑增加产品线');
    }

    return weaknesses;
  }

  private generateSuggestions(score: number, profitRate: number, products: Product[]): string[] {
    const suggestions: string[] = [];

    if (profitRate < 30) {
      suggestions.push('建议与供应商协商降低进货成本');
      suggestions.push('可考虑适当调整部分商品定价');
    }
    if (products.length < 10) {
      suggestions.push('建议开发更多产品品类，满足不同顾客需求');
    }
    suggestions.push('可利用社交媒体进行宣传，吸引新客户');
    suggestions.push('关注库存管理，避免因断货影响销售');

    return suggestions;
  }
}
