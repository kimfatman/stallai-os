import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto, InventoryQueryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: '创建库存记录', description: '为商品创建库存记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createInventoryDto: CreateInventoryDto, @Req() req: any) {
    return this.inventoryService.create(createInventoryDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取库存列表', description: '分页查询库存记录' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  findAll(@Query() query: InventoryQueryDto, @Req() req: any) {
    return this.inventoryService.findAll(query, req.user.id);
  }

  @Get('low-stock')
  @ApiOperation({ summary: '获取低库存预警', description: '获取所有低库存商品' })
  getLowStockAlerts(@Req() req: any) {
    return this.inventoryService.getLowStockAlerts(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取库存统计', description: '获取库存统计数据' })
  getStats(@Req() req: any) {
    return this.inventoryService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取库存详情', description: '根据ID获取库存详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '库存不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '根据商品获取库存', description: '根据商品ID获取库存信息' })
  findByProductId(@Param('productId', ParseIntPipe) productId: number, @Req() req: any) {
    return this.inventoryService.findByProductId(productId, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存', description: '更新库存信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Post(':id/change')
  @ApiOperation({ summary: '库存变动', description: '记录库存变动（采购/销售/调整等）' })
  changeQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
    @Body('changeType') changeType: string,
    @Body('note') note?: string,
  ) {
    return this.inventoryService.changeQuantity(id, quantity, changeType as any, note);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存记录', description: '删除指定的库存记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
