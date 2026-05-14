/**
 * Prisma 服务模块
 * Prisma Service Module
 * 
 * 提供 Prisma Client 实例供全局注入使用
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 全局模块，无需在 AppModule 中导入
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
