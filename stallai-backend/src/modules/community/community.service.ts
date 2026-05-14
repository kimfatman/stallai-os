/**
 * 社区服务
 * Community Service
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取帖子列表
   */
  async findPosts(params?: { category?: string; search?: string }) {
    const where: any = {};

    if (params?.category && params.category !== 'all') {
      where.category = params.category;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    return {
      posts,
      total: posts.length,
    };
  }

  /**
   * 获取帖子详情
   */
  async findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });
  }

  /**
   * 获取评论列表
   */
  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 创建帖子
   */
  async createPost(userId: string, userName: string, data: { category: string; title: string; content: string; images?: string[] }) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        category: data.category,
        title: data.title,
        content: data.content,
        images: data.images || [],
      },
    });

    return post;
  }

  /**
   * 点赞帖子
   */
  async toggleLike(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { postId_userId: { postId, userId } },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
    } else {
      await this.prisma.like.create({
        data: { postId, userId },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
    }

    return { success: true };
  }

  /**
   * 评论帖子
   */
  async createComment(postId: string, userId: string, userName: string, content: string) {
    await this.prisma.comment.create({
      data: { postId, userId, userName, content },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { comments: { increment: 1 } },
    });

    return { success: true };
  }
}
