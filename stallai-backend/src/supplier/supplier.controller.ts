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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: '创建供应商', description: '添加新供应商' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createSupplierDto: CreateSupplierDto, @Req() req: any) {
    return this.supplierService.create(createSupplierDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取供应商列表', description: '分页查询供应商' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  findAll(@Query() query: SupplierQueryDto, @Req() req: any) {
    return this.supplierService.findAll(query, req.user.id);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取供应商分类', description: '获取所有供应商分类' })
  getCategories(@Req() req: any) {
    return this.supplierService.getCategories(req.user.id);
  }

  @Get('top')
  @ApiOperation({ summary: '获取优质供应商', description: '获取评分最高的供应商' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopSuppliers(@Query('limit') limit: number = 10, @Req() req: any) {
    return this.supplierService.getTopSuppliers(limit, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取供应商统计', description: '获取供应商统计数据' })
  getStats(@Req() req: any) {
    return this.supplierService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取供应商详情', description: '根据ID获取供应商信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '供应商不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新供应商', description: '更新供应商信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Put(':id/rating')
  @ApiOperation({ summary: '更新供应商评分', description: '对供应商进行评分' })
  updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body('rating') rating: number,
  ) {
    return this.supplierService.updateRating(id, rating);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除供应商', description: '软删除供应商' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
