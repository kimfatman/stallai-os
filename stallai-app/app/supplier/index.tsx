/**
 * 货源广场页面
 * Supplier Marketplace Page
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { SupplierCard } from '@/src/components/supplier/SupplierCard';

// 导入 hooks
import { useSuppliers } from '@/src/hooks/useSuppliers';

// 供应商类型筛选
type SupplierCategory = 'all' | 'food' | 'materials' | 'equipment';

export default function SupplierIndexScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<SupplierCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 获取供应商数据
  const { data: suppliers, isLoading, refetch } = useSuppliers({
    category: category === 'all' ? undefined : category,
    search: searchQuery || undefined,
  });

  // 刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // 分类选项
  const categories = [
    { key: 'all', label: '全部', icon: 'apps' },
    { key: 'food', label: '食品原料', icon: 'restaurant' },
    { key: 'materials', label: '包装材料', icon: 'cube' },
    { key: 'equipment', label: '设备工具', icon: 'construct' },
  ];

  // 热门供应商
  const featuredSuppliers = suppliers?.featured || [];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 头部 */}
      <View className="bg-primary-600 dark:bg-slate-800 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">货源广场</Text>
          <TouchableOpacity className="bg-white/20 rounded-full p-2">
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* 搜索框 */}
        <View className="flex-row items-center bg-white/20 rounded-xl px-4 py-2 mt-3">
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            className="flex-1 text-white ml-2 text-base"
            placeholder="搜索供应商或商品..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 分类筛选 */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3 px-4">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                category === cat.key
                  ? 'bg-primary-500'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
              onPress={() => setCategory(cat.key as SupplierCategory)}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={category === cat.key ? 'white' : '#64748b'}
              />
              <Text
                className={`ml-1 text-sm ${
                  category === cat.key
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 热门推荐 */}
      {!searchQuery && category === 'all' && (
        <View className="px-4 py-3 bg-white dark:bg-slate-800/50">
          <View className="flex-row items-center mb-3">
            <Ionicons name="star" size={18} color="#f59e0b" />
            <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm ml-2">
              热门推荐
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredSuppliers.map((supplier: any) => (
              <TouchableOpacity
                key={supplier.id}
                className="mr-3"
                onPress={() => router.push(`/supplier/${supplier.id}`)}
              >
                <GlassCard className="w-40">
                  <View className="w-full h-20 bg-slate-100 dark:bg-slate-700 rounded-lg mb-2" />
                  <Text className="text-slate-800 dark:text-white font-medium text-sm truncate">
                    {supplier.name}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-1">
                    {supplier.category}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text className="text-slate-500 text-xs ml-1">
                      {supplier.rating}
                    </Text>
                    <Text className="text-primary-500 text-xs ml-auto">
                      ¥{supplier.minOrder}起
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 供应商列表 */}
      <FlatList
        data={suppliers?.list || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SupplierCard
            supplier={item}
            onPress={() => router.push(`/supplier/${item.id}`)}
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
        ListHeaderComponent={
          <Text className="text-slate-600 dark:text-slate-400 text-sm px-4 py-2">
            共 {suppliers?.total || 0} 家供应商
          </Text>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="storefront-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4">暂无供应商</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
});
