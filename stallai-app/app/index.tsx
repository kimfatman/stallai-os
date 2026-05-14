/**
 * 首页 - AI 驾驶舱
 * AI Dashboard Home
 * 
 * 展示整体经营概况、AI 分析摘要和快速操作入口
 */

import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// 导入组件
import { GlassCard } from '@/src/components/ui/GlassCard';
import { AnimatedCounter } from '@/src/components/ui/AnimatedCounter';
import { AISummaryCard } from '@/src/components/dashboard/AISummaryCard';
import { QuickActionGrid } from '@/src/components/dashboard/QuickActionGrid';
import { RecentTransactionsList } from '@/src/components/dashboard/RecentTransactionsList';
import { InventoryAlertBadge } from '@/src/components/dashboard/InventoryAlertBadge';

// 导入类型
import type { DashboardStats, AIInsight } from '@/src/types';

// 导入 hooks
import { useDashboardStats } from '@/src/hooks/useDashboardStats';
import { useAIInsights } from '@/src/hooks/useAIInsights';

// 获取屏幕宽度
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 首页组件
 * AI 驾驶舱主界面
 */
export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // 使用 hooks 获取数据
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: insights, isLoading: insightsLoading } = useAIInsights();

  // 下拉刷新处理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 刷新数据
    await Promise.all([
      // 刷新仪表盘数据
    ]);
    setRefreshing(false);
  }, []);

  // 今日概览数据
  const todayStats = stats?.today || {
    revenue: 0,
    orders: 0,
    visitors: 0,
    profit: 0,
  };

  // AI 洞察摘要
  const aiSummary = insights?.summary || {
    status: 'normal',
    highlights: [],
    suggestions: [],
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
      >
        {/* 顶部渐变背景 */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* 日期和问候语 */}
          <View className="flex-row justify-between items-center px-5 pt-12 pb-4">
            <View>
              <Text className="text-white/80 text-sm">
                {new Date().toLocaleDateString('zh-CN', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text className="text-white text-2xl font-bold mt-1">
                早上好，摊主
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/ai/daily-report')}
              className="bg-white/20 rounded-full p-3"
            >
              <Ionicons name="sparkles" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* 今日核心指标 */}
          <View className="px-5 pb-6">
            <View className="flex-row justify-between">
              {/* 今日收入 */}
              <View className="flex-1 bg-white/10 rounded-2xl p-4 mr-2">
                <Text className="text-white/70 text-xs">今日收入</Text>
                <AnimatedCounter
                  value={todayStats.revenue}
                  prefix="¥"
                  className="text-white text-2xl font-bold mt-1"
                />
                <View className="flex-row items-center mt-2">
                  <Ionicons name="trending-up" size={14} color="#4ade80" />
                  <Text className="text-white/70 text-xs ml-1">
                    {stats?.revenueGrowth || 0}% 较昨日
                  </Text>
                </View>
              </View>

              {/* 今日订单 */}
              <View className="flex-1 bg-white/10 rounded-2xl p-4 ml-2">
                <Text className="text-white/70 text-xs">今日订单</Text>
                <AnimatedCounter
                  value={todayStats.orders}
                  className="text-white text-2xl font-bold mt-1"
                />
                <View className="flex-row items-center mt-2">
                  <Ionicons name="trending-up" size={14} color="#4ade80" />
                  <Text className="text-white/70 text-xs ml-1">
                    {stats?.ordersGrowth || 0}% 较昨日
                  </Text>
                </View>
              </View>
            </View>

            {/* 第二行指标 */}
            <View className="flex-row justify-between mt-3">
              {/* 客流量 */}
              <View className="flex-1 bg-white/10 rounded-2xl p-4 mr-2">
                <Text className="text-white/70 text-xs">客流量</Text>
                <AnimatedCounter
                  value={todayStats.visitors}
                  className="text-white text-xl font-bold mt-1"
                />
              </View>

              {/* 预估利润 */}
              <View className="flex-1 bg-white/10 rounded-2xl p-4 ml-2">
                <Text className="text-white/70 text-xs">预估利润</Text>
                <AnimatedCounter
                  value={todayStats.profit}
                  prefix="¥"
                  className="text-white text-xl font-bold mt-1"
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* 主要内容区域 */}
        <View className="px-4 -mt-6">
          {/* AI 分析摘要卡片 */}
          <GlassCard className="mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="bulb" size={18} color="white" />
                </View>
                <Text className="text-slate-800 dark:text-white font-semibold text-base">
                  AI 智能分析
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/ai/daily-report')}
                className="flex-row items-center"
              >
                <Text className="text-primary-500 text-sm">查看详情</Text>
                <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {/* AI 状态指示 */}
            <View className={`flex-row items-center mb-3 px-3 py-2 rounded-lg ${
              aiSummary.status === 'warning' 
                ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <View className={`w-2 h-2 rounded-full mr-2 ${
                aiSummary.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <Text className={`text-sm ${
                aiSummary.status === 'warning'
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {aiSummary.status === 'warning' ? '需要注意' : '经营良好'}
              </Text>
            </View>

            {/* AI 建议列表 */}
            <View className="space-y-2">
              {aiSummary.suggestions?.slice(0, 3).map((suggestion, index) => (
                <View key={index} className="flex-row items-start">
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color="#3b82f6" 
                    className="mt-0.5"
                  />
                  <Text className="text-slate-600 dark:text-slate-300 text-sm ml-2 flex-1">
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* 快速操作入口 */}
          <Text className="text-slate-800 dark:text-white font-semibold text-base mb-3">
            快捷操作
          </Text>
          <QuickActionGrid
            actions={[
              {
                icon: 'cash-outline',
                label: '记账',
                color: '#22c55e',
                onPress: () => router.push('/(tabs)/accounts'),
              },
              {
                icon: 'cube-outline',
                label: '库存',
                color: '#f59e0b',
                onPress: () => router.push('/(tabs)/inventory'),
                badge: stats?.lowStockCount,
              },
              {
                icon: 'bar-chart-outline',
                label: '分析',
                color: '#8b5cf6',
                onPress: () => router.push('/(tabs)/insights'),
              },
              {
                icon: 'storefront-outline',
                label: '货源',
                color: '#ec4899',
                onPress: () => router.push('/supplier/index'),
              },
            ]}
          />

          {/* 库存预警 */}
          <InventoryAlertBadge count={stats?.lowStockCount || 0} />

          {/* 近期交易 */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-800 dark:text-white font-semibold text-base">
                近期交易
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/accounts')}>
                <Text className="text-primary-500 text-sm">查看全部</Text>
              </TouchableOpacity>
            </View>
            <RecentTransactionsList limit={5} />
          </View>

          {/* 底部安全区域 */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
});
