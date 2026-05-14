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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品', description: '添加新商品到库存' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Post('bulk')
  @ApiOperation({ summary: '批量创建商品', description: '一次性添加多个商品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  bulkCreate(@Body() products: CreateProductDto[], @Req() req: any) {
    return this.productsService.bulkCreate(products, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取商品列表', description: '分页查询商品' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isHot', required: false, type: Boolean })
  findAll(@Query() query: ProductQueryDto, @Req() req: any) {
    return this.productsService.findAll(query, req.user.id);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取商品分类', description: '获取所有商品分类列表' })
  getCategories(@Req() req: any) {
    return this.productsService.getCategories(req.user.id);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热销商品', description: '获取销量最高的商品' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHotProducts(@Query('limit') limit: number = 10, @Req() req: any) {
    return this.productsService.getHotProducts(limit, req.user.id);
  }

  @Get('low-stock')
  @ApiOperation({ summary: '获取低库存商品', description: '获取库存不足的商品' })
  getLowStockProducts(@Req() req: any) {
    return this.productsService.getLowStockProducts(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取商品统计', description: '获取商品统计数据' })
  getStats(@Req() req: any) {
    return this.productsService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情', description: '根据ID获取商品详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商品', description: '更新商品信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Put(':id/stock')
  @ApiOperation({ summary: '更新库存', description: '增加或减少商品库存' })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
    @Body('operation') operation: 'add' | 'subtract',
  ) {
    return this.productsService.updateStock(id, quantity, operation);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品', description: '软删除商品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
