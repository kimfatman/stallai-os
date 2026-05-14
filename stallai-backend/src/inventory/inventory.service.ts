import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, InventoryChangeType } from './entities/inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto, InventoryQueryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * 创建库存记录
   */
  async create(createInventoryDto: CreateInventoryDto, userId: number): Promise<Inventory> {
    const { productId, quantity, unitCost } = createInventoryDto;

    // Check if inventory already exists for this product
    const existing = await this.inventoryRepository.findOne({
      where: { productId, userId },
    });

    if (existing) {
      throw new BadRequestException('该商品的库存记录已存在');
    }

    const totalValue = quantity * (unitCost || 0);
    const lowStockAlert = quantity <= (createInventoryDto.minStock || 10);

    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      userId,
      totalValue,
      lowStockAlert,
      lastRestockDate: new Date(),
    });

    return this.inventoryRepository.save(inventory);
  }

  /**
   * 查询库存列表
   */
  async findAll(query: InventoryQueryDto, userId?: number) {
    const { page = 1, limit = 10, lowStock, productId, category } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product');

    if (userId) {
      queryBuilder.where('inventory.userId = :userId', { userId });
    }

    if (lowStock) {
      queryBuilder.andWhere('inventory.quantity <= inventory.minStock');
    }

    if (productId) {
      queryBuilder.andWhere('inventory.productId = :productId', { productId });
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    queryBuilder.orderBy('inventory.createdAt', 'DESC');

    const [inventories, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: inventories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个库存
   */
  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(`库存记录ID ${id} 不存在`);
    }

    return inventory;
  }

  /**
   * 根据商品ID获取库存
   */
  async findByProductId(productId: number, userId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId, userId },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(`商品ID ${productId} 的库存记录不存在`);
    }

    return inventory;
  }

  /**
   * 更新库存
   */
  async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);

    Object.assign(inventory, updateInventoryDto);

    // Recalculate total value
    if (updateInventoryDto.quantity !== undefined || updateInventoryDto.unitCost !== undefined) {
      inventory.totalValue = inventory.quantity * inventory.unitCost;
    }

    // Check low stock
    inventory.lowStockAlert = inventory.quantity <= inventory.minStock;

    return this.inventoryRepository.save(inventory);
  }

  /**
   * 库存变动
   */
  async changeQuantity(
    id: number,
    quantity: number,
    changeType: InventoryChangeType,
    note?: string,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);

    const oldQuantity = inventory.quantity;

    switch (changeType) {
      case InventoryChangeType.PURCHASE:
      case InventoryChangeType.RETURN:
        inventory.quantity += quantity;
        inventory.lastRestockDate = new Date();
        break;
      case InventoryChangeType.SALE:
        if (inventory.quantity < quantity) {
          throw new BadRequestException('库存不足');
        }
        inventory.quantity -= quantity;
        break;
      case InventoryChangeType.DAMAGE:
      case InventoryChangeType.EXPIRY:
        if (inventory.quantity < quantity) {
          throw new BadRequestException('库存不足');
        }
        inventory.quantity -= quantity;
        break;
      case InventoryChangeType.ADJUSTMENT:
        inventory.quantity = quantity;
        break;
    }

    // Recalculate
    inventory.totalValue = inventory.quantity * inventory.unitCost;
    inventory.lowStockAlert = inventory.quantity <= inventory.minStock;

    // Add to history
    const history = inventory.history ? JSON.parse(inventory.history) : [];
    history.unshift({
      date: new Date(),
      type: changeType,
      quantity: quantity,
      oldQuantity,
      newQuantity: inventory.quantity,
      note,
    });
    inventory.history = JSON.stringify(history.slice(0, 100)); // Keep last 100 records

    return this.inventoryRepository.save(inventory);
  }

  /**
   * 获取低库存预警列表
   */
  async getLowStockAlerts(userId?: number): Promise<Inventory[]> {
    const queryBuilder = this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.lowStockAlert = :alert', { alert: true })
      .andWhere('inventory.quantity > 0');

    if (userId) {
      queryBuilder.andWhere('inventory.userId = :userId', { userId });
    }

    return queryBuilder.orderBy('inventory.quantity', 'ASC').getMany();
  }

  /**
   * 获取库存统计
   */
  async getStats(userId?: number) {
    const queryBuilder = this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product');

    if (userId) {
      queryBuilder.where('inventory.userId = :userId', { userId });
    }

    const inventories = await queryBuilder.getMany();

    const totalItems = inventories.length;
    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalValue = inventories.reduce((sum, inv) => sum + Number(inv.totalValue), 0);
    const lowStockItems = inventories.filter(inv => inv.lowStockAlert).length;
    const outOfStockItems = inventories.filter(inv => inv.quantity === 0).length;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStockItems,
      outOfStockItems,
      normalItems: totalItems - lowStockItems - outOfStockItems,
    };
  }

  /**
   * 删除库存记录
   */
  async remove(id: number): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }
}
