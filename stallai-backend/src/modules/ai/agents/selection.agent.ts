/**
 * 选品代理
 * Selection Agent
 * 
 * 基于市场趋势和用户数据推荐商品
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ConfigService } from '@nestjs/config';

interface ProductRecommendation {
  id: string;
  name: string;
  category: string;
  profitRate: number;
  salesVolume: number;
  trend: 'up' | 'down' | 'stable';
  reason: string;
  supplier: string;
  price: string;
}

@Injectable()
export class SelectionAgent extends BaseAgent {
  // 预设的热门商品数据
  private hotProducts = [
    { name: '网红柠檬茶', category: '饮品', profitRate: 65, basePrice: 15 },
    { name: '手工冰粉', category: '甜品', profitRate: 72, basePrice: 12 },
    { name: '脆皮烤肠', category: '小吃', profitRate: 55, basePrice: 8 },
    { name: '铁板鱿鱼', category: '小吃', profitRate: 58, basePrice: 20 },
    { name: '奶茶冰沙', category: '饮品', profitRate: 68, basePrice: 18 },
    { name: '芝士土豆', category: '小吃', profitRate: 62, basePrice: 10 },
  ];

  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * 获取推荐
   */
  async getRecommendations(
    type: 'all' | 'hot' | 'profit' | 'seasonal',
  ): Promise<{
    summary: string;
    products: ProductRecommendation[];
    marketInsights: string[];
  }> {
    let products: ProductRecommendation[];

    switch (type) {
      case 'hot':
        products = this.getHotProducts();
        break;
      case 'profit':
        products = this.getProfitProducts();
        break;
      case 'seasonal':
        products = this.getSeasonalProducts();
        break;
      default:
        products = this.getAllProducts();
    }

    const marketInsights = this.getMarketInsights();

    return {
      summary: `根据当前市场趋势分析，为您推荐以下${products.length}款热门商品。`,
      products,
      marketInsights,
    };
  }

  /**
   * 获取热销产品
   */
  private getHotProducts(): ProductRecommendation[] {
    return this.hotProducts
      .sort((a, b) => b.basePrice * (b.profitRate / 100) - a.basePrice * (a.profitRate / 100))
      .slice(0, 3)
      .map((p, i) => this.mapToRecommendation(p, 'up', i));
  }

  /**
   * 获取高利润产品
   */
  private getProfitProducts(): ProductRecommendation[] {
    return this.hotProducts
      .sort((a, b) => b.profitRate - a.profitRate)
      .slice(0, 3)
      .map((p, i) => this.mapToRecommendation(p, 'stable', i));
  }

  /**
   * 获取季节性产品
   */
  private getSeasonalProducts(): ProductRecommendation[] {
    const seasonal = this.hotProducts.filter((p) =>
      ['饮品', '甜品'].includes(p.category),
    );
    return seasonal.slice(0, 3).map((p, i) => this.mapToRecommendation(p, 'up', i));
  }

  /**
   * 获取全部推荐
   */
  private getAllProducts(): ProductRecommendation[] {
    return this.hotProducts.map((p, i) => this.mapToRecommendation(p, 'up', i));
  }

  /**
   * 映射为推荐商品
   */
  private mapToRecommendation(
    product: { name: string; category: string; profitRate: number; basePrice: number },
    trend: 'up' | 'down' | 'stable',
    index: number,
  ): ProductRecommendation {
    const suppliers = [
      '广州茶饮原料批发',
      '四川冰粉原料供应商',
      '山东肉制品批发中心',
      '杭州包装材料厂',
      '深圳厨具设备商城',
      '上海网红食品批发',
    ];

    return {
      id: `rec-${index + 1}`,
      name: product.name,
      category: product.category,
      profitRate: product.profitRate,
      salesVolume: Math.floor(Math.random() * 1000) + 500,
      trend,
      reason: this.getReason(product),
      supplier: suppliers[index % suppliers.length],
      price: `¥${product.basePrice.toFixed(0)}`,
    };
  }

  /**
   * 获取推荐理由
   */
  private getReason(product: { name: string; category: string; profitRate: number }): string {
    const reasons = [
      '夏季热销，复购率高',
      '成本低，利润空间大',
      '操作简单，适合新手',
      '社交媒体热度高',
      '适合外带，方便快捷',
      '年轻群体追捧',
    ];

    if (product.profitRate > 65) {
      return '利润率高于行业平均水平，值得重点关注';
    }

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * 获取市场洞察
   */
  private getMarketInsights(): string[] {
    return [
      '最近一周饮品品类搜索量上涨 45%',
      '网红零食在小红书热度持续走高',
      '建议关注新品类：预制菜半成品',
      '夜市经济复苏，周末客流量明显增加',
    ];
  }

  /**
   * 获取模拟响应
   */
  protected getMockResponse(prompt: string): string {
    return JSON.stringify(this.getAllProducts());
  }
}
