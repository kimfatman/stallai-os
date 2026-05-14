/**
 * 库存控制器
 * Inventory Controller
 */

import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('库存')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  /**
   * 获取库存列表
   */
  @Get()
  @ApiOperation({ summary: '获取库存列表' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAll(userId, { status, search });
  }

  /**
   * 更新库存
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新库存' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: { quantity?: number; restock?: boolean },
  ) {
    return this.inventoryService.update(id, userId, data);
  }
}
