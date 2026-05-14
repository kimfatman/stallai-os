import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PostTypeDto {
  ARTICLE = 'article',
  TIP = 'tip',
  QUESTION = 'question',
  SHOWOFF = 'showoff',
  DISCUSSION = 'discussion',
}

export class CreatePostDto {
  @ApiProperty({ description: '帖子标题', example: '分享我的摆摊心得' })
  @IsNotEmpty({ message: '帖子标题不能为空' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '帖子内容' })
  @IsNotEmpty({ message: '帖子内容不能为空' })
  @IsString()
  content: string;

  @ApiProperty({ description: '帖子类型', enum: PostTypeDto })
  @IsEnum(PostTypeDto)
  type: PostTypeDto;

  @ApiPropertyOptional({ description: '封面图片' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '图片列表(JSON数组)' })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiPropertyOptional({ description: '标签，用逗号分隔', example: '经验,技巧,生财' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: '是否公开', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: '位置' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ description: '帖子标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '帖子内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '帖子类型', enum: PostTypeDto })
  @IsOptional()
  @IsEnum(PostTypeDto)
  type?: PostTypeDto;

  @ApiPropertyOptional({ description: '封面图片' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '图片列表' })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: '位置' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '是否置顶' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class PostQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '帖子类型', enum: PostTypeDto })
  @IsOptional()
  @IsEnum(PostTypeDto)
  type?: PostTypeDto;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '评论图片' })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiPropertyOptional({ description: '父评论ID（回复）' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;
}
