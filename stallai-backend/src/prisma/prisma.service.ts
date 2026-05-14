/**
 * Prisma 服务
 * Prisma Service
 * 
 * 封装 Prisma Client，提供数据库操作能力
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    // 监听查询事件
    this.$on('query' as any, (event: Prisma.QueryEvent) => {
      this.logger.debug(`Query: ${event.query}`);
      this.logger.debug(`Duration: ${event.duration}ms`);
    });

    // 监听错误事件
    this.$on('error' as any, (event: Prisma.LogEvent) => {
      this.logger.error(`Error: ${event.message}`);
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
