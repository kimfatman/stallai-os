import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, TransactionQueryDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: '创建交易', description: '记录一笔新交易' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: any) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取交易列表', description: '分页查询交易记录' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(@Query() query: TransactionQueryDto, @Req() req: any) {
    return this.transactionsService.findAll(query, req.user.id);
  }

  @Get('today-stats')
  @ApiOperation({ summary: '获取今日统计', description: '获取今日交易统计数据' })
  getTodayStats(@Req() req: any) {
    return this.transactionsService.getTodayStats(req.user.id);
  }

  @Get('week-stats')
  @ApiOperation({ summary: '获取本周统计', description: '获取本周交易统计数据' })
  getWeekStats(@Req() req: any) {
    return this.transactionsService.getWeekStats(req.user.id);
  }

  @Get('month-stats')
  @ApiOperation({ summary: '获取本月统计', description: '获取本月交易统计数据' })
  getMonthStats(@Req() req: any) {
    return this.transactionsService.getMonthStats(req.user.id);
  }

  @Get('payment-stats')
  @ApiOperation({ summary: '获取支付方式统计', description: '按支付方式统计交易' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getPaymentMethodStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.transactionsService.getPaymentMethodStats(start, end, req.user.id);
  }

  @Get('trend')
  @ApiOperation({ summary: '获取趋势数据', description: '获取最近N天的销售趋势' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '天数，默认30天' })
  getTrendData(@Query('days') days: number = 30, @Req() req: any) {
    return this.transactionsService.getTrendData(days, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取交易详情', description: '根据ID获取交易详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '交易不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消交易', description: '取消指定的交易' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.cancel(id);
  }

  @Put(':id/refund')
  @ApiOperation({ summary: '退款', description: '对交易进行退款' })
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.transactionsService.refund(id, reason);
  }
}
