import { request } from './api';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLevel: number;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  title: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

interface PostFormData {
  content: string;
  images?: string[];
  tags?: string[];
}

export const communityService = {
  /**
   * Get community posts
   */
  getPosts: async (params?: {
    sortBy?: 'latest' | 'popular' | 'following';
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<Post[]> => {
    const response = await request<Post[]>('GET', '/community/posts', { params });
    return response.data || [];
  },

  /**
   * Get single post
   */
  getPost: async (id: string): Promise<Post> => {
    const response = await request<Post>('GET', `/community/posts/${id}`);
    return response.data!;
  },

  /**
   * Create new post
   */
  createPost: async (data: PostFormData): Promise<Post> => {
    const response = await request<Post>('POST', '/community/posts', data);
    return response.data!;
  },

  /**
   * Delete post
   */
  deletePost: async (id: string): Promise<void> => {
    await request<void>('DELETE', `/community/posts/${id}`);
  },

  /**
   * Like post
   */
  likePost: async (id: string): Promise<void> => {
    await request('POST', `/community/posts/${id}/like`);
  },

  /**
   * Unlike post
   */
  unlikePost: async (id: string): Promise<void> => {
    await request('DELETE', `/community/posts/${id}/like`);
  },

  /**
   * Bookmark post
   */
  bookmarkPost: async (id: string): Promise<void> => {
    await request('POST', `/community/posts/${id}/bookmark`);
  },

  /**
   * Get post comments
   */
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await request<Comment[]>('GET', `/community/posts/${postId}/comments`);
    return response.data || [];
  },

  /**
   * Add comment
   */
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await request<Comment>('POST', `/community/posts/${postId}/comments`, {
      content,
    });
    return response.data!;
  },

  /**
   * Get top members
   */
  getTopMembers: async (limit?: number): Promise<User[]> => {
    const response = await request<User[]>('GET', '/community/top-members', {
      params: { limit },
    });
    return response.data || [];
  },

  /**
   * Get user profile
   */
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await request<User>('GET', `/community/users/${userId}`);
    return response.data!;
  },

  /**
   * Follow user
   */
  followUser: async (userId: string): Promise<void> => {
    await request('POST', `/community/users/${userId}/follow`);
  },

  /**
   * Unfollow user
   */
  unfollowUser: async (userId: string): Promise<void> => {
    await request('DELETE', `/community/users/${userId}/follow`);
  },

  /**
   * Get trending tags
   */
  getTrendingTags: async (): Promise<{ tag: string; count: number }[]> => {
    const response = await request<{ tag: string; count: number }[]>('GET', '/community/trending-tags');
    return response.data || [];
  },

  /**
   * Share post
   */
  sharePost: async (id: string, platform: 'wechat' | 'moments' | 'copy'): Promise<string> => {
    const response = await request<string>('POST', `/community/posts/${id}/share`, {
      platform,
    });
    return response.data!;
  },
};

export default communityService;
