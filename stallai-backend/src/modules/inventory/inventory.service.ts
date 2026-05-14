/**
 * 库存服务
 * Inventory Service
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取库存列表
   */
  async findAll(userId: string, params?: { status?: string; search?: string }) {
    // 获取所有商品
    const products = await this.prisma.product.findMany({
      where: { userId },
      include: { inventory: true },
    });

    // 计算库存统计
    let items = products.map((product) => ({
      id: product.inventory?.id,
      productId: product.id,
      product,
      quantity: product.stock,
      status: this.calculateStatus(product.stock, product.lowStockThreshold),
      lastRestockDate: product.inventory?.lastRestockDate,
    }));

    // 筛选
    if (params?.status && params.status !== 'all') {
      items = items.filter((item) => item.status === params.status);
    }

    if (params?.search) {
      items = items.filter((item) =>
        item.product.name.includes(params.search),
      );
    }

    // 统计
    const normalCount = items.filter((i) => i.status === 'normal').length;
    const lowStockCount = items.filter((i) => i.status === 'low').length;
    const outOfStockCount = items.filter((i) => i.status === 'out').length;

    const totalProducts = products.length;
    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.product.cost,
      0,
    );

    return {
      items,
      total: items.length,
      overview: {
        totalProducts,
        totalStock,
        totalValue,
        lowStockItems: lowStockCount,
      },
      normalCount,
      lowStockCount,
      outOfStockCount,
    };
  }

  /**
   * 计算库存状态
   */
  private calculateStatus(stock: number, threshold: number): string {
    if (stock === 0) return 'out';
    if (stock <= threshold) return 'low';
    return 'normal';
  }

  /**
   * 更新库存
   */
  async update(
    id: string,
    userId: string,
    data: { quantity?: number; restock?: boolean },
  ) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, userId },
    });

    if (!inventory) {
      throw new Error('库存记录不存在');
    }

    if (data.restock) {
      return this.prisma.inventory.update({
        where: { id },
        data: {
          quantity: data.quantity,
          lastRestockDate: new Date(),
          status: 'normal',
        },
      });
    }

    return this.prisma.inventory.update({
      where: { id },
      data: {
        quantity: data.quantity,
        status: this.calculateStatus(data.quantity, 10),
      },
    });
  }
}
