/**
 * 摆摊AI经营OS - 主入口文件
 * AI Street Vendor Management OS - Main Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('摆摊AI经营OS API')
      .setDescription('摆摊AI经营OS 后端 API 文档')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', '认证相关接口')
      .addTag('users', '用户相关接口')
      .addTag('products', '商品相关接口')
      .addTag('transactions', '交易相关接口')
      .addTag('inventory', '库存相关接口')
      .addTag('suppliers', '供应商相关接口')
      .addTag('community', '社区相关接口')
      .addTag('ai', 'AI 相关接口')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     摆摊AI经营OS - 后端服务已启动                           ║
║                                                           ║
║     API 文档: http://localhost:${port}/api/docs              ║
║     健康检查: http://localhost:${port}/health                 ║
║                                                           ║
║     环境: ${nodeEnv.padEnd(43)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
