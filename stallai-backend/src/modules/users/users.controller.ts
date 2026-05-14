/**
 * 用户控制器
 * Users Controller
 */

import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * 获取个人资料
   */
  @Get('profile')
  @ApiOperation({ summary: '获取个人资料' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * 更新个人资料
   */
  @Patch('profile')
  @ApiOperation({ summary: '更新个人资料' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(userId, data);
  }
}
