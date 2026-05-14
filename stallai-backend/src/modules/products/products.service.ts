/**
 * 商品服务
 * Products Service
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取商品列表
   */
  async findAll(userId: string, params?: { category?: string; search?: string }) {
    const where: any = { userId };
    
    if (params?.category) {
      where.category = params.category;
    }
    
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      products,
      total: products.length,
    };
  }

  /**
   * 获取商品详情
   */
  async findOne(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  /**
   * 创建商品
   */
  async create(userId: string, data: any) {
    const product = await this.prisma.product.create({
      data: {
        userId,
        name: data.name,
        category: data.category || '其他',
        description: data.description,
        image: data.image,
        price: data.price,
        cost: data.cost,
        stock: data.stock || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
      },
    });

    return product;
  }

  /**
   * 更新商品
   */
  async update(id: string, userId: string, data: any) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除商品
   */
  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    await this.prisma.product.delete({ where: { id } });

    return { message: '删除成功' };
  }
}
