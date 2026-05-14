/**
 * 认证控制器
 * Authentication Controller
 */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SendCodeDto, LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 发送验证码
   */
  @Post('send-code')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: '发送验证码' })
  async sendCode(@Body() dto: SendCodeDto) {
    await this.authService.sendVerifyCode(dto.phone);
    return { message: '验证码已发送' };
  }

  /**
   * 用户注册
   */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.phone, dto.code, dto.name);
  }

  /**
   * 用户登录
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.code);
  }

  /**
   * 退出登录
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  async logout() {
    return { message: '退出成功' };
  }

  /**
   * 刷新Token
   */
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新Token' })
  async refresh(@Body('userId') userId: string) {
    return this.authService.refreshToken(userId);
  }
}
