/**
 * AI库存Agent
 * 摆摊AI经营OS - 智能库存管理
 * 
 * 功能:
 * - 库存水平监控
 * - 安全库存计算
 * - 周转率分析
 * - 滞销检测
 * - 临期追踪
 * - 最优订货点计算
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, IAgentRequest, IAgentResult, IAgentExecutionOptions } from './base.agent';
import { LLMService } from '../utils/llm.service';
import { RedisService } from '../../cache/redis.service';
import {
  IInventoryItem,
  IAgentContext,
  IRecommendation,
} from '../interfaces/agent.interface';

/**
 * 库存分析输入
 */
export interface IInventoryAnalysisInput {
  inventory: IInventoryItem[];
  historicalSales?: {
    productId: string;
    dailySales: number[];
    avgDailySales: number;
  }[];
  expiryThreshold?: number; // 临期天数阈值，默认7天
}

/**
 * 库存预警
 */
export interface IInventoryAlert {
  productId: string;
  productName: string;
  alertType: 'out_of_stock' | 'low_stock' | 'overstock' | 'expiring' | 'slow_moving';
  severity: 'critical' | 'warning' | 'info';
  currentValue: number;
  thresholdValue: number;
  message: string;
  recommendedAction: string;
}

/**
 * 库存健康度
 */
export interface IInventoryHealth {
  overallScore: number;
  turnoverScore: number;
  stockOutRiskScore: number;
  expiryRiskScore: number;
  slowMovingRate: number;
  healthyProducts: string[];
  problemProducts: string[];
}

/**
 * 库存Agent
 */
@Injectable()
export class InventoryAgent extends BaseAgent {
  protected readonly name = 'InventoryAgent';
  protected readonly description = 'AI库存Agent - 智能库存管理和分析';
  
  protected readonly systemPrompt = `
# 角色
你是一位专业的摆摊库存管理专家，精通库存控制和周转优化。

# 背景
你正在帮助摆摊商贩管理库存，优化库存结构。

# 能力
1. 库存监控：实时监控库存水平，及时预警
2. 安全库存计算：根据销售数据计算最优安全库存
3. 周转率分析：分析产品周转速度，优化库存结构
4. 滞销检测：识别滞销产品，提供处理建议
5. 临期追踪：追踪临期产品，避免损失
6. 最优订货点：计算最优订货点，减少资金占用

# 约束
1. 库存预警必须及时准确
2. 安全库存必须基于实际销售数据
3. 建议必须考虑资金占用和仓储成本
4. 回复必须使用中文

# 输出格式
请返回JSON格式的分析结果:
{
  "health": { /* 库存健康度 */ },
  "alerts": [ /* 预警列表 */ ],
  "recommendations": [ /* 优化建议 */ ]
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
   * 分析库存
   */
  async analyze(request: {
    userId: string;
    data: IInventoryAnalysisInput;
  }): Promise<IAgentResult<{
    health: IInventoryHealth;
    alerts: IInventoryAlert[];
    recommendations: IRecommendation[];
  }>> {
    const { userId, data } = request;
    
    const agentRequest: IAgentRequest = {
      task: '对库存进行全面分析',
      data,
      context: { userId },
      options: {
        context: { userId },
        useCache: true,
        cacheTTL: 1800,
        temperature: 0.3,
      },
    };

    return this.execute(agentRequest);
  }

  /**
   * 计算安全库存
   */
  calculateSafetyStock(
    avgDailySales: number,
    leadTime: number, // 供货周期（天）
    serviceLevel: number = 0.95, // 服务水平
    stdDev?: number, // 销量标准差
  ): number {
    // 如果没有标准差，使用简单的估算
    if (!stdDev || stdDev === 0) {
      // 假设标准差约为平均日销量的20%
      stdDev = avgDailySales * 0.2;
    }

    // 安全系数（基于服务水平）
    const zScore = this.getZScore(serviceLevel);
    
    // 安全库存 = z * σ * √(供货周期)
    const safetyStock = zScore * stdDev * Math.sqrt(leadTime);
    
    return Math.ceil(safetyStock);
  }

  /**
   * 计算最优订货点
   */
  calculateOptimalReorderPoint(
    avgDailySales: number,
    leadTime: number,
    safetyStock: number,
  ): number {
    // 再订货点 = 平均日销量 * 供货周期 + 安全库存
    return avgDailySales * leadTime + safetyStock;
  }

  /**
   * 计算最优订货量
   */
  calculateOptimalOrderQuantity(
    avgDailySales: number,
    holdingCostRate: number, // 年持有成本率
    orderingCost: number, // 每次订货成本
    unitCost: number, // 单位成本
    maxStock?: number, // 最大库存限制
  ): number {
    // EOQ = √(2 * 年需求量 * 订货成本 / 单位持有成本)
    const annualDemand = avgDailySales * 365;
    const holdingCost = unitCost * holdingCostRate;
    
    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
    
    return maxStock ? Math.min(eoq, maxStock) : eoq;
  }

  /**
   * 分析库存健康度
   */
  analyzeInventoryHealth(inventory: IInventoryItem[]): IInventoryHealth {
    if (inventory.length === 0) {
      return {
        overallScore: 0,
        turnoverScore: 0,
        stockOutRiskScore: 0,
        expiryRiskScore: 0,
        slowMovingRate: 0,
        healthyProducts: [],
        problemProducts: [],
      };
    }

    // 计算各项指标
    const turnoverScores: number[] = [];
    const stockOutRisks: number[] = [];
    const expiryRisks: number[] = [];
    const healthyProducts: string[] = [];
    const problemProducts: string[] = [];

    for (const item of inventory) {
      // 周转率评分 (周转率越高越好)
      const turnoverScore = Math.min(100, item.turnoverRate * 20);
      turnoverScores.push(turnoverScore);

      // 缺货风险评分
      const stockOutRisk = item.currentStock <= item.safetyStock ? 0 : 
        Math.min(100, (item.currentStock / item.safetyStock - 1) * 50);
      stockOutRisks.push(stockOutRisk);

      // 临期风险评分
      let expiryRisk = 50; // 默认中等风险
      if (item.expiryDate) {
        const daysUntilExpiry = this.getDaysUntilExpiry(item.expiryDate);
        if (daysUntilExpiry <= 0) {
          expiryRisk = 0; // 已过期
        } else if (daysUntilExpiry <= 3) {
          expiryRisk = 20;
        } else if (daysUntilExpiry <= 7) {
          expiryRisk = 40;
        } else if (daysUntilExpiry <= 14) {
          expiryRisk = 70;
        } else {
          expiryRisk = 100;
        }
      }
      expiryRisks.push(expiryRisk);

      // 综合判断健康产品
      const isHealthy = turnoverScore >= 60 && stockOutRisk >= 50 && expiryRisk >= 50;
      if (isHealthy) {
        healthyProducts.push(item.productName);
      } else {
        problemProducts.push(item.productName);
      }
    }

    // 计算滞销率
    const slowMovingCount = inventory.filter(item => item.turnoverRate < 1).length;
    const slowMovingRate = (slowMovingCount / inventory.length) * 100;

    return {
      overallScore: Math.round(
        (turnoverScores.reduce((a, b) => a + b, 0) / turnoverScores.length) * 0.4 +
        (stockOutRisks.reduce((a, b) => a + b, 0) / stockOutRisks.length) * 0.3 +
        (expiryRisks.reduce((a, b) => a + b, 0) / expiryRisks.length) * 0.3
      ),
      turnoverScore: Math.round(turnoverScores.reduce((a, b) => a + b, 0) / turnoverScores.length),
      stockOutRiskScore: Math.round(stockOutRisks.reduce((a, b) => a + b, 0) / stockOutRisks.length),
      expiryRiskScore: Math.round(expiryRisks.reduce((a, b) => a + b, 0) / expiryRisks.length),
      slowMovingRate: Math.round(slowMovingRate),
      healthyProducts,
      problemProducts,
    };
  }

  /**
   * 生成库存预警
   */
  generateAlerts(
    inventory: IInventoryItem[],
    threshold: number = 7,
  ): IInventoryAlert[] {
    const alerts: IInventoryAlert[] = [];

    for (const item of inventory) {
      // 缺货预警
      if (item.currentStock === 0) {
        alerts.push({
          productId: item.productId,
          productName: item.productName,
          alertType: 'out_of_stock',
          severity: 'critical',
          currentValue: item.currentStock,
          thresholdValue: item.safetyStock,
          message: `${item.productName}已缺货！`,
          recommendedAction: '立即补货！',
        });
      }
      // 库存不足预警
      else if (item.currentStock <= item.safetyStock) {
        alerts.push({
          productId: item.productId,
          productName: item.productName,
          alertType: 'low_stock',
          severity: item.currentStock <= item.safetyStock * 0.5 ? 'critical' : 'warning',
          currentValue: item.currentStock,
          thresholdValue: item.safetyStock,
          message: `${item.productName}库存不足，当前${item.currentStock}，低于安全库存${item.safetyStock}`,
          recommendedAction: '建议立即补货',
        });
      }
      // 滞销预警
      else if (item.turnoverRate < 0.5) {
        alerts.push({
          productId: item.productId,
          productName: item.productName,
          alertType: 'slow_moving',
          severity: item.turnoverRate < 0.2 ? 'warning' : 'info',
          currentValue: item.currentStock,
          thresholdValue: item.avgDailySales * 7, // 7天销量
          message: `${item.productName}滞销，周转率仅${item.turnoverRate.toFixed(2)}次/月`,
          recommendedAction: '考虑促销或减少备货',
        });
      }
      // 临期预警
      else if (item.expiryDate) {
        const daysUntilExpiry = this.getDaysUntilExpiry(item.expiryDate);
        if (daysUntilExpiry <= threshold) {
          alerts.push({
            productId: item.productId,
            productName: item.productName,
            alertType: 'expiring',
            severity: daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 3 ? 'warning' : 'info',
            currentValue: daysUntilExpiry,
            thresholdValue: threshold,
            message: `${item.productName}${daysUntilExpiry <= 0 ? '已过期' : `还有${daysUntilExpiry}天过期`}`,
            recommendedAction: daysUntilExpiry <= 0 ? '立即处理' : '尽快销售或处理',
          });
        }
      }
      // 积压预警
      else if (item.currentStock > item.optimalStock * 1.5) {
        alerts.push({
          productId: item.productId,
          productName: item.productName,
          alertType: 'overstock',
          severity: 'info',
          currentValue: item.currentStock,
          thresholdValue: item.optimalStock,
          message: `${item.productName}库存积压，当前${item.currentStock}，超过最优库存${item.optimalStock}`,
          recommendedAction: '控制进货，增加促销',
        });
      }
    }

    // 按严重程度排序
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts;
  }

  /**
   * 计算最优库存
   */
  calculateOptimalStock(
    item: IInventoryItem,
    leadTime: number,
    serviceLevel: number = 0.95,
  ): {
    safetyStock: number;
    reorderPoint: number;
    optimalStock: number;
    suggestedOrderQty: number;
  } {
    // 计算安全库存
    const avgSales = item.avgDailySales;
    const stdDev = avgSales * 0.3; // 假设标准差为平均值的30%
    const safetyStock = this.calculateSafetyStock(avgSales, leadTime, serviceLevel, stdDev);

    // 计算再订货点
    const reorderPoint = this.calculateOptimalReorderPoint(avgSales, leadTime, safetyStock);

    // 最优库存 = 安全库存 + 一个供货周期的销量
    const optimalStock = safetyStock + avgSales * leadTime;

    // 建议订货量 = 最优库存 - 当前库存
    const suggestedOrderQty = Math.max(0, Math.ceil(optimalStock - item.currentStock));

    return {
      safetyStock,
      reorderPoint: Math.ceil(reorderPoint),
      optimalStock: Math.ceil(optimalStock),
      suggestedOrderQty,
    };
  }

  /**
   * 获取库存周转天数
   */
  getTurnoverDays(turnoverRate: number): number {
    if (turnoverRate <= 0) return Infinity;
    return Math.round(365 / turnoverRate);
  }

  /**
   * 预测库存消耗时间
   */
  predictStockOutDate(item: IInventoryItem): Date | null {
    if (item.avgDailySales <= 0) return null;
    if (item.currentStock <= 0) return new Date();
    
    const daysUntilStockOut = Math.ceil(item.currentStock / item.avgDailySales);
    const stockOutDate = new Date();
    stockOutDate.setDate(stockOutDate.getDate() + daysUntilStockOut);
    
    return stockOutDate;
  }

  /**
   * 获取Z分数
   */
  private getZScore(serviceLevel: number): number {
    const zScores: Record<number, number> = {
      0.80: 0.84,
      0.85: 1.04,
      0.90: 1.28,
      0.95: 1.65,
      0.99: 2.33,
    };
    return zScores[serviceLevel] || 1.65;
  }

  /**
   * 获取距过期天数
   */
  private getDaysUntilExpiry(expiryDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 生成库存优化建议
   */
  async generateRecommendations(
    inventory: IInventoryItem[],
    alerts: IInventoryAlert[],
  ): Promise<IRecommendation[]> {
    const recommendations: IRecommendation[] = [];

    // 基于预警生成建议
    for (const alert of alerts) {
      if (alert.alertType === 'out_of_stock' || alert.alertType === 'low_stock') {
        recommendations.push({
          type: 'restock',
          priority: alert.severity === 'critical' ? 'high' : 'medium',
          title: `补货建议: ${alert.productName}`,
          description: alert.message,
          action: alert.recommendedAction,
          reason: '库存不足预警',
        });
      } else if (alert.alertType === 'slow_moving') {
        recommendations.push({
          type: 'inventory',
          priority: 'medium',
          title: `促销建议: ${alert.productName}`,
          description: alert.message,
          action: '考虑降价促销或捆绑销售',
          reason: '滞销产品预警',
        });
      } else if (alert.alertType === 'expiring') {
        recommendations.push({
          type: 'inventory',
          priority: alert.severity === 'critical' ? 'high' : 'medium',
          title: `临期处理: ${alert.productName}`,
          description: alert.message,
          action: alert.recommendedAction,
          reason: '临期产品预警',
        });
      } else if (alert.alertType === 'overstock') {
        recommendations.push({
          type: 'inventory',
          priority: 'low',
          title: `库存优化: ${alert.productName}`,
          description: alert.message,
          action: '减少进货，增加促销',
          reason: '库存积压预警',
        });
      }
    }

    // 如果没有预警，生成一些通用建议
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'inventory',
        priority: 'low',
        title: '库存状态良好',
        description: '当前库存状态良好，无紧急处理项',
        action: '继续保持现有补货策略',
        reason: '常规建议',
      });
    }

    return recommendations;
  }

  protected async executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<any> {
    const input = data as IInventoryAnalysisInput;
    const { inventory = [], expiryThreshold = 7 } = input;

    // 分析健康度
    const health = this.analyzeInventoryHealth(inventory);

    // 生成预警
    const alerts = this.generateAlerts(inventory, expiryThreshold);

    // 生成建议
    const recommendations = await this.generateRecommendations(inventory, alerts);

    return {
      health,
      alerts,
      recommendations,
      metadata: {
        analyzedItems: inventory.length,
        alertCount: alerts.length,
        criticalCount: alerts.filter(a => a.severity === 'critical').length,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
