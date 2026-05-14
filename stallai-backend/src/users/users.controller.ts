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
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '创建用户', description: '管理员创建新用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '获取用户列表', description: '分页查询所有用户' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'keyword', required: false, type: String, description: '搜索关键词' })
  @ApiQuery({ name: 'role', required: false, type: String, description: '用户角色' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情', description: '根据ID获取用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息', description: '更新指定用户的信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    // Users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return { success: false, message: '无权修改此用户信息' };
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '删除用户', description: '软删除指定用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Get('stats/overview')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '获取用户统计', description: '获取用户总数统计' })
  async getStats() {
    const [total, vendors, active] = await Promise.all([
      this.usersService.count(),
      this.usersService.count({ role: 'vendor' }),
      this.usersService.count({ isActive: true }),
    ]);

    return {
      success: true,
      data: {
        total,
        vendors,
        active,
        inactive: total - active,
      },
    };
  }
}
