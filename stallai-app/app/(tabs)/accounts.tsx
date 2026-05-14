/**
 * 记账页面
 * Accounts Page - 交易记录管理
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
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { TransactionForm } from '@/src/components/accounts/TransactionForm';
import { TransactionItem } from '@/src/components/accounts/TransactionItem';

// 导入 hooks
import { useTransactions, useCreateTransaction, useTransactionStats } from '@/src/hooks/useTransactions';

// 交易类型
type TransactionType = 'income' | 'expense';
// 时间筛选
type TimeFilter = 'today' | 'week' | 'month' | 'all';

export default function AccountsScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 获取交易数据
  const { data: transactions, isLoading } = useTransactions({
    type: selectedType === 'all' ? undefined : selectedType,
    period: timeFilter,
  });

  // 获取统计数据
  const { data: stats } = useTransactionStats();

  // 创建交易
  const createTransaction = useCreateTransaction();

  // 刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // 添加交易
  const handleAddTransaction = async (data: any) => {
    try {
      await createTransaction.mutateAsync(data);
      setShowAddModal(false);
      Alert.alert('成功', '交易记录已添加');
    } catch (error) {
      Alert.alert('错误', '添加交易失败');
    }
  };

  // 交易类型选项
  const typeOptions = [
    { key: 'all', label: '全部', icon: 'list' },
    { key: 'income', label: '收入', icon: 'arrow-down-circle', color: '#22c55e' },
    { key: 'expense', label: '支出', icon: 'arrow-up-circle', color: '#ef4444' },
  ];

  // 时间筛选选项
  const timeOptions = [
    { key: 'today', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'all', label: '全部' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 头部 */}
      <View className="bg-primary-600 dark:bg-slate-800 pt-12 pb-6 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">记账</Text>
          <TouchableOpacity
            className="bg-white/20 rounded-full p-2"
            onPress={() => router.push('/(tabs)/insights')}
          >
            <Ionicons name="bar-chart" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 统计卡片 */}
        <View className="flex-row mt-4 -mx-1">
          <View className="flex-1 mx-1 bg-green-500/20 rounded-xl p-3">
            <Text className="text-white/70 text-xs">今日收入</Text>
            <Text className="text-white text-xl font-bold mt-1">
              ¥{stats?.todayIncome?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View className="flex-1 mx-1 bg-red-500/20 rounded-xl p-3">
            <Text className="text-white/70 text-xs">今日支出</Text>
            <Text className="text-white text-xl font-bold mt-1">
              ¥{stats?.todayExpense?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View className="flex-1 mx-1 bg-blue-500/20 rounded-xl p-3">
            <Text className="text-white/70 text-xs">今日利润</Text>
            <Text className="text-white text-xl font-bold mt-1">
              ¥{stats?.todayProfit?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* 筛选区域 */}
      <View className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {/* 交易类型筛选 */}
        <View className="flex-row items-center mb-3">
          {typeOptions.map((type) => (
            <TouchableOpacity
              key={type.key}
              className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${
                selectedType === type.key
                  ? 'bg-primary-500'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
              onPress={() => setSelectedType(type.key as typeof selectedType)}
            >
              <Ionicons
                name={type.icon as any}
                size={14}
                color={
                  selectedType === type.key
                    ? 'white'
                    : type.color || '#64748b'
                }
              />
              <Text
                className={`text-sm ml-1 ${
                  selectedType === type.key
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 时间筛选 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeOptions.map((time) => (
            <TouchableOpacity
              key={time.key}
              className={`px-4 py-2 rounded-lg mr-2 ${
                timeFilter === time.key
                  ? 'bg-primary-500'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
              onPress={() => setTimeFilter(time.key as TimeFilter)}
            >
              <Text
                className={`text-sm ${
                  timeFilter === time.key
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {time.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 交易列表 */}
      <FlatList
        data={transactions || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(`/transaction/${item.id}`)}
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
            <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4">暂无交易记录</Text>
            <Text className="text-slate-400 text-sm mt-1">
              点击下方按钮添加第一笔记录
            </Text>
          </View>
        }
      />

      {/* 添加按钮 */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* 添加交易弹窗 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddModal(false)}
          isLoading={createTransaction.isPending}
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
