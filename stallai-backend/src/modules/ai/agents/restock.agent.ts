/**
 * 补货代理
 * Restock Agent
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RestockAgent extends BaseAgent {
  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * 生成补货建议
   */
  async generateSuggestions(inventory: any[]) {
    const items = [];

    for (const item of inventory) {
      if (item.status === 'low' || item.status === 'out') {
        const recommendedStock = (item.dailySales || 5) * 7 + (item.threshold || 10) * 2;
        const quantity = Math.max(0, recommendedStock - item.currentStock);

        items.push({
          productName: item.product?.name || '未知商品',
          currentStock: item.currentStock,
          recommendedStock,
          quantity,
          estimatedCost: quantity * (item.product?.cost || 10),
          supplier: this.getSupplier(item.product?.category),
          priority: item.currentStock === 0 ? 'high' : 'medium',
        });
      }
    }

    return {
      items,
      totalCost: items.reduce((sum, i) => sum + i.estimatedCost, 0),
      priority: items.some(i => i.priority === 'high') ? 'high' : 'medium',
    };
  }

  private getSupplier(category?: string): string {
    const suppliers: Record<string, string> = {
      '饮品': '广州茶饮原料批发',
      '甜品': '四川冰粉原料供应商',
      '小吃': '山东肉制品批发中心',
    };
    return suppliers[category || '其他'] || '综合批发商';
  }

  protected getMockResponse(prompt: string): string {
    return '补货建议已生成';
  }
}
