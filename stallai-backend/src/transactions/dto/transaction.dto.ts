import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TransactionTypeDto {
  SALE = 'sale',
  PURCHASE = 'purchase',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  RESTOCK = 'restock',
}

export enum PaymentMethodDto {
  CASH = 'cash',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CARD = 'card',
  OTHER = 'other',
}

export enum TransactionStatusDto {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class CreateTransactionDto {
  @ApiProperty({ description: '交易类型', enum: TransactionTypeDto })
  @IsNotEmpty({ message: '交易类型不能为空' })
  @IsEnum(TransactionTypeDto)
  type: TransactionTypeDto;

  @ApiProperty({ description: '交易金额', example: 25.5 })
  @IsNotEmpty({ message: '交易金额不能为空' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: '成本', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @ApiProperty({ description: '支付方式', enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiPropertyOptional({ description: '数量', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ description: '商品ID' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: '客户姓名' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: '客户电话' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: '交易项(JSON数组)' })
  @IsOptional()
  @IsString()
  items?: string;
}

export class TransactionQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '交易类型', enum: TransactionTypeDto })
  @IsOptional()
  @IsEnum(TransactionTypeDto)
  type?: TransactionTypeDto;

  @ApiPropertyOptional({ description: '交易状态', enum: TransactionStatusDto })
  @IsOptional()
  @IsEnum(TransactionStatusDto)
  status?: TransactionStatusDto;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '最低金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minAmount?: number;

  @ApiPropertyOptional({ description: '最高金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxAmount?: number;
}
