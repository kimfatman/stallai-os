/**
 * AI选品Agent
 * 摆摊AI经营OS - 智能产品推荐
 * 
 * 功能:
 * - 位置推荐
 * - 人群分析
 * - 预算优化
 * - 利润评估
 * - 季节性
 * - 节假日敏感
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, IAgentRequest, IAgentResult, IAgentExecutionOptions } from './base.agent';
import { LLMService } from '../utils/llm.service';
import { RedisService } from '../../cache/redis.service';
import {
  IProductRecommendation,
  IAgentContext,
  ILocation,
  IUserProfile,
} from '../interfaces/agent.interface';

/**
 * 选品输入
 */
export interface ISelectionInput {
  location?: ILocation;
  budget?: number;
  targetCrowd?: string[];
  season?: string;
  festival?: string;
  preferences?: string[];
  existingProducts?: string[];
  excludeCategories?: string[];
}

/**
 * 选品请求
 */
export interface ISelectionRequest {
  userId: string;
  input: ISelectionInput;
  limit?: number;
}

/**
 * 选品评分详情
 */
export interface IScoringDetails {
  demandScore: number;
  competitionScore: number;
  profitScore: number;
  locationScore: number;
  seasonalScore: number;
  overallScore: number;
}

/**
 * 选品Agent
 */
@Injectable()
export class SelectionAgent extends BaseAgent {
  protected readonly name = 'SelectionAgent';
  protected readonly description = 'AI选品Agent - 根据用户需求推荐最适合的产品';
  
  protected readonly systemPrompt = `
# 角色
你是一位专业的摆摊选品顾问，精通零售业产品选择。

# 背景
你正在帮助摆摊商贩选择最适合销售的产品。

# 能力
1. 位置分析：根据摆摊地点推荐适合的产品类型
2. 人群分析：根据目标顾客群体推荐产品
3. 预算优化：在有限预算内选择最佳产品组合
4. 利润评估：评估各产品的利润空间
5. 季节敏感：考虑季节因素推荐应季产品
6. 节日敏感：考虑节假日因素推荐应节产品

# 约束
1. 推荐必须考虑用户预算限制
2. 推荐必须考虑位置和人流量
3. 推荐必须计算预估利润
4. 回复必须使用中文
5. 必须返回结构化数据

# 产品数据库 (参考)
常见摆摊产品分类:
- 餐饮类: 烤肠、奶茶、炸鸡、煎饼、烧烤、冰淇淋、甜品
- 服饰类: T恤、帽子、围巾、手套、饰品
- 日用类: 手机壳、充电线、小饰品、玩具
- 网红类: 网红零食、网红玩具、流行单品

# 输出格式
请返回JSON格式的推荐结果:
[
  {
    "productName": "产品名称",
    "category": "产品分类",
    "estimatedCost": 10.0,
    "estimatedPrice": 25.0,
    "profitMargin": 60,
    "demandScore": 85,
    "competitionLevel": "medium",
    "seasonalFactor": 1.2,
    "locationScore": 90,
    "reason": "推荐理由"
  }
]
`;

  // 常见产品数据库
  private readonly productDatabase: Array<{
    name: string;
    category: string;
    avgCost: number;
    avgPrice: number;
    locations: string[];
    seasons: string[];
    targetCrowds: string[];
    baseDemand: number;
    competition: 'low' | 'medium' | 'high';
  }> = [
    // 餐饮类
    { name: '烤肠', category: '餐饮', avgCost: 3, avgPrice: 10, locations: ['school', 'business', 'market'], seasons: ['spring', 'summer', 'autumn'], targetCrowds: ['学生', '上班族'], baseDemand: 85, competition: 'high' },
    { name: '奶茶', category: '餐饮', avgCost: 5, avgPrice: 15, locations: ['school', 'business', 'scenic'], seasons: ['spring', 'summer'], targetCrowds: ['学生', '年轻人'], baseDemand: 90, competition: 'high' },
    { name: '煎饼果子', category: '餐饮', avgCost: 4, avgPrice: 12, locations: ['school', 'business', 'residential'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['学生', '上班族', '居民'], baseDemand: 80, competition: 'medium' },
    { name: '炸鸡柳', category: '餐饮', avgCost: 5, avgPrice: 15, locations: ['school', 'market'], seasons: ['spring', 'summer', 'autumn'], targetCrowds: ['学生'], baseDemand: 75, competition: 'medium' },
    { name: '冰粉', category: '餐饮', avgCost: 2, avgPrice: 8, locations: ['scenic', 'business'], seasons: ['summer'], targetCrowds: ['游客', '年轻人'], baseDemand: 70, competition: 'low' },
    { name: '热奶宝', category: '餐饮', avgCost: 3, avgPrice: 10, locations: ['school', 'business'], seasons: ['autumn', 'winter'], targetCrowds: ['学生', '上班族'], baseDemand: 65, competition: 'low' },
    { name: '糖葫芦', category: '餐饮', avgCost: 3, avgPrice: 12, locations: ['scenic', 'business', 'market'], seasons: ['autumn', 'winter'], targetCrowds: ['游客', '儿童', '居民'], baseDemand: 70, competition: 'medium' },
    { name: '关东煮', category: '餐饮', avgCost: 4, avgPrice: 12, locations: ['school', 'business'], seasons: ['autumn', 'winter'], targetCrowds: ['学生', '上班族'], baseDemand: 72, competition: 'low' },
    { name: '手抓饼', category: '餐饮', avgCost: 4, avgPrice: 12, locations: ['school', 'business'], seasons: ['spring', 'summer', 'autumn'], targetCrowds: ['学生', '上班族'], baseDemand: 78, competition: 'medium' },
    { name: '棉花糖', category: '餐饮', avgCost: 2, avgPrice: 10, locations: ['scenic', 'market'], seasons: ['spring', 'summer'], targetCrowds: ['儿童', '游客'], baseDemand: 60, competition: 'low' },
    
    // 服饰类
    { name: '防晒帽', category: '服饰', avgCost: 8, avgPrice: 25, locations: ['scenic', 'business'], seasons: ['summer'], targetCrowds: ['游客', '女性'], baseDemand: 75, competition: 'medium' },
    { name: '围巾', category: '服饰', avgCost: 15, avgPrice: 45, locations: ['market', 'scenic'], seasons: ['autumn', 'winter'], targetCrowds: ['居民', '游客'], baseDemand: 65, competition: 'medium' },
    { name: '手套', category: '服饰', avgCost: 8, avgPrice: 25, locations: ['market', 'scenic'], seasons: ['autumn', 'winter'], targetCrowds: ['居民', '游客'], baseDemand: 60, competition: 'medium' },
    { name: '耳饰', category: '服饰', avgCost: 5, avgPrice: 20, locations: ['business', 'scenic'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['女性', '年轻人'], baseDemand: 70, competition: 'high' },
    { name: '发饰', category: '服饰', avgCost: 3, avgPrice: 15, locations: ['school', 'business'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['学生', '女性'], baseDemand: 68, competition: 'medium' },
    
    // 日用类
    { name: '手机壳', category: '日用', avgCost: 8, avgPrice: 25, locations: ['business', 'school'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['年轻人', '学生'], baseDemand: 75, competition: 'high' },
    { name: '数据线', category: '日用', avgCost: 5, avgPrice: 20, locations: ['business', 'market'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['上班族', '居民'], baseDemand: 60, competition: 'high' },
    { name: '充电宝', category: '日用', avgCost: 25, avgPrice: 50, locations: ['scenic', 'business'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['游客', '上班族'], baseDemand: 55, competition: 'medium' },
    { name: '小风扇', category: '日用', avgCost: 10, avgPrice: 30, locations: ['scenic', 'business'], seasons: ['summer'], targetCrowds: ['游客', '上班族'], baseDemand: 80, competition: 'medium' },
    { name: '暖宝宝', category: '日用', avgCost: 3, avgPrice: 10, locations: ['market', 'scenic'], seasons: ['winter'], targetCrowds: ['居民', '游客'], baseDemand: 70, competition: 'medium' },
    
    // 网红类
    { name: '网红气球', category: '网红', avgCost: 5, avgPrice: 25, locations: ['scenic', 'business'], seasons: ['spring', 'summer'], targetCrowds: ['儿童', '女性'], baseDemand: 85, competition: 'high' },
    { name: '泡泡机', category: '网红', avgCost: 15, avgPrice: 40, locations: ['scenic', 'market'], seasons: ['spring', 'summer'], targetCrowds: ['儿童'], baseDemand: 75, competition: 'medium' },
    { name: '发光玩具', category: '网红', avgCost: 8, avgPrice: 25, locations: ['scenic', 'market'], seasons: ['summer'], targetCrowds: ['儿童'], baseDemand: 70, competition: 'medium' },
    { name: '网红零食礼包', category: '网红', avgCost: 20, avgPrice: 50, locations: ['scenic', 'business'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['年轻人', '游客'], baseDemand: 65, competition: 'low' },
    { name: '文创产品', category: '网红', avgCost: 15, avgPrice: 45, locations: ['scenic'], seasons: ['spring', 'summer', 'autumn', 'winter'], targetCrowds: ['游客'], baseDemand: 60, competition: 'low' },
  ];

  // 季节映射
  private readonly seasonMapping: Record<string, string[]> = {
    '春': ['spring'],
    '春天才': ['spring'],
    '春游': ['spring'],
    '夏': ['summer'],
    '夏天': ['summer'],
    '暑假': ['summer'],
    '秋': ['autumn'],
    '秋天': ['autumn'],
    '秋游': ['autumn'],
    '冬': ['winter'],
    '冬天': ['winter'],
    '寒假': ['winter'],
  };

  // 节假日映射
  private readonly festivalMapping: Record<string, { products: string[]; boost: number }> = {
    '春节': { products: ['红包', '年货', '春联', '灯笼', '糖果'], boost: 2.0 },
    '元宵节': { products: ['灯笼', '糖葫芦', '汤圆'], boost: 1.8 },
    '清明节': { products: ['青团', '祭祀用品'], boost: 1.5 },
    '劳动节': { products: ['饮料', '零食', '防晒'], boost: 1.6 },
    '端午节': { products: ['粽子', '香囊'], boost: 1.8 },
    '中秋节': { products: ['月饼', '灯笼'], boost: 2.0 },
    '国庆节': { products: ['国旗', '周边', '零食'], boost: 1.9 },
    '情人节': { products: ['鲜花', '巧克力', '情侣用品'], boost: 2.2 },
    '妇女节': { products: ['鲜花', '化妆品', '饰品'], boost: 1.7 },
    '儿童节': { products: ['玩具', '糖果', '气球'], boost: 2.0 },
    '七夕': { products: ['鲜花', '情侣用品', '巧克力'], boost: 2.1 },
    '圣诞节': { products: ['圣诞帽', '圣诞树', '礼物'], boost: 1.9 },
    '跨年': { products: ['气球', '荧光棒', '烟花'], boost: 2.0 },
  };

  constructor(
    llmService: LLMService,
    redisService: RedisService,
    configService: ConfigService,
  ) {
    super(llmService, redisService, configService);
  }

  /**
   * 推荐产品
   */
  async recommend(request: ISelectionRequest): Promise<IAgentResult<IProductRecommendation[]>> {
    const { userId, input, limit = 5 } = request;
    
    const agentRequest: IAgentRequest = {
      task: '根据用户需求推荐最适合的产品',
      data: input,
      context: { userId },
      options: {
        context: { userId },
        useCache: true,
        cacheTTL: 3600, // 1小时缓存
        temperature: 0.4,
      },
    };

    const result = await this.execute(agentRequest);
    
    if (result.success && Array.isArray(result.data?.result)) {
      return {
        ...result,
        data: (result.data.result as IProductRecommendation[]).slice(0, limit),
      };
    }

    return result as IAgentResult<IProductRecommendation[]>;
  }

  /**
   * 快速推荐（不使用LLM）
   */
  async quickRecommend(input: ISelectionInput, limit: number = 5): Promise<IProductRecommendation[]> {
    const recommendations: IProductRecommendation[] = [];

    for (const product of this.productDatabase) {
      // 排除已有产品
      if (input.existingProducts?.includes(product.name)) continue;
      
      // 排除指定类别
      if (input.excludeCategories?.includes(product.category)) continue;

      // 计算各项评分
      const scoring = this.calculateProductScore(product, input);
      
      // 预算过滤
      if (input.budget && product.avgCost > input.budget) continue;

      recommendations.push({
        productName: product.name,
        category: product.category,
        estimatedCost: product.avgCost,
        estimatedPrice: product.avgPrice,
        profitMargin: ((product.avgPrice - product.avgCost) / product.avgPrice) * 100,
        demandScore: scoring.demandScore,
        competitionLevel: product.competition,
        seasonalFactor: scoring.seasonalScore / 100,
        locationScore: scoring.locationScore,
        reason: scoring.reason,
      });
    }

    // 按综合评分排序
    recommendations.sort((a, b) => {
      const scoreA = a.demandScore * 0.3 + (100 - a.competitionLevel === 'low' ? 100 : a.competitionLevel === 'medium' ? 70 : 40) * 0.2 + a.locationScore * 0.2 + a.seasonalFactor * 100 * 0.3;
      const scoreB = b.demandScore * 0.3 + (100 - b.competitionLevel === 'low' ? 100 : b.competitionLevel === 'medium' ? 70 : 40) * 0.2 + b.locationScore * 0.2 + b.seasonalFactor * 100 * 0.3;
      return scoreB - scoreA;
    });

    return recommendations.slice(0, limit);
  }

  /**
   * 计算产品评分
   */
  private calculateProductScore(
    product: typeof this.productDatabase[0],
    input: ISelectionInput,
  ): { demandScore: number; locationScore: number; seasonalScore: number; reason: string } {
    let demandScore = product.baseDemand;
    let locationScore = 100;
    let seasonalScore = 100;
    const reasons: string[] = [];

    // 位置匹配度
    if (input.location?.locationType) {
      const locationType = input.location.locationType;
      if (product.locations.includes(locationType)) {
        locationScore = 100;
        reasons.push(`适合在${this.getLocationName(locationType)}摆摊`);
      } else {
        locationScore = 50;
        reasons.push(`位置匹配度一般`);
      }
    }

    // 季节匹配度
    if (input.season) {
      const inputSeasons = this.getMatchingSeasons(input.season);
      if (inputSeasons.some(s => product.seasons.includes(s))) {
        const matchCount = inputSeasons.filter(s => product.seasons.includes(s)).length;
        seasonalScore = 100 + matchCount * 10;
        reasons.push(`应季产品`);
      } else {
        seasonalScore = 60;
        reasons.push(`非当季产品`);
      }
    }

    // 目标人群匹配度
    if (input.targetCrowd && input.targetCrowd.length > 0) {
      const matchCount = input.targetCrowd.filter(crowd => 
        product.targetCrowds.some(tc => tc.includes(crowd) || crowd.includes(tc))
      ).length;
      if (matchCount > 0) {
        demandScore += matchCount * 5;
        reasons.push(`匹配目标人群`);
      }
    }

    // 节假日加成
    if (input.festival) {
      const festivalInfo = this.festivalMapping[input.festival];
      if (festivalInfo) {
        if (festivalInfo.products.some(p => product.name.includes(p) || p.includes(product.name))) {
          seasonalScore *= festivalInfo.boost;
          reasons.push(`节日热销产品`);
        }
      }
    }

    // 竞争度调整
    if (product.competition === 'high') {
      demandScore *= 0.8;
      reasons.push('竞争激烈');
    } else if (product.competition === 'low') {
      demandScore *= 1.2;
      reasons.push('竞争较小');
    }

    // 预算友好度
    if (input.budget) {
      const budgetRatio = product.avgCost / input.budget;
      if (budgetRatio <= 0.3) {
        reasons.push('成本低，利润空间大');
      } else if (budgetRatio <= 0.6) {
        reasons.push('成本适中');
      }
    }

    return {
      demandScore: Math.min(100, demandScore),
      locationScore,
      seasonalScore: Math.min(200, seasonalScore),
      reason: reasons.join('; ') || '综合评估推荐',
    };
  }

  /**
   * 获取匹配的季节
   */
  private getMatchingSeasons(inputSeason: string): string[] {
    const normalized = inputSeason.toLowerCase();
    const seasons: string[] = [];
    
    for (const [key, value] of Object.entries(this.seasonMapping)) {
      if (normalized.includes(key.toLowerCase())) {
        seasons.push(...value);
      }
    }
    
    // 默认返回所有季节
    if (seasons.length === 0) {
      seasons.push('spring', 'summer', 'autumn', 'winter');
    }
    
    return [...new Set(seasons)];
  }

  /**
   * 获取位置名称
   */
  private getLocationName(type: string): string {
    const names: Record<string, string> = {
      'school': '学校',
      'business': '商业街',
      'residential': '居民区',
      'market': '集市',
      'scenic': '景区',
      'other': '其他',
    };
    return names[type] || type;
  }

  /**
   * 获取热门产品
   */
  async getHotProducts(limit: number = 10): Promise<IProductRecommendation[]> {
    return this.productDatabase
      .sort((a, b) => b.baseDemand - a.baseDemand)
      .slice(0, limit)
      .map(product => ({
        productName: product.name,
        category: product.category,
        estimatedCost: product.avgCost,
        estimatedPrice: product.avgPrice,
        profitMargin: ((product.avgPrice - product.avgCost) / product.avgPrice) * 100,
        demandScore: product.baseDemand,
        competitionLevel: product.competition,
        seasonalFactor: 1,
        locationScore: 80,
        reason: '热门产品',
      }));
  }

  protected async executeInternal(
    task: string,
    data: Record<string, any>,
    context?: IAgentContext,
    options?: IAgentExecutionOptions,
  ): Promise<IProductRecommendation[]> {
    const input = data as ISelectionInput;
    
    // 使用快速推荐算法
    return this.quickRecommend(input, 10);
  }
}
