import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  // In-memory token blacklist for simple implementation
  // In production, use Redis for better performance
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { username, email, password, phone, nickname } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username },
        { email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('用户名已存在');
      }
      throw new ConflictException('邮箱已被注册');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      phone,
      nickname: nickname || username,
      isActive: true,
      lastLoginAt: new Date(),
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: '注册成功',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username or email
    const user = await this.userRepository.findOne({
      where: [
        { username },
        { email: username },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: '登录成功',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  /**
   * 获取用户资料
   */
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      success: true,
      data: this.sanitizeUser(user),
    };
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'default-secret-key',
      });

      // Check if token is blacklisted
      if (this.tokenBlacklist.has(refreshToken)) {
        throw new UnauthorizedException('Token已失效');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户不存在或已禁用');
      }

      // Blacklist old refresh token
      this.tokenBlacklist.add(refreshToken);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        message: 'Token刷新成功',
        data: tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('无效的refresh token');
    }
  }

  /**
   * 用户登出
   */
  async logout(userId: number) {
    // In a real implementation, you might want to blacklist the token
    return {
      success: true,
      message: '登出成功',
    };
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    if (newPassword.length < 6) {
      throw new BadRequestException('新密码长度至少6位');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return {
      success: true,
      message: '密码修改成功',
    };
  }

  /**
   * 生成Token对
   */
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 604800, // 7 days in seconds
    };
  }

  /**
   * 移除敏感信息
   */
  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }

  /**
   * 验证Token（用于其他模块）
   */
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
