import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * 创建供应商
   */
  async create(createSupplierDto: CreateSupplierDto, userId: number): Promise<Supplier> {
    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      userId,
    });

    return this.supplierRepository.save(supplier);
  }

  /**
   * 查询所有供应商
   */
  async findAll(query: SupplierQueryDto, userId?: number) {
    const { page = 1, limit = 10, keyword, category, isActive } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    if (userId) {
      queryBuilder.where('supplier.userId = :userId', { userId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        'supplier.name LIKE :keyword OR supplier.contact LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('supplier.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('supplier.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy('supplier.createdAt', 'DESC');

    const [suppliers, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: suppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个供应商
   */
  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!supplier) {
      throw new NotFoundException(`供应商ID ${id} 不存在`);
    }

    return supplier;
  }

  /**
   * 更新供应商
   */
  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, updateSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  /**
   * 删除供应商
   */
  async remove(id: number): Promise<void> {
    const supplier = await this.findOne(id);
    supplier.isActive = false;
    await this.supplierRepository.save(supplier);
  }

  /**
   * 更新采购金额
   */
  async updatePurchaseAmount(id: number, amount: number): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.totalAmount += amount;
    supplier.orderCount += 1;
    return this.supplierRepository.save(supplier);
  }

  /**
   * 更新评分
   */
  async updateRating(id: number, newRating: number): Promise<Supplier> {
    const supplier = await this.findOne(id);
    // Simple moving average
    const currentRating = Number(supplier.rating);
    supplier.rating = (currentRating + newRating) / 2;
    return this.supplierRepository.save(supplier);
  }

  /**
   * 获取供应商分类
   */
  async getCategories(userId?: number): Promise<string[]> {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
      .select('DISTINCT supplier.category', 'category');

    if (userId) {
      queryBuilder.where('supplier.userId = :userId', { userId });
    }

    const results = await queryBuilder.getRawMany();
    return results.map(r => r.category).filter(Boolean);
  }

  /**
   * 获取优质供应商
   */
  async getTopSuppliers(limit: number = 10, userId?: number): Promise<Supplier[]> {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
      .where('supplier.isActive = :isActive', { isActive: true })
      .orderBy('supplier.rating', 'DESC')
      .addOrderBy('supplier.totalAmount', 'DESC')
      .take(limit);

    if (userId) {
      queryBuilder.andWhere('supplier.userId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * 获取供应商统计
   */
  async getStats(userId?: number) {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    if (userId) {
      queryBuilder.where('supplier.userId = :userId', { userId });
    }

    const suppliers = await queryBuilder.getMany();

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.isActive).length;
    const totalPurchaseAmount = suppliers.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const categories = [...new Set(suppliers.map(s => s.category).filter(Boolean))];

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers: totalSuppliers - activeSuppliers,
      totalPurchaseAmount,
      categories: categories.length,
      categoryList: categories,
    };
  }
}
