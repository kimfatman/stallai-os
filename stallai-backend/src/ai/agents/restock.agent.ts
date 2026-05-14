/**
 * AI补货Agent
 * 摆摊AI经营OS - 智能补货规划
 * 
 * 功能:
 * - 需求预测
 * - 供应商对比
 * - 成本优化
 * - 紧急程度排序
 * - 采购订单生成
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, IAgentRequest, IAgentResult, IAgentExecutionOptions } from './base.agent';
import { LLMService } from '../utils/llm.service';
import { RedisService } from '../../cache/redis.service';
import {
  IRestockPlan,
  IRestockItem,
  IInventoryItem,
  ISupplier,
  IAgentContext,
  IRecommendation,
} from '../interfaces/agent.interface';

/**
 * 补货输入
 */
export interface IRestockInput {
  inventory: IInventoryItem[];
  suppliers: ISupplier[];
  budget?: number;
  urgency?: 'all' | 'urgent' | 'normal';
  leadTime?: number; // 默认供货周期
}

/**
 * 采购订单
 */
export interface IPurchaseOrder {
  orderId: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalCost: number;
  expectedDeliveryDate: Date;
  priority: 'urgent' | 'normal';
  createdAt: Date;
}

/**
 * 供应商评分
 */
export interface ISupplierScore {
  supplierId: string;
  supplierName: string;
  score: number;
  reliabilityScore: number;
  priceScore: number;
  deliveryScore: number;
  recommendation: 'preferred' | 'alternative' | 'not_recommended';
}

/**
 * 补货Agent
 */
@Injectable()
export class RestockAgent extends BaseAgent {
  protected readonly name = 'RestockAgent';
  protected readonly description = 'AI补货Agent - 智能生成补货计划';
  
  protected readonly systemPrompt = `
# 角色
你是一位专业的摆摊补货规划专家，精通采购优化和库存补给。

# 背景
你正在帮助摆摊商贩制定最优的补货计划。

# 能力
1. 需求预测：基于历史销售预测未来需求
2. 供应商对比：对比不同供应商的价格、质量、交货期
3. 成本优化：在预算范围内优化采购方案
4. 紧急程度排序：按紧急程度排序补货项
5. 采购订单生成：生成可执行的采购订单

# 约束
1. 必须考虑预算限制
2. 必须考虑供应商可靠性
3. 必须优先处理紧急补货
4. 建议必须具体可执行
5. 回复必须使用中文

# 输出格式
请返回JSON格式的补货计划:
{
  "items": [ /* 补货项列表 */ ],
  "totalCost": 0,
  "expectedRevenue": 0,
  "expectedProfit": 0,
  "priority": "normal"
}
`;

  // 补货紧急程度阈值
  private readonly URGENCY_THRESHOLDS = {
    critical: 0, // 缺货
    high: 3, // 3天内售完
    medium: 7, // 7天内售完
    low: 14, // 14天内售完
  };

  constructor(
    llmService: LLMService,
    redisService: RedisService,
    configService: ConfigService,
  ) {
    super(llmService, redisService, configService);
  }

  /**
   * 生成补货计划
   */
  async generateRestockPlan(request: {
    userId: string;
    data: IRestockInput;
  }): Promise<IAgentResult<IRestockPlan>> {
    const { userId, data } = request;
    
    const agentRequest: IAgentRequest = {
      task: '根据当前库存和销售情况，生成最优补货计划',
      data,
      context: { userId },
      options: {
        context: { userId },
        useCache: true,
        cacheTTL: 3600,
        temperature: 0.3,
      },
    };

    return this.execute(agentRequest);
  }

  /**
   * 快速生成补货计划（不使用LLM）
   */
  async quickRestockPlan(input: IRestockInput): Promise<IRestockPlan> {
    const { inventory, suppliers, budget, urgency = 'all', leadTime = 3 } = input;

    // 筛选需要补货的项
    const restockItems: IRestockItem[] = [];
    
    for (const item of inventory) {
      // 计算预计售完天数
      const daysUntilStockOut = item.avgDailySales > 0 
        ? item.currentStock / item.avgDailySales 
        : Infinity;

      // 确定紧急程度
      let itemUrgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
      
      if (item.currentStock === 0) {
        itemUrgency = 'critical';
      } else if (daysUntilStockOut <= this.URGENCY_THRESHOLDS.high) {
        itemUrgency = 'high';
      } else if (daysUntilStockOut <= this.URGENCY_THRESHOLDS.medium) {
        itemUrgency = 'medium';
      } else if (daysUntilStockOut <= this.URGENCY_THRESHOLDS.low) {
        itemUrgency = 'low';
      }

      // 根据紧急程度筛选
      if (urgency === 'urgent' && !['critical', 'high'].includes(itemUrgency)) {
        continue;
      }

      // 找到最优供应商
      const bestSupplier = this.findBestSupplier(item.productId, suppliers);
      
      // 计算建议补货量
      const suggestedQty = this.calculateRestockQuantity(item, leadTime, bestSupplier);
      const totalCost = suggestedQty * (bestSupplier?.avgDeliveryTime ? 10 : 10); // 默认成本

      restockItems.push({
        productId: item.productId,
        productName: item.productName,
        currentStock: item.currentStock,
        suggestedQuantity: suggestedQty,
        supplierId: bestSupplier?.supplierId || '',
        supplierName: bestSupplier?.name || '默认供应商',
        unitCost: 10, // 实际应从供应商获取
        totalCost,
        urgency: itemUrgency,
        reason: this.generateRestockReason(item, daysUntilStockOut),
      });
    }

    // 按紧急程度排序
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    restockItems.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // 计算总成本
    const totalCost = restockItems.reduce((sum, item) => sum + item.totalCost, 0);

    // 估算收益和利润
    const expectedRevenue = restockItems.reduce((sum, item) => {
      const estimatedPrice = item.unitCost * 2.5; // 假设利润率150%
      return sum + item.suggestedQuantity * estimatedPrice;
    }, 0);
    const expectedProfit = expectedRevenue - totalCost;

    // 确定整体优先级
    const hasCritical = restockItems.some(item => item.urgency === 'critical');
    const hasHigh = restockItems.some(item => item.urgency === 'high');
    
    let priority: 'urgent' | 'normal' | 'low' = 'normal';
    if (hasCritical) priority = 'urgent';
    else if (hasHigh) priority = 'normal';
    else priority = 'low';

    return {
      items: restockItems,
      totalCost,
      expectedRevenue,
      expectedProfit,
      priority,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时有效
    };
  }

  /**
   * 生成采购订单
   */
  async generatePurchaseOrders(plan: IRestockPlan): Promise<IPurchaseOrder[]> {
    const orders: Map<string, IPurchaseOrder> = new Map();

    for (const item of plan.items) {
      const supplierId = item.supplierId;
      
      if (!orders.has(supplierId)) {
        orders.set(supplierId, {
          orderId: `PO-${Date.now()}-${supplierId}`,
          supplierId,
          supplierName: item.supplierName,
          items: [],
          totalCost: 0,
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: plan.priority,
          createdAt: new Date(),
        });
      }

      const order = orders.get(supplierId)!;
      order.items.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.suggestedQuantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
      });
      order.totalCost += item.totalCost;

      // 更新优先级
      if (item.urgency === 'critical' || item.urgency === 'high') {
        order.priority = 'urgent';
      }
    }

    return Array.from(orders.values());
  }

  /**
   * 评估供应商
   */
  evaluateSupplier(supplier: ISupplier, productId?: string): ISupplierScore {
    const scores = {
      reliability: supplier.reliabilityScore * 0.4,
      delivery: (100 - Math.min(supplier.avgDeliveryTime * 10, 50)) * 0.3, // 交货越快分数越高
      price: 80 * 0.3, // 默认价格分数，实际应对比
    };

    const totalScore = scores.reliability + scores.delivery + scores.price;

    let recommendation: 'preferred' | 'alternative' | 'not_recommended' = 'alternative';
    if (totalScore >= 80 && supplier.reliabilityScore >= 90) {
      recommendation = 'preferred';
    } else if (supplier.reliabilityScore < 70) {
      recommendation = 'not_recommended';
    }

    return {
      supplierId: supplier.supplierId,
      supplierName: supplier.name,
      score: Math.round(totalScore),
      reliabilityScore: supplier.reliabilityScore,
      priceScore: Math.round(scores.price),
      deliveryScore: Math.round(scores.delivery),
      recommendation,
    };
  }

  /**
   * 对比供应商
   */
  compareSuppliers(suppliers: ISupplier[], productId: string): ISupplierScore[] {
    return suppliers
      .filter(s => s.products.includes(productId))
      .map(s => this.evaluateSupplier(s, productId))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 找到最优供应商
   */
  private findBestSupplier(productId: string, suppliers: ISupplier[]): ISupplier | undefined {
    const compatibleSuppliers = suppliers.filter(s => s.products.includes(productId));
    
    if (compatibleSuppliers.length === 0) {
      return undefined;
    }

    // 按可靠性和交货速度排序
    return compatibleSuppliers.sort((a, b) => {
      const scoreA = a.reliabilityScore - a.avgDeliveryTime * 5;
      const scoreB = b.reliabilityScore - b.avgDeliveryTime * 5;
      return scoreB - scoreA;
    })[0];
  }

  /**
   * 计算补货数量
   */
  private calculateRestockQuantity(
    item: IInventoryItem,
    leadTime: number,
    supplier?: ISupplier,
  ): number {
    // 供货周期
    const effectiveLeadTime = supplier?.avgDeliveryTime || leadTime;
    
    // 目标库存 = 安全库存 + 供货周期销量 + 缓冲库存
    const bufferDays = effectiveLeadTime; // 缓冲天数
    const targetStock = item.safetyStock + item.avgDailySales * (effectiveLeadTime + bufferDays);
    
    // 建议补货量 = 目标库存 - 当前库存
    let suggestedQty = Math.ceil(targetStock - item.currentStock);
    
    // 确保不少于最低补货量
    suggestedQty = Math.max(suggestedQty, Math.ceil(item.avgDailySales * 3)); // 至少补3天销量
    
    // 确保不超过最优库存的2倍
    suggestedQty = Math.min(suggestedQty, item.optimalStock * 2 - item.currentStock);
    
    return Math.max(0, suggestedQty);
  }

  /**
   * 生成补货原因
   */
  private generateRestockReason(item: IInventoryItem, daysUntilStockOut: number): string {
    if (item.currentStock === 0) {
      return '已缺货，需要立即补货';
    }
    
    if (daysUntilStockOut <= 1) {
      return '库存即将耗尽，紧急补货';
    }
    
    if (daysUntilStockOut <= 3) {
      return `预计${daysUntilStockOut.toFixed(1)}天内售完，需要尽快补货`;
    }
    
    if (daysUntilStockOut <= 7) {
      return `当前库存${item.currentStock}个，按日均${item.avgDailySales.toFixed(1)}的速度，预计${daysUntilStockOut.toFixed(1)}天售完`;
    }
    
    return '库存低于安全库存，建议补货';
  }

  /**
   * 优化采购成本
   */
  optimizePurchaseCost(
    plan: IRestockPlan,
    budget: number,
  ): { optimizedPlan: IRestockPlan; savings: number } {
    const optimizedItems: IRestockItem[] = [];
    let remainingBudget = budget;
    let totalCost = 0;

    for (const item of plan.items) {
      if (totalCost + item.totalCost <= budget) {
        optimizedItems.push(item);
        totalCost += item.totalCost;
      } else if (item.urgency === 'critical') {
        // 紧急物品必须补货，即使超出预算
        const affordableQty = Math.floor(remainingBudget / item.unitCost);
        if (affordableQty > 0) {
          optimizedItems.push({
            ...item,
            suggestedQuantity: affordableQty,
            totalCost: affordableQty * item.unitCost,
          });
          remainingBudget -= affordableQty * item.unitCost;
        }
      }
    }

    const originalCost = plan.totalCost;
    const savings = originalCost - totalCost;

    return {
      optimizedPlan: {
        ...plan,
        items: optimizedItems,
        totalCost,
      },
      savings,
    };
  }

  /**
   * 批量补货（合并同一供应商的订单）
   */
  consolidateOrders(plan: IRestockPlan): Map<string, IRestockItem[]> {
    const consolidated = new Map<string, IRestockItem[]>();
    
    for (const item of plan.items) {
      const supplierId = item.supplierId || 'default';
      if (!consolidated.has(supplierId)) {
        consolidated.set(supplierId, []);
      }
      consolidated.get(supplierId)!.push(item);
    }
    
    return consolidated;
  }

  protected async executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<IRestockPlan> {
    const input = data as IRestockInput;
    
    // 使用快速补货算法
    return this.quickRestockPlan(input);
  }
}
