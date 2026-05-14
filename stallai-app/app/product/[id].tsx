/**
 * 商品详情页面
 * Product Detail Page
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

// 导入 hooks
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/src/hooks/useProducts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // 编辑处理
  const handleSave = async () => {
    try {
      await updateProduct.mutateAsync({ id, ...editData });
      setIsEditing(false);
      Alert.alert('成功', '商品已更新');
    } catch (error) {
      Alert.alert('错误', '更新失败');
    }
  };

  // 删除处理
  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      '确定要删除这个商品吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(id);
              router.back();
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-400">商品不存在</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <Stack.Screen
        options={{
          headerTitle: product.name,
          headerRight: () => (
            <View className="flex-row">
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)} className="mr-4">
                <Ionicons name={isEditing ? 'close' : 'create'} size={24} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 商品图片 */}
        <View className="bg-white">
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400x300' }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* 商品信息 */}
        <View className="px-4 py-4">
          <GlassCard className="mb-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-white text-xl font-bold">
                  {product.name}
                </Text>
                <Text className="text-slate-500 text-sm mt-1">
                  商品ID: {product.id}
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${
                product.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                <Text className={`text-sm ${
                  product.status === 'active' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-slate-500'
                }`}>
                  {product.status === 'active' ? '在售' : '已下架'}
                </Text>
              </View>
            </View>

            {/* 价格信息 */}
            <View className="flex-row mt-4 -mx-2">
              <View className="flex-1 mx-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <Text className="text-slate-500 text-xs">售价</Text>
                <Text className="text-primary-500 text-lg font-bold mt-1">
                  ¥{product.price?.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 mx-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <Text className="text-slate-500 text-xs">成本</Text>
                <Text className="text-slate-700 dark:text-slate-300 text-lg font-bold mt-1">
                  ¥{product.cost?.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 mx-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <Text className="text-slate-500 text-xs">利润</Text>
                <Text className="text-green-500 text-lg font-bold mt-1">
                  ¥{((product.price || 0) - (product.cost || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* 库存信息 */}
          <GlassCard className="mb-4">
            <Text className="text-slate-800 dark:text-white font-semibold mb-3">
              库存信息
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-slate-500 text-sm">当前库存</Text>
                <Text className={`text-2xl font-bold mt-1 ${
                  (product.stock || 0) <= (product.lowStockThreshold || 10)
                    ? 'text-red-500'
                    : 'text-slate-800 dark:text-white'
                }`}>
                  {product.stock || 0}
                </Text>
              </View>
              <View className="w-24 h-24 rounded-full border-8 border-slate-200 items-center justify-center">
                <Text className="text-slate-400 text-sm">
                  {Math.round(((product.stock || 0) / (product.maxStock || 100)) * 100)}%
                </Text>
              </View>
            </View>
            <View className="mt-3 flex-row items-center">
              <Ionicons name="alert-circle" size={16} color="#f59e0b" />
              <Text className="text-slate-500 text-sm ml-2">
                低库存预警: {product.lowStockThreshold || 10} 件
              </Text>
            </View>
          </GlassCard>

          {/* 销售统计 */}
          <GlassCard className="mb-4">
            <Text className="text-slate-800 dark:text-white font-semibold mb-3">
              销售统计
            </Text>
            <View className="flex-row -mx-2">
              <View className="flex-1 mx-2">
                <Text className="text-slate-500 text-xs">总销量</Text>
                <Text className="text-slate-800 dark:text-white text-lg font-bold mt-1">
                  {product.totalSold || 0} 件
                </Text>
              </View>
              <View className="flex-1 mx-2">
                <Text className="text-slate-500 text-xs">总销售额</Text>
                <Text className="text-primary-500 text-lg font-bold mt-1">
                  ¥{((product.totalSold || 0) * (product.price || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* 商品描述 */}
          <GlassCard className="mb-4">
            <Text className="text-slate-800 dark:text-white font-semibold mb-3">
              商品描述
            </Text>
            <Text className="text-slate-600 dark:text-slate-400 text-sm leading-5">
              {product.description || '暂无描述'}
            </Text>
          </GlassCard>

          {/* 快速操作 */}
          <View className="flex-row -mx-2">
            <TouchableOpacity
              className="flex-1 mx-2 bg-primary-500 rounded-xl py-3 items-center"
              onPress={() => router.push('/product/new')}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="text-white text-sm mt-1">添加库存</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 mx-2 bg-slate-100 dark:bg-slate-700 rounded-xl py-3 items-center"
              onPress={() => router.push('/supplier/index')}
            >
              <Ionicons name="storefront" size={20} color="#64748b" />
              <Text className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                查看货源
              </Text>
            </TouchableOpacity>
          </View>

          {/* 底部安全区域 */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
  },
});
