/**
 * 库存管理页面
 * Inventory Management Page
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { InventoryCard } from '@/src/components/inventory/InventoryCard';
import { InventoryForm } from '@/src/components/inventory/InventoryForm';

// 导入 hooks
import { useInventory, useCreateInventory, useUpdateInventory } from '@/src/hooks/useInventory';

// 库存状态筛选
type FilterStatus = 'all' | 'normal' | 'low' | 'out';

export default function InventoryScreen() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取库存数据
  const { data: inventory, isLoading, refetch } = useInventory({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
  });

  // 创建库存记录
  const createInventory = useCreateInventory();
  // 更新库存
  const updateInventory = useUpdateInventory();

  // 刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // 添加/编辑库存
  const handleSubmit = async (data: any) => {
    try {
      if (selectedItem) {
        await updateInventory.mutateAsync({ id: selectedItem.id, ...data });
        Alert.alert('成功', '库存已更新');
      } else {
        await createInventory.mutateAsync(data);
        Alert.alert('成功', '商品已添加');
      }
      setShowAddModal(false);
      setSelectedItem(null);
    } catch (error) {
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  // 筛选选项
  const filterOptions = [
    { key: 'all', label: '全部', count: inventory?.total || 0 },
    { key: 'normal', label: '正常', count: inventory?.normalCount || 0 },
    { key: 'low', label: '预警', count: inventory?.lowStockCount || 0 },
    { key: 'out', label: '缺货', count: inventory?.outOfStockCount || 0 },
  ];

  // 统计概览
  const overview = inventory?.overview || {
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockItems: 0,
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 头部 */}
      <View className="bg-primary-600 dark:bg-slate-800 pt-12 pb-6 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">库存管理</Text>
          <TouchableOpacity
            className="bg-white/20 rounded-full p-2"
            onPress={() => router.push('/product/new')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 搜索框 */}
        <View className="flex-row items-center bg-white/20 rounded-xl px-4 py-2 mt-4">
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            className="flex-1 text-white ml-2 text-base"
            placeholder="搜索商品..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 统计概览 */}
        <View className="flex-row mt-4 -mx-1">
          <View className="flex-1 mx-1 bg-white/10 rounded-xl p-3">
            <Text className="text-white/70 text-xs">商品总数</Text>
            <Text className="text-white text-xl font-bold mt-1">
              {overview.totalProducts}
            </Text>
          </View>
          <View className="flex-1 mx-1 bg-white/10 rounded-xl p-3">
            <Text className="text-white/70 text-xs">库存总量</Text>
            <Text className="text-white text-xl font-bold mt-1">
              {overview.totalStock}
            </Text>
          </View>
          <View className="flex-1 mx-1 bg-white/10 rounded-xl p-3">
            <Text className="text-white/70 text-xs">库存价值</Text>
            <Text className="text-white text-xl font-bold mt-1">
              ¥{overview.totalValue.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* 筛选标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white dark:bg-slate-800 py-3 px-4 border-b border-slate-200 dark:border-slate-700"
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
              filterStatus === filter.key
                ? 'bg-primary-500'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}
            onPress={() => setFilterStatus(filter.key as FilterStatus)}
          >
            <Text
              className={`text-sm ${
                filterStatus === filter.key
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {filter.label}
            </Text>
            <View
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filterStatus === filter.key
                  ? 'bg-white/20'
                  : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <Text
                className={`text-xs ${
                  filterStatus === filter.key
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 库存列表 */}
      <FlatList
        data={inventory?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InventoryCard
            item={item}
            onPress={() => router.push(`/product/${item.productId}`)}
            onStockUpdate={(quantity) => {
              setSelectedItem(item);
              setShowAddModal(true);
            }}
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
            <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4">暂无库存记录</Text>
            <TouchableOpacity
              className="mt-4 bg-primary-500 px-6 py-2 rounded-full"
              onPress={() => setShowAddModal(true)}
            >
              <Text className="text-white font-medium">添加商品</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 添加/编辑按钮 */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
        style={styles.fab}
        onPress={() => {
          setSelectedItem(null);
          setShowAddModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* 添加/编辑弹窗 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          setSelectedItem(null);
        }}
      >
        <InventoryForm
          initialData={selectedItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedItem(null);
          }}
          isLoading={createInventory.isPending || updateInventory.isPending}
        />
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
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
