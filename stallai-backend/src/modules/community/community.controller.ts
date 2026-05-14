/**
 * 社区控制器
 * Community Controller
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('社区')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  /**
   * 获取帖子列表
   */
  @Get('posts')
  @ApiOperation({ summary: '获取帖子列表' })
  async findPosts(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.communityService.findPosts({ category, search });
  }

  /**
   * 获取帖子详情
   */
  @Get('posts/:id')
  @ApiOperation({ summary: '获取帖子详情' })
  async findOne(@Param('id') id: string) {
    return this.communityService.findOne(id);
  }

  /**
   * 获取评论列表
   */
  @Get('posts/:id/comments')
  @ApiOperation({ summary: '获取评论列表' })
  async getComments(@Param('id') id: string) {
    return this.communityService.getComments(id);
  }

  /**
   * 创建帖子
   */
  @Post('posts')
  @ApiOperation({ summary: '创建帖子' })
  async createPost(
    @CurrentUser() user: any,
    @Body() data: { category: string; title: string; content: string; images?: string[] },
  ) {
    return this.communityService.createPost(user.id, user.name, data);
  }

  /**
   * 点赞帖子
   */
  @Post('posts/:id/like')
  @ApiOperation({ summary: '点赞帖子' })
  async toggleLike(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.communityService.toggleLike(id, userId);
  }

  /**
   * 评论帖子
   */
  @Post('posts/:id/comments')
  @ApiOperation({ summary: '评论帖子' })
  async createComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('content') content: string,
  ) {
    return this.communityService.createComment(id, user.id, user.name, content);
  }
}
