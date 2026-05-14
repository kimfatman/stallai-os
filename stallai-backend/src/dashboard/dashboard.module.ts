import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Product, Inventory])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
