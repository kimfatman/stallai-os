/**
 * 社区页面
 * Community Page - 摊主社区交流
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { PostCard } from '@/src/components/community/PostCard';
import { PostForm } from '@/src/components/community/PostForm';

// 导入 hooks
import { usePosts, useCreatePost, useLikePost, useComments } from '@/src/hooks/useCommunity';

// 帖子类型筛选
type CategoryFilter = 'all' | 'experience' | 'help' | 'trade' | 'announcement';

export default function CommunityScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取帖子列表
  const { data: posts, isLoading, refetch } = usePosts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery || undefined,
  });

  // 创建帖子
  const createPost = useCreatePost();
  // 点赞
  const likePost = useLikePost();

  // 获取评论
  const { data: comments } = useComments(selectedPost?.id);

  // 刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // 发布帖子
  const handleCreatePost = async (data: any) => {
    try {
      await createPost.mutateAsync(data);
      setShowCreateModal(false);
      Alert.alert('成功', '帖子已发布');
    } catch (error) {
      Alert.alert('错误', '发布失败，请重试');
    }
  };

  // 点赞处理
  const handleLike = async (postId: string) => {
    try {
      await likePost.mutateAsync(postId);
    } catch (error) {
      Alert.alert('错误', '操作失败');
    }
  };

  // 分类选项
  const categories = [
    { key: 'all', label: '全部', icon: 'apps' },
    { key: 'experience', label: '经验', icon: 'bulb', color: '#f59e0b' },
    { key: 'help', label: '求助', icon: 'help-circle', color: '#ef4444' },
    { key: 'trade', label: '交易', icon: 'swap-horizontal', color: '#22c55e' },
    { key: 'announcement', label: '公告', icon: 'megaphone', color: '#3b82f6' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 头部 */}
      <View className="bg-primary-600 dark:bg-slate-800 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">社区</Text>
          <TouchableOpacity
            className="bg-white/20 rounded-full p-2"
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 搜索框 */}
        <View className="flex-row items-center bg-white/20 rounded-xl px-4 py-2 mt-4">
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            className="flex-1 text-white ml-2 text-base"
            placeholder="搜索话题..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 分类筛选 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white dark:bg-slate-800 py-3 px-4 border-b border-slate-200 dark:border-slate-700"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
              selectedCategory === category.key
                ? 'bg-primary-500'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}
            onPress={() => setSelectedCategory(category.key as CategoryFilter)}
          >
            <Ionicons
              name={category.icon as any}
              size={14}
              color={
                selectedCategory === category.key
                  ? 'white'
                  : category.color || '#64748b'
              }
            />
            <Text
              className={`ml-1 text-sm ${
                selectedCategory === category.key
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 热门话题 */}
      <View className="px-4 py-3 bg-white dark:bg-slate-800/50">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trending-up" size={16} color="#f59e0b" />
          <Text className="text-slate-700 dark:text-slate-300 font-medium text-sm ml-1">
            热门话题
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['#夜市摆摊', '#新手入门', '#爆款推荐', '#进货渠道', '#营销技巧'].map(
            (tag, index) => (
              <TouchableOpacity
                key={index}
                className="bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full mr-2"
              >
                <Text className="text-primary-600 dark:text-primary-400 text-sm">
                  {tag}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      {/* 帖子列表 */}
      <FlatList
        data={posts || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => setSelectedPost(item)}
            onShare={() => {}}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4">暂无帖子</Text>
            <Text className="text-slate-400 text-sm mt-1">成为第一个分享的人吧</Text>
            <TouchableOpacity
              className="mt-4 bg-primary-500 px-6 py-2 rounded-full"
              onPress={() => setShowCreateModal(true)}
            >
              <Text className="text-white font-medium">发布帖子</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 发布按钮 */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center shadow-lg"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="create" size={24} color="white" />
      </TouchableOpacity>

      {/* 创建帖子弹窗 */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <PostForm
          onSubmit={handleCreatePost}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createPost.isPending}
        />
      </Modal>

      {/* 帖子详情弹窗 */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPost(null)}
      >
        <View className="flex-1 bg-white dark:bg-slate-900">
          <View className="flex-row justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
            <TouchableOpacity onPress={() => setSelectedPost(null)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text className="text-slate-800 dark:text-white font-semibold">
              帖子详情
            </Text>
            <View className="w-6" />
          </View>
          {selectedPost && (
            <ScrollView className="flex-1 p-4">
              <PostCard post={selectedPost} expanded onLike={() => handleLike(selectedPost.id)} />
              <Text className="text-slate-600 dark:text-slate-300 font-medium mt-6 mb-3">
                评论 ({comments?.length || 0})
              </Text>
              {comments?.map((comment: any, index: number) => (
                <View key={index} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-2">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-slate-200 rounded-full" />
                    <View className="ml-2">
                      <Text className="text-slate-800 dark:text-white text-sm font-medium">
                        {comment.author}
                      </Text>
                      <Text className="text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-600 dark:text-slate-300 text-sm mt-2">
                    {comment.content}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
