import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 创建商品
   */
  async create(createProductDto: CreateProductDto, userId: number): Promise<Product> {
    const { price, cost } = createProductDto;

    // Calculate profit margin
    let profitMargin = 0;
    if (price > 0 && cost > 0) {
      profitMargin = ((price - cost) / price) * 100;
    }

    const product = this.productRepository.create({
      ...createProductDto,
      userId,
      profitMargin,
    });

    return this.productRepository.save(product);
  }

  /**
   * 查询所有商品
   */
  async findAll(query: ProductQueryDto, userId?: number) {
    const { page = 1, limit = 10, keyword, category, isHot, isActive, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Filter by user
    if (userId) {
      queryBuilder.where('product.userId = :userId', { userId });
    }

    // Apply filters
    if (keyword) {
      queryBuilder.andWhere(
        'product.name LIKE :keyword OR product.description LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (isHot !== undefined) {
      queryBuilder.andWhere('product.isHot = :isHot', { isHot });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Order
    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个商品
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException(`商品ID ${id} 不存在`);
    }

    return product;
  }

  /**
   * 更新商品
   */
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    const { price, cost } = updateProductDto;

    // Recalculate profit margin if price or cost changed
    if (price !== undefined || cost !== undefined) {
      const newPrice = price ?? product.price;
      const newCost = cost ?? product.cost;
      if (newPrice > 0 && newCost > 0) {
        updateProductDto.profitMargin = ((newPrice - newCost) / newPrice) * 100;
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  /**
   * 删除商品
   */
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepository.save(product);
  }

  /**
   * 更新库存
   */
  async updateStock(id: number, quantity: number, operation: 'add' | 'subtract'): Promise<Product> {
    const product = await this.findOne(id);

    if (operation === 'add') {
      product.stock += quantity;
    } else {
      if (product.stock < quantity) {
        throw new BadRequestException('库存不足');
      }
      product.stock -= quantity;
    }

    return this.productRepository.save(product);
  }

  /**
   * 更新销量
   */
  async updateSalesCount(id: number, count: number): Promise<Product> {
    const product = await this.findOne(id);
    product.salesCount += count;
    return this.productRepository.save(product);
  }

  /**
   * 获取商品分类列表
   */
  async getCategories(userId?: number): Promise<string[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    if (userId) {
      queryBuilder.where('product.userId = :userId', { userId });
    }
    
    queryBuilder.select('DISTINCT product.category', 'category');
    const results = await queryBuilder.getRawMany();
    
    return results.map(r => r.category).filter(Boolean);
  }

  /**
   * 获取热销商品
   */
  async getHotProducts(limit: number = 10, userId?: number): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.salesCount', 'DESC')
      .take(limit);

    if (userId) {
      queryBuilder.andWhere('product.userId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * 获取低库存商品
   */
  async getLowStockProducts(userId?: number): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.stock', 'ASC');

    if (userId) {
      queryBuilder.andWhere('product.userId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * 批量创建商品
   */
  async bulkCreate(products: CreateProductDto[], userId: number): Promise<Product[]> {
    const productEntities = products.map(dto => {
      const { price, cost } = dto;
      let profitMargin = 0;
      if (price > 0 && cost > 0) {
        profitMargin = ((price - cost) / price) * 100;
      }
      return this.productRepository.create({
        ...dto,
        userId,
        profitMargin,
      });
    });

    return this.productRepository.save(productEntities);
  }

  /**
   * 获取商品统计
   */
  async getStats(userId?: number) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (userId) {
      queryBuilder.where('product.userId = :userId', { userId });
    }

    const [products] = await queryBuilder.getManyAndCount();

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      totalStock,
      totalSales,
      categories: categories.length,
      categoryList: categories,
    };
  }
}
