import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '@/services/communityService';

export function usePosts(params?: {
  sortBy?: 'latest' | 'popular' | 'following';
  tag?: string;
}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => communityService.getPosts(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => communityService.getPost(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communityService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communityService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communityService.likePost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communityService.unlikePost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}

export function useBookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communityService.bookmarkPost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => communityService.getComments(postId),
    enabled: !!postId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      communityService.addComment(postId, content),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

export function useTopMembers() {
  return useQuery({
    queryKey: ['topMembers'],
    queryFn: () => communityService.getTopMembers(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTrendingTags() {
  return useQuery({
    queryKey: ['trendingTags'],
    queryFn: communityService.getTrendingTags,
    staleTime: 1000 * 60 * 30,
  });
}
