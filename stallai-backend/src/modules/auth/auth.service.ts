/**
 * 认证服务
 * Authentication Service
 */

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 发送验证码
   */
  async sendVerifyCode(phone: string): Promise<void> {
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // TODO: 实际发送短信验证码
    // 这里模拟存储验证码
    console.log(`验证码: ${code}`);
    
    // 验证码有效期5分钟
    await this.prisma.user.updateMany({
      where: { phone },
      data: { name: code }, // 临时存储用于验证
    });
  }

  /**
   * 用户注册
   */
  async register(phone: string, code: string, name: string) {
    // 验证验证码
    // TODO: 实际验证逻辑
    // const isValid = await this.verifyCode(phone, code);
    // if (!isValid) throw new UnauthorizedException('验证码错误');

    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('该手机号已注册');
    }

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        phone,
        name,
        level: 'bronze',
      },
    });

    // 生成Token
    const token = await this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      },
    };
  }

  /**
   * 用户登录
   */
  async login(phone: string, code: string) {
    // 验证验证码
    // TODO: 实际验证逻辑
    // const isValid = await this.verifyCode(phone, code);
    // if (!isValid) throw new UnauthorizedException('验证码错误');

    // 查找用户
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    // 如果用户不存在，自动注册
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: `用户${phone.slice(-4)}`,
          level: 'bronze',
        },
      });
    }

    // 生成Token
    const token = await this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      },
    };
  }

  /**
   * 退出登录
   */
  async logout(userId: string): Promise<void> {
    // TODO: 将Token加入黑名单
  }

  /**
   * 刷新Token
   */
  async refreshToken(userId: string) {
    const token = await this.generateToken(userId);
    return { token };
  }

  /**
   * 生成JWT Token
   */
  private async generateToken(userId: string): Promise<string> {
    return this.jwtService.sign({ sub: userId });
  }

  /**
   * 验证用户
   */
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
