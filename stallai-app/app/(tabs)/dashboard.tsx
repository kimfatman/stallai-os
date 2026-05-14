/**
 * 仪表盘页面 - AI驾驶舱
 * Dashboard - AI Cockpit
 * 
 * 提供经营数据总览、实时指标和 AI 分析入口
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
import { LineChart, PieChart } from 'react-native-chart-kit';

// 导入组件
import { GlassCard } from '@/src/components/ui/GlassCard';
import { DashboardCard } from '@/src/components/dashboard/DashboardCard';
import { AnimatedCounter } from '@/src/components/ui/AnimatedCounter';

// 导入 hooks
import { useDashboardStats } from '@/src/hooks/useDashboardStats';
import { useWeeklyTrend } from '@/src/hooks/useWeeklyTrend';

// 屏幕尺寸
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 仪表盘页面组件
 */
export default function DashboardScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);

  // 获取数据
  const { data: stats, isLoading } = useDashboardStats();
  const { data: trendData } = useWeeklyTrend(selectedPeriod);

  // 时间周期选项
  const periods = [
    { key: 'day', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
  ];

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 刷新数据
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // 图表数据
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => '#64748b',
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e2e8f0',
    },
  };

  // 收入趋势图表数据
  const revenueChartData = {
    labels: trendData?.labels || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    datasets: [
      {
        data: trendData?.revenue || [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // 订单类型分布
  const orderTypeData = stats?.orderTypeDistribution || [
    { name: '零售', value: 65, color: '#3b82f6', legendFontColor: '#64748b' },
    { name: '批发', value: 25, color: '#22c55e', legendFontColor: '#64748b' },
    { name: '预订', value: 10, color: '#f59e0b', legendFontColor: '#64748b' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 头部 */}
      <View className="bg-primary-600 dark:bg-slate-800 pt-12 pb-6 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">AI 驾驶舱</Text>
          <TouchableOpacity
            className="bg-white/20 rounded-full p-2"
            onPress={() => router.push('/ai/daily-report')}
          >
            <Ionicons name="sparkles" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 时间周期选择器 */}
        <View className="flex-row bg-white/20 rounded-full p-1 mt-4">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              className={`flex-1 py-2 px-4 rounded-full ${
                selectedPeriod === period.key ? 'bg-white' : 'bg-transparent'
              }`}
              onPress={() => setSelectedPeriod(period.key as typeof selectedPeriod)}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  selectedPeriod === period.key
                    ? 'text-primary-600'
                    : 'text-white'
                }`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        <View className="px-4 py-4">
          {/* 核心指标卡片 */}
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <DashboardCard
                title="总收入"
                value={stats?.totalRevenue || 0}
                prefix="¥"
                trend={stats?.revenueGrowth || 0}
                icon="trending-up"
                iconColor="#22c55e"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <DashboardCard
                title="总订单"
                value={stats?.totalOrders || 0}
                unit="笔"
                trend={stats?.ordersGrowth || 0}
                icon="cart"
                iconColor="#3b82f6"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <DashboardCard
                title="客单价"
                value={stats?.avgOrderValue || 0}
                prefix="¥"
                icon="person"
                iconColor="#8b5cf6"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <DashboardCard
                title="毛利率"
                value={stats?.grossMargin || 0}
                suffix="%"
                icon="percent"
                iconColor="#f59e0b"
              />
            </View>
          </View>

          {/* 收入趋势图表 */}
          <GlassCard className="mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-800 dark:text-white font-semibold text-base">
                收入趋势
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-primary-500 text-sm">查看详情</Text>
                <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <LineChart
              data={revenueChartData}
              width={SCREEN_WIDTH - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </GlassCard>

          {/* 订单类型分布 */}
          <GlassCard className="mb-4">
            <Text className="text-slate-800 dark:text-white font-semibold text-base mb-4">
              订单类型分布
            </Text>
            <View className="flex-row items-center justify-between">
              <PieChart
                data={orderTypeData}
                width={120}
                height={120}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
              <View className="flex-1 ml-4">
                {orderTypeData.map((item) => (
                  <View key={item.name} className="flex-row items-center mb-2">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-slate-600 dark:text-slate-300 flex-1">
                      {item.name}
                    </Text>
                    <Text className="text-slate-800 dark:text-white font-medium">
                      {item.value}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>

          {/* AI 分析入口 */}
          <TouchableOpacity
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4"
            onPress={() => router.push('/ai/selection')}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="bulb" size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  AI 智能选品
                </Text>
                <Text className="text-white/80 text-sm mt-1">
                  基于市场趋势的智能选品推荐
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* 爆款预测入口 */}
          <TouchableOpacity
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 mb-4"
            onPress={() => router.push('/ai/prediction')}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="flame" size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  爆款预测
                </Text>
                <Text className="text-white/80 text-sm mt-1">
                  预测未来热门商品，抢占先机
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* 底部安全区域 */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginLeft: -16,
  },
});
