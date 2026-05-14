/**
 * 新建商品页面
 * New Product Page
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';

// 导入 hooks
import { useCreateProduct } from '@/src/hooks/useProducts';

export default function NewProductScreen() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    lowStockThreshold: '10',
    description: '',
    image: '',
  });

  // 表单处理
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 提交处理
  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.name.trim()) {
      Alert.alert('错误', '请输入商品名称');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('错误', '请输入有效的售价');
      return;
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      Alert.alert('错误', '请输入有效的成本');
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        description: formData.description,
        image: formData.image,
      });
      Alert.alert('成功', '商品已添加', [
        { text: '继续添加', onPress: () => setFormData({
          name: '', category: '', price: '', cost: '', 
          stock: '', lowStockThreshold: '10', description: '', image: ''
        })},
        { text: '返回', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('错误', '添加失败，请重试');
    }
  };

  // 商品分类
  const categories = [
    { id: 'food', name: '美食', icon: 'restaurant' },
    { id: 'drink', name: '饮品', icon: 'cafe' },
    { id: 'clothing', name: '服饰', icon: 'shirt' },
    { id: 'accessories', name: '配饰', icon: 'watch' },
    { id: 'crafts', name: '手工艺品', icon: 'color-palette' },
    { id: 'others', name: '其他', icon: 'ellipsis-horizontal' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <Stack.Screen
        options={{
          headerTitle: '添加商品',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* 商品图片 */}
            <GlassCard className="mb-4">
              <Text className="text-slate-800 dark:text-white font-semibold mb-3">
                商品图片
              </Text>
              <TouchableOpacity className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                {formData.image ? (
                  <Image source={{ uri: formData.image }} className="w-full h-full rounded-xl" />
                ) : (
                  <>
                    <Ionicons name="camera" size={40} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm mt-2">点击上传图片</Text>
                  </>
                )}
              </TouchableOpacity>
            </GlassCard>

            {/* 基本信息 */}
            <GlassCard className="mb-4">
              <Text className="text-slate-800 dark:text-white font-semibold mb-3">
                基本信息
              </Text>
              
              <View className="mb-4">
                <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  商品名称 *
                </Text>
                <TextInput
                  className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white"
                  placeholder="请输入商品名称"
                  placeholderTextColor="#94a3b8"
                  value={formData.name}
                  onChangeText={(v) => handleChange('name', v)}
                />
              </View>

              <View className="mb-4">
                <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  商品分类
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className={`mx-1 px-4 py-2 rounded-full flex-row items-center ${
                        formData.category === cat.id
                          ? 'bg-primary-500'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      onPress={() => handleChange('category', cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={formData.category === cat.id ? 'white' : '#64748b'}
                      />
                      <Text
                        className={`ml-1 text-sm ${
                          formData.category === cat.id
                            ? 'text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  商品描述
                </Text>
                <TextInput
                  className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white h-24"
                  placeholder="请输入商品描述"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(v) => handleChange('description', v)}
                />
              </View>
            </GlassCard>

            {/* 价格信息 */}
            <GlassCard className="mb-4">
              <Text className="text-slate-800 dark:text-white font-semibold mb-3">
                价格信息
              </Text>
              
              <View className="flex-row -mx-2 mb-4">
                <View className="flex-1 mx-2">
                  <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    售价 (元) *
                  </Text>
                  <TextInput
                    className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white"
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    value={formData.price}
                    onChangeText={(v) => handleChange('price', v)}
                  />
                </View>
                <View className="flex-1 mx-2">
                  <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    成本 (元) *
                  </Text>
                  <TextInput
                    className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white"
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    value={formData.cost}
                    onChangeText={(v) => handleChange('cost', v)}
                  />
                </View>
              </View>

              {/* 利润预览 */}
              {formData.price && formData.cost && (
                <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex-row items-center">
                  <Ionicons name="trending-up" size={20} color="#22c55e" />
                  <Text className="text-green-600 dark:text-green-400 ml-2">
                    预计利润: ¥{(
                      parseFloat(formData.price || '0') - parseFloat(formData.cost || '0')
                    ).toFixed(2)}
                    {' '}
                    (利润率: {(
                      ((parseFloat(formData.price || '0') - parseFloat(formData.cost || '0')) / 
                       parseFloat(formData.price || '1')) * 100
                    ).toFixed(1)}%)
                  </Text>
                </View>
              )}
            </GlassCard>

            {/* 库存信息 */}
            <GlassCard className="mb-4">
              <Text className="text-slate-800 dark:text-white font-semibold mb-3">
                库存信息
              </Text>
              
              <View className="flex-row -mx-2">
                <View className="flex-1 mx-2 mb-4">
                  <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    初始库存
                  </Text>
                  <TextInput
                    className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={formData.stock}
                    onChangeText={(v) => handleChange('stock', v)}
                  />
                </View>
                <View className="flex-1 mx-2 mb-4">
                  <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    低库存预警
                  </Text>
                  <TextInput
                    className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white"
                    placeholder="10"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={formData.lowStockThreshold}
                    onChangeText={(v) => handleChange('lowStockThreshold', v)}
                  />
                </View>
              </View>
            </GlassCard>

            {/* 提交按钮 */}
            <Button
              title="添加商品"
              onPress={handleSubmit}
              loading={createProduct.isPending}
              className="mb-8"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({});
