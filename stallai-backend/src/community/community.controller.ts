import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto, CreateCommentDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ============ POST ENDPOINTS ============

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布帖子', description: '在社区发布新帖子' })
  @ApiResponse({ status: 201, description: '发布成功' })
  createPost(@Body() createPostDto: CreatePostDto, @Req() req: any) {
    return this.communityService.createPost(createPostDto, req.user.id);
  }

  @Get('posts')
  @ApiOperation({ summary: '获取帖子列表', description: '分页查询社区帖子' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  findAllPosts(@Query() query: PostQueryDto, @Req() req: any) {
    return this.communityService.findAllPosts(query, req.user?.id);
  }

  @Get('posts/hot')
  @ApiOperation({ summary: '获取热门帖子', description: '获取点赞和浏览量最高的帖子' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHotPosts(@Query('limit') limit: number = 10) {
    return this.communityService.getHotPosts(limit);
  }

  @Get('posts/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的帖子', description: '获取当前用户发布的所有帖子' })
  getMyPosts(@Req() req: any) {
    return this.communityService.findPostsByUser(req.user.id);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: '获取帖子详情', description: '根据ID获取帖子详情和评论' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '帖子不存在' })
  findPostById(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.findPostById(id);
  }

  @Put('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新帖子', description: '更新帖子内容' })
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.communityService.updatePost(id, updatePostDto, req.user.id);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除帖子', description: '删除自己的帖子' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removePost(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.communityService.removePost(id, req.user.id);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞帖子', description: '对帖子进行点赞' })
  likePost(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.likePost(id);
  }

  // ============ COMMENT ENDPOINTS ============

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '评论帖子', description: '对帖子发表评论' })
  @ApiResponse({ status: 201, description: '评论成功' })
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.communityService.createComment(postId, createCommentDto, req.user.id);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: '获取帖子评论', description: '获取指定帖子的所有评论' })
  findCommentsByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.communityService.findCommentsByPostId(postId);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论', description: '删除自己的评论' })
  @ApiResponse({ status: 200, description: '删除成功' })
  removeComment(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.communityService.removeComment(id, req.user.id);
  }

  @Post('comments/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞评论', description: '对评论进行点赞' })
  likeComment(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.likeComment(id);
  }
}
