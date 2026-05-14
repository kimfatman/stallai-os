/**
 * 趋势代理
 * Trend Agent
 * 
 * 预测市场趋势和爆款商品
 */

import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';
import { ConfigService } from '@nestjs/config';

interface TrendPrediction {
  id: string;
  name: string;
  category: string;
  popularity: number;
  heatLevel: string;
  startDate: string;
  peakDate: string;
  confidence: number;
  reasons: string[];
}

interface MarketTrend {
  id: string;
  name: string;
  category: string;
  popularity: number;
  trend: 'up' | 'down' | 'stable';
}

@Injectable()
export class TrendAgent extends BaseAgent {
  // 市场热点数据
  private hotItems = [
    { name: '网红辣条', category: '零食', heat: 95, reasons: ['社交媒体热度上升', '年轻人群追捧', '利润空间大'] },
    { name: '手工冰粉', category: '甜品', heat: 88, reasons: ['夏季需求增加', '制作简单', '成本低'] },
    { name: '即食鸡爪', category: '卤味', heat: 82, reasons: ['电商平台热销', '适合外带', '复购率高'] },
    { name: '脆皮烤肠', category: '小吃', heat: 78, reasons: ['经典产品', '客单价高', '易于标准化'] },
    { name: '柠檬茶系列', category: '饮品', heat: 75, reasons: ['清爽解腻', '利润高', '四季皆宜'] },
    { name: '预制菜半成品', category: '新品类', heat: 72, reasons: ['懒人经济', '方便快捷', '毛利高'] },
  ];

  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * 获取趋势预测
   */
  async predict(period: 'week' | 'month' | 'quarter'): Promise<{
    summary: string;
    predictions: TrendPrediction[];
    trendChart: {
      labels: string[];
      data: number[];
    };
  }> {
    const predictions = this.generatePredictions(period);
    const trendChart = this.generateTrendChart(period);

    return {
      summary: `基于市场数据分析，以下商品预计将在${this.getPeriodLabel(period)}内成为爆款。`,
      predictions,
      trendChart,
    };
  }

  /**
   * 获取市场趋势
   */
  async getTrends(): Promise<{ trends: MarketTrend[] }> {
    const trends: MarketTrend[] = this.hotItems.map((item, index) => ({
      id: `trend-${index + 1}`,
      name: item.name,
      category: item.category,
      popularity: item.heat,
      trend: item.heat > 80 ? 'up' : item.heat > 60 ? 'stable' : 'down',
    }));

    return { trends };
  }

  /**
   * 生成预测
   */
  private generatePredictions(period: 'week' | 'month' | 'quarter'): TrendPrediction[] {
    const today = new Date();
    const startDays = period === 'week' ? 3 : period === 'month' ? 5 : 7;
    const peakDays = period === 'week' ? 7 : period === 'month' ? 14 : 30;

    return this.hotItems.slice(0, 3).map((item, index) => ({
      id: `pred-${index + 1}`,
      name: item.name,
      category: item.category,
      popularity: item.heat,
      heatLevel: item.heat >= 90 ? '极热' : item.heat >= 80 ? '很热' : '较热',
      startDate: this.formatDate(new Date(today.getTime() + startDays * 24 * 60 * 60 * 1000)),
      peakDate: this.formatDate(new Date(today.getTime() + peakDays * 24 * 60 * 60 * 1000)),
      confidence: 75 + Math.floor(Math.random() * 20),
      reasons: item.reasons,
    }));
  }

  /**
   * 生成趋势图表数据
   */
  private generateTrendChart(period: 'week' | 'month' | 'quarter'): {
    labels: string[];
    data: number[];
  } {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const labels: string[] = [];
    const data: number[] = [];

    const baseValue = 65;
    let currentValue = baseValue;

    for (let i = 0; i < days; i++) {
      if (period === 'week') {
        labels.push(['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]);
      } else {
        labels.push(`${i + 1}`);
      }

      // 模拟增长趋势 + 随机波动
      currentValue = Math.min(100, currentValue + (Math.random() * 5 - 1));
      data.push(Math.round(currentValue));
    }

    return { labels, data };
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return `${date.getMonth() + 1}天后`;
  }

  /**
   * 获取周期标签
   */
  private getPeriodLabel(period: 'week' | 'month' | 'quarter'): string {
    const labels = {
      week: '7天',
      month: '30天',
      quarter: '90天',
    };
    return labels[period];
  }

  /**
   * 获取模拟响应
   */
  protected getMockResponse(prompt: string): string {
    return JSON.stringify(this.hotItems.slice(0, 3));
  }
}
