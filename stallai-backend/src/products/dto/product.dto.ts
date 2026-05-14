import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: '手抓饼' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString()
  @MinLength(1, { message: '商品名称至少1个字符' })
  @MaxLength(100, { message: '商品名称最多100个字符' })
  name: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '售价', example: 8.5 })
  @IsNotEmpty({ message: '售价不能为空' })
  @IsNumber()
  @Min(0, { message: '售价不能为负数' })
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: '成本价', example: 3.5 })
  @IsNotEmpty({ message: '成本价不能为空' })
  @IsNumber()
  @Min(0, { message: '成本价不能为负数' })
  @Type(() => Number)
  cost: number;

  @ApiPropertyOptional({ description: '商品图片URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: '商品分类', example: '小吃' })
  @IsNotEmpty({ message: '商品分类不能为空' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '条形码' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: '初始库存', example: 100 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @ApiPropertyOptional({ description: '最低库存预警', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStock?: number;

  @ApiPropertyOptional({ description: '供应商ID' })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiPropertyOptional({ description: '商品属性(JSON)', example: { size: '大', color: '原味' } })
  @IsOptional()
  @IsString()
  attributes?: Record<string, any>;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '售价' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ description: '成本价' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({ description: '商品图片URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: '商品分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '条形码' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: '最低库存预警' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStock?: number;

  @ApiPropertyOptional({ description: '是否热销' })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional({ description: '是否上架' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '商品属性' })
  @IsOptional()
  attributes?: Record<string, any>;
}

export class ProductQueryDto {
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

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '商品分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '是否热销' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isHot?: boolean;

  @ApiPropertyOptional({ description: '是否上架' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({ description: '最低价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: '最高价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;
}
