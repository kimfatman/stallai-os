/**
 * 库存代理
 * Inventory Agent
 * 
 * 监控库存状态，提供补货建议
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ConfigService } from '@nestjs/config';

interface InventoryItem {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  dailySales: number;
  daysUntilStockout: number;
  recommendation: 'urgent' | 'soon' | 'normal';
}

@Injectable()
export class InventoryAgent extends BaseAgent {
  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * 分析库存
   */
  async analyze(inventory: any[]): Promise<{
    alerts: InventoryItem[];
    summary: string;
    suggestions: string[];
  }> {
    const alerts = inventory
      .filter((item) => item.status === 'low' || item.status === 'out')
      .map((item) => this.analyzeItem(item));

    const urgentItems = alerts.filter((a) => a.recommendation === 'urgent');
    const soonItems = alerts.filter((a) => a.recommendation === 'soon');

    const summary = this.generateSummary(urgentItems.length, soonItems.length);
    const suggestions = this.generateSuggestions(alerts);

    return { alerts, summary, suggestions };
  }

  /**
   * 分析单个库存项
   */
  private analyzeItem(item: any): InventoryItem {
    const daysUntilStockout = item.dailySales
      ? Math.floor(item.currentStock / item.dailySales)
      : 999;

    let recommendation: 'urgent' | 'soon' | 'normal' = 'normal';
    if (item.currentStock === 0) {
      recommendation = 'urgent';
    } else if (daysUntilStockout < 3) {
      recommendation = 'urgent';
    } else if (daysUntilStockout < 7) {
      recommendation = 'soon';
    }

    return {
      productId: item.productId,
      productName: item.product?.name || '未知商品',
      currentStock: item.currentStock,
      threshold: item.threshold,
      dailySales: item.dailySales || 5,
      daysUntilStockout: Math.max(0, daysUntilStockout),
      recommendation,
    };
  }

  /**
   * 生成摘要
   */
  private generateSummary(urgent: number, soon: number): string {
    if (urgent === 0 && soon === 0) {
      return '库存状况良好，所有商品库存充足';
    }

    const parts = [];
    if (urgent > 0) {
      parts.push(`${urgent}件商品需要立即补货`);
    }
    if (soon > 0) {
      parts.push(`${soon}件商品需要在近期补货`);
    }

    return parts.join('，') + '，请及时处理';
  }

  /**
   * 生成建议
   */
  private generateSuggestions(alerts: InventoryItem[]): string[] {
    const suggestions: string[] = [];

    const urgentItems = alerts.filter((a) => a.recommendation === 'urgent');
    const soonItems = alerts.filter((a) => a.recommendation === 'soon');

    if (urgentItems.length > 0) {
      const names = urgentItems.map((i) => i.productName).join('、');
      suggestions.push(`紧急：${names}库存不足，请立即补货`);
    }

    if (soonItems.length > 0) {
      const names = soonItems.map((i) => i.productName).join('、');
      suggestions.push(`提醒：${names}库存将在7天内耗尽，建议提前备货`);
    }

    suggestions.push('建议与供应商建立稳定的供货关系，确保及时补货');
    suggestions.push('可考虑增加安全库存量，减少缺货风险');

    return suggestions;
  }

  /**
   * 获取模拟响应
   */
  protected getMockResponse(prompt: string): string {
    return '库存分析完成，建议关注库存预警商品。';
  }
}
