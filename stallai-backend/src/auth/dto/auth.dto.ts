import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'vendor001', minLength: 3, maxLength: 20 })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'vendor@example.com' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123!', minLength: 6, maxLength: 50 })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(50, { message: '密码最多50个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密码必须包含大小写字母和数字',
  })
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
}

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱', example: 'vendor001' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新Token' })
  @IsNotEmpty({ message: 'refresh token不能为空' })
  @IsString()
  refreshToken: string;
}
