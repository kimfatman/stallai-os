/**
 * 交易控制器
 * Transactions Controller
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('交易')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  /**
   * 获取交易列表
   */
  @Get()
  @ApiOperation({ summary: '获取交易列表' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('type') type?: string,
    @Query('period') period?: string,
  ) {
    return this.transactionsService.findAll(userId, { type, period });
  }

  /**
   * 获取交易统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取交易统计' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.transactionsService.getStats(userId);
  }

  /**
   * 创建交易
   */
  @Post()
  @ApiOperation({ summary: '创建交易' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.transactionsService.create(userId, data);
  }

  /**
   * 删除交易
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除交易' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.remove(id, userId);
  }
}
