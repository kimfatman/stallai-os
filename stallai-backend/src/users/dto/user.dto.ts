import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'vendor001' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'vendor@example.com' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '昵称', example: '老王摆摊' })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: '昵称最多30个字符' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: '角色', enum: ['admin', 'vendor', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'vendor', 'viewer'])
  role?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: '新密码' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: '用户设置(JSON)' })
  @IsOptional()
  @IsString()
  settings?: string;
}

export class UserQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '用户角色', enum: ['admin', 'vendor', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'vendor', 'viewer'])
  role?: string;

  @ApiPropertyOptional({ description: '是否激活' })
  @IsOptional()
  isActive?: boolean;
}
