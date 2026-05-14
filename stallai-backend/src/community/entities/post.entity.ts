import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

export enum PostType {
  ARTICLE = 'article',
  TIP = 'tip',
  QUESTION = 'question',
  SHOWOFF = 'showoff',
  DISCUSSION = 'discussion',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: PostType, default: PostType.DISCUSSION })
  type: PostType;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'simple-json', nullable: true })
  images: string;

  @Column({ nullable: true })
  tags: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  location: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
