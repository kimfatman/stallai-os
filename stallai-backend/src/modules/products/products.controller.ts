/**
 * 商品控制器
 * Products Controller
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('商品')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  /**
   * 获取商品列表
   */
  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(userId, { category, search });
  }

  /**
   * 获取商品详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.findOne(id, userId);
  }

  /**
   * 创建商品
   */
  @Post()
  @ApiOperation({ summary: '创建商品' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.productsService.create(userId, data);
  }

  /**
   * 更新商品
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新商品' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.productsService.update(id, userId, data);
  }

  /**
   * 删除商品
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.remove(id, userId);
  }
}
