/**
 * 供应商服务
 * Suppliers Service
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取供应商列表
   */
  async findAll(params?: { category?: string; search?: string }) {
    const where: any = {};

    if (params?.category && params.category !== 'all') {
      where.category = params.category;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [featured, list] = await Promise.all([
      // 热门推荐 (评分最高的)
      this.prisma.supplier.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: 5,
      }),
      // 全部列表
      this.prisma.supplier.findMany({
        where,
        orderBy: { rating: 'desc' },
      }),
    ]);

    return {
      featured,
      list,
      total: list.length,
    };
  }

  /**
   * 获取供应商详情
   */
  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    return supplier;
  }

  /**
   * 获取供应商商品
   */
  async getProducts(supplierId: string) {
    return this.prisma.supplierProduct.findMany({
      where: { supplierId },
    });
  }
}
