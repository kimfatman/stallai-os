import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, ...rest } = createUserDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      ...rest,
    });

    return this.userRepository.save(user);
  }

  /**
   * 查询所有用户
   */
  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, keyword, role, isActive } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters
    if (keyword) {
      queryBuilder.where(
        'user.username LIKE :keyword OR user.nickname LIKE :keyword OR user.email LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Order by creation date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Pagination
    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((u) => this.sanitizeUser(u)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据ID查询用户
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    return user;
  }

  /**
   * 根据用户名查询用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If updating password
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * 永久删除用户（仅管理员）
   */
  async forceRemove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  /**
   * 更新用户余额
   */
  async updateBalance(id: number, amount: number, operation: 'add' | 'subtract'): Promise<User> {
    const user = await this.findOne(id);

    if (operation === 'add') {
      user.balance += amount;
    } else {
      if (user.balance < amount) {
        throw new BadRequestException('余额不足');
      }
      user.balance -= amount;
    }

    return this.userRepository.save(user);
  }

  /**
   * 统计用户数量
   */
  async count(condition?: { role?: string; isActive?: boolean }): Promise<number> {
    return this.userRepository.count({ where: condition });
  }

  /**
   * 移除敏感信息
   */
  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
