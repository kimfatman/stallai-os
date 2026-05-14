/**
 * AI Controller - REST API控制器
 * 摆摊AI经营OS - AI系统REST接口
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AIService, IAnalyzeBusinessRequest, IRecommendProductsRequest, IGenerateRestockPlanRequest, IChatRequest } from './ai.service';
import {
  IAnalysisResult,
  IProductRecommendation,
  IRestockPlan,
  ITrendPrediction,
  IDailyReport,
  IOrder,
  IInventoryItem,
} from './interfaces/agent.interface';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('api/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  /**
   * 获取AI一句话总结
   * GET /api/ai/summary
   */
  @Get('summary')
  @ApiOperation({ summary: '获取AI一句话总结' })
  @ApiQuery({ name: 'userId', required: true, description: '用户ID' })
  @ApiResponse({ status: 200, description: 'AI总结结果' })
  async getAISummary(@Query('userId') userId: string) {
    return this.aiService.getAISummary(userId);
  }

  /**
   * 获取经营评分
   * GET /api/ai/score
   */
  @Get('score')
  @ApiOperation({ summary: '获取经营评分' })
  @ApiQuery({ name: 'userId', required: true, description: '用户ID' })
  @ApiResponse({ status: 200, description: '经营评分' })
  async getBusinessScore(@Query('userId') userId: string) {
    return this.aiService.getBusinessScore(userId);
  }

  /**
   * 完整业务分析
   * POST /api/ai/analyze
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '完整业务分析' })
  @ApiResponse({ status: 200, description: '分析结果' })
  async analyzeBusiness(@Body() request: IAnalyzeBusinessRequest) {
    return this.aiService.analyzeBusiness(request);
  }

  /**
   * 推荐产品
   * POST /api/ai/recommend
   */
  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '智能推荐产品' })
  @ApiResponse({ status: 200, description: '产品推荐列表' })
  async recommendProducts(@Body() request: IRecommendProductsRequest) {
    return this.aiService.recommendProducts(request);
  }

  /**
   * 生成补货计划
   * POST /api/ai/restock
   */
  @Post('restock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成补货计划' })
  @ApiResponse({ status: 200, description: '补货计划' })
  async generateRestockPlan(@Body() request: IGenerateRestockPlanRequest) {
    return this.aiService.generateRestockPlan(request);
  }

  /**
   * 预测爆款
   * GET /api/ai/bestsellers
   */
  @Get('bestsellers')
  @ApiOperation({ summary: '预测爆款产品' })
  @ApiQuery({ name: 'userId', required: true, description: '用户ID' })
  @ApiResponse({ status: 200, description: '爆款预测列表' })
  async predictBestsellers(@Query('userId') userId: string) {
    return this.aiService.predictBestsellers(userId);
  }

  /**
   * 生成日报
   * POST /api/ai/daily-report
   */
  @Post('daily-report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成每日经营报告' })
  @ApiResponse({ status: 200, description: '日报数据' })
  async generateDailyReport(
    @Body() body: {
      userId: string;
      date: string;
      orders: IOrder[];
      inventory: IInventoryItem[];
    },
  ) {
    return this.aiService.generateDailyReport(
      body.userId,
      body.date,
      body.orders,
      body.inventory,
    );
  }

  /**
   * AI聊天
   * POST /api/ai/chat
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI智能对话' })
  @ApiResponse({ status: 200, description: '聊天回复' })
  async chat(@Body() request: IChatRequest) {
    return this.aiService.chat(request);
  }

  /**
   * 获取Agent状态
   * GET /api/ai/status
   */
  @Get('status')
  @ApiOperation({ summary: '获取AI Agent状态' })
  @ApiResponse({ status: 200, description: 'Agent健康状态' })
  async getAgentStatus() {
    return this.aiService.getAgentStatus();
  }

  /**
   * 快速产品推荐
   * GET /api/ai/quick-recommend
   */
  @Get('quick-recommend')
  @ApiOperation({ summary: '快速产品推荐' })
  @ApiQuery({ name: 'locationType', required: false, description: '位置类型' })
  @ApiQuery({ name: 'budget', required: false, description: '预算' })
  @ApiQuery({ name: 'season', required: false, description: '季节' })
  @ApiQuery({ name: 'festival', required: false, description: '节日' })
  async quickRecommend(
    @Query('userId') userId: string,
    @Query('locationType') locationType?: string,
    @Query('budget') budget?: string,
    @Query('season') season?: string,
    @Query('festival') festival?: string,
  ) {
    return this.aiService.recommendProducts({
      userId,
      location: locationType ? { locationType } as any : undefined,
      budget: budget ? parseFloat(budget) : undefined,
      season,
      festival,
    });
  }

  /**
   * 流式AI聊天
   * POST /api/ai/chat/stream
   */
  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '流式AI对话' })
  async chatStream(
    @Body() request: IChatRequest,
    @Headers('accept') accept: string,
  ) {
    // 如果客户端接受text/event-stream，返回流式响应
    if (accept && accept.includes('text/event-stream')) {
      return this.createStreamResponse(request);
    }
    // 否则返回普通响应
    return this.aiService.chat(request);
  }

  /**
   * 创建流式响应
   */
  private async *createStreamResponse(request: IChatRequest) {
    // 这里可以实现流式响应逻辑
    const response = await this.aiService.chat(request);
    yield response;
  }

  /**
   * 获取热门产品
   * GET /api/ai/hot-products
   */
  @Get('hot-products')
  @ApiOperation({ summary: '获取热门产品列表' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量' })
  async getHotProducts(@Query('limit') limit?: string) {
    // TODO: 从SelectionAgent获取热门产品
    return [];
  }

  /**
   * 获取市场趋势
   * GET /api/ai/market-trends
   */
  @Get('market-trends')
  @ApiOperation({ summary: '获取市场热点趋势' })
  @ApiQuery({ name: 'location', required: false, description: '位置' })
  async getMarketTrends(@Query('location') location?: string) {
    // TODO: 从TrendAgent获取市场趋势
    return [];
  }

  /**
   * 库存健康检查
   * POST /api/ai/inventory-health
   */
  @Post('inventory-health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '库存健康度检查' })
  async checkInventoryHealth(
    @Body() body: {
      userId: string;
      inventory: IInventoryItem[];
    },
  ) {
    // TODO: 调用InventoryAgent进行库存健康检查
    return {
      health: {
        overallScore: 0,
        turnoverScore: 0,
        stockOutRiskScore: 0,
        expiryRiskScore: 0,
      },
      alerts: [],
      recommendations: [],
    };
  }
}
