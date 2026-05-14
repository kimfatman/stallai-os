import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Transaction, Product, Inventory]),
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
