/**
 * AI 控制器
 * AI Controller
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private aiService: AIService) {}

  /**
   * 获取 AI 洞察
   */
  @Get('insights')
  @ApiOperation({ summary: '获取 AI 洞察' })
  async getInsights(@CurrentUser('id') userId: string) {
    return this.aiService.getInsights(userId);
  }

  /**
   * 获取销售分析
   */
  @Get('sales-analysis')
  @ApiOperation({ summary: '获取销售分析' })
  async getSalesAnalysis(@CurrentUser('id') userId: string) {
    return this.aiService.getSalesAnalysis(userId);
  }

  /**
   * 获取市场趋势
   */
  @Get('market-trends')
  @ApiOperation({ summary: '获取市场趋势' })
  async getMarketTrends() {
    return this.aiService.getMarketTrends();
  }

  /**
   * 获取每日报告
   */
  @Get('daily-report')
  @ApiOperation({ summary: '获取每日报告' })
  async getDailyReport(
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    const reportDate = date ? new Date(date) : new Date();
    return this.aiService.getDailyReport(userId, reportDate);
  }

  /**
   * 获取 AI 选品推荐
   */
  @Get('selection')
  @ApiOperation({ summary: '获取 AI 选品推荐' })
  async getSelection(@Query('type') type?: 'all' | 'hot' | 'profit' | 'seasonal') {
    return this.aiService.getSelection(type || 'all');
  }

  /**
   * 获取爆款预测
   */
  @Get('prediction')
  @ApiOperation({ summary: '获取爆款预测' })
  async getTrendPrediction(@Query('period') period?: 'week' | 'month' | 'quarter') {
    return this.aiService.getTrendPrediction(period || 'week');
  }

  /**
   * 触发 AI 分析
   */
  @Post('analyze')
  @ApiOperation({ summary: '触发 AI 分析' })
  async triggerAnalysis(
    @CurrentUser('id') userId: string,
    @Body('type') type?: string,
  ) {
    // 根据类型触发不同的分析
    switch (type) {
      case 'insights':
        return this.aiService.getInsights(userId);
      case 'selection':
        return this.aiService.getSelection('all');
      case 'prediction':
        return this.aiService.getTrendPrediction('week');
      default:
        return this.aiService.getInsights(userId);
    }
  }
}
