/**
 * 认证 DTO
 * Authentication DTOs
 */

import { IsNotEmpty, IsString, IsOptional, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

export class RegisterDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '验证码' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: '验证码长度为6位' })
  code: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20, { message: '用户名长度为2-20位' })
  name: string;
}

export class LoginDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '验证码' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: '验证码长度为6位' })
  code: string;
}
