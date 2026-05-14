import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostType } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { CreatePostDto, UpdatePostDto, PostQueryDto, CreateCommentDto } from './dto/post.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  // ============ POST METHODS ============

  /**
   * 创建帖子
   */
  async createPost(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      userId,
    });

    return this.postRepository.save(post);
  }

  /**
   * 查询帖子列表
   */
  async findAllPosts(query: PostQueryDto, userId?: number) {
    const { page = 1, limit = 10, type, keyword, isPublic, tags } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.comments', 'comments');

    // Filter by visibility
    if (userId) {
      queryBuilder.where('(post.isPublic = :isPublic OR post.userId = :userId)', { isPublic: true, userId });
    } else {
      queryBuilder.where('post.isPublic = :isPublic', { isPublic: true });
    }

    if (type) {
      queryBuilder.andWhere('post.type = :type', { type });
    }

    if (keyword) {
      queryBuilder.andWhere(
        'post.title LIKE :keyword OR post.content LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    if (tags) {
      queryBuilder.andWhere('post.tags LIKE :tags', { tags: `%${tags}%` });
    }

    // Order by pinned first, then by date
    queryBuilder.orderBy('post.isPinned', 'DESC')
      .addOrderBy('post.createdAt', 'DESC');

    const [posts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个帖子
   */
  async findPostById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user'],
    });

    if (!post) {
      throw new NotFoundException(`帖子ID ${id} 不存在`);
    }

    // Increment view count
    post.viewCount += 1;
    await this.postRepository.save(post);

    return post;
  }

  /**
   * 更新帖子
   */
  async updatePost(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<Post> {
    const post = await this.findPostById(id);

    if (post.userId !== userId) {
      throw new NotFoundException('无权修改此帖子');
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  /**
   * 删除帖子
   */
  async removePost(id: number, userId: number): Promise<void> {
    const post = await this.findPostById(id);

    if (post.userId !== userId) {
      throw new NotFoundException('无权删除此帖子');
    }

    await this.postRepository.remove(post);
  }

  /**
   * 点赞帖子
   */
  async likePost(id: number): Promise<Post> {
    const post = await this.findPostById(id);
    post.likeCount += 1;
    return this.postRepository.save(post);
  }

  /**
   * 获取热门帖子
   */
  async getHotPosts(limit: number = 10): Promise<Post[]> {
    return this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.isPublic = :isPublic', { isPublic: true })
      .orderBy('post.likeCount', 'DESC')
      .addOrderBy('post.viewCount', 'DESC')
      .take(limit)
      .getMany();
  }

  // ============ COMMENT METHODS ============

  /**
   * 创建评论
   */
  async createComment(postId: number, createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    const post = await this.findPostById(postId);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      postId: post.id,
      userId,
    });

    // Update post comment count
    post.commentCount += 1;
    await this.postRepository.save(post);

    return this.commentRepository.save(comment);
  }

  /**
   * 获取帖子的评论
   */
  async findCommentsByPostId(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 删除评论
   */
  async removeComment(id: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!comment) {
      throw new NotFoundException(`评论ID ${id} 不存在`);
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('无权删除此评论');
    }

    // Update post comment count
    if (comment.post) {
      comment.post.commentCount = Math.max(0, comment.post.commentCount - 1);
      await this.postRepository.save(comment.post);
    }

    await this.commentRepository.remove(comment);
  }

  /**
   * 点赞评论
   */
  async likeComment(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`评论ID ${id} 不存在`);
    }

    comment.likeCount += 1;
    return this.commentRepository.save(comment);
  }

  /**
   * 获取用户的所有帖子
   */
  async findPostsByUser(userId: number) {
    return this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
