import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: '获取经营概览', description: '获取今日、本周、本月的销售和利润统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getSummary(@Req() req: any) {
    return this.dashboardService.getSummary(req.user.id);
  }

  @Get('score')
  @ApiOperation({ summary: '获取AI经营评分', description: '获取AI对店铺经营状况的综合评分和分析' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getScore(@Req() req: any) {
    return this.dashboardService.getScore(req.user.id);
  }

  @Get('trends')
  @ApiOperation({ summary: '获取趋势数据', description: '获取最近N天的销售、订单和利润趋势' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '天数，默认30天' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getTrends(@Req() req: any, @Query('days') days: number = 30) {
    return this.dashboardService.getTrends(req.user.id, days);
  }

  @Get('ai-summary')
  @ApiOperation({ summary: '获取AI一句话总结', description: '获取AI生成的一句话经营总结和关键信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getAISummary(@Req() req: any) {
    return this.dashboardService.getAISummary(req.user.id);
  }
}
