/**
 * 供应商控制器
 * Suppliers Controller
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('供应商')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  /**
   * 获取供应商列表
   */
  @Get()
  @ApiOperation({ summary: '获取供应商列表' })
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.suppliersService.findAll({ category, search });
  }

  /**
   * 获取供应商详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取供应商详情' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  /**
   * 获取供应商商品
   */
  @Get(':id/products')
  @ApiOperation({ summary: '获取供应商商品' })
  async getProducts(@Param('id') id: string) {
    return this.suppliersService.getProducts(id);
  }
}
