/**
 * 用户服务
 * Users Service
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户资料
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      level: user.level,
      totalOrders: user.totalOrders,
      totalRevenue: user.totalRevenue,
      totalCustomers: user.totalCustomers,
      days: Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
      createdAt: user.createdAt,
    };
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      level: user.level,
    };
  }
}
