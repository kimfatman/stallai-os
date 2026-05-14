/**
 * 仪表盘控制器
 * Dashboard Controller
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('仪表盘')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * 获取仪表盘统计数据
   */
  @Get('stats')
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStats(userId);
  }

  /**
   * 获取趋势数据
   */
  @Get('trend')
  @ApiOperation({ summary: '获取趋势数据' })
  async getTrend(
    @CurrentUser('id') userId: string,
    @Query('period') period?: 'day' | 'week' | 'month',
  ) {
    return this.dashboardService.getTrend(userId, period || 'week');
  }
}
