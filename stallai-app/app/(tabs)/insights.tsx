/**
 * AI 分析页面
 * AI Insights Page - 数据分析与洞察
 */

import { useState } from 'react';
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
import { BarChart, RadarChart } from 'react-native-gesture-handler';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { InsightCard } from '@/src/components/ai/InsightCard';
import { TrendCard } from '@/src/components/ai/TrendCard';

// 导入 hooks
import { useAIInsights, useSalesAnalysis, useMarketTrends } from '@/src/hooks/useAIInsights';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 分析类型
type AnalysisType = 'overview' | 'sales' | 'market' | 'profit';

export default function InsightsScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AnalysisType>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // 获取数据
  const { data: insights, isLoading: insightsLoading } = useAIInsights();
  const { data: salesData } = useSalesAnalysis();
  const { data: marketTrends } = useMarketTrends();

  // 刷新
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 分析类型选项
  const analysisTypes = [
    { key: 'overview', label: '总览', icon: 'grid' },
    { key: 'sales', label: '销售', icon: 'trending-up' },
    { key: 'market', label: '市场', icon: 'globe' },
    { key: 'profit', label: '利润', icon: 'wallet' },
  ];

  // 图表配置
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    labelColor: () => '#64748b',
  };

  // 雷达图数据 - 经营健康度
  const healthRadarData = insights?.healthRadar || {
    labels: ['销售', '库存', '利润', '客户', '趋势'],
    datasets: [{ data: [80, 65, 75, 70, 85] }],
  };

  // 周销售数据
  const weeklySalesData = salesData?.weekly || {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    revenue: [1200, 1500, 1100, 1800, 2200, 2800, 2400],
    orders: [45, 55, 42, 68, 82, 105, 95],
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 头部 */}
      <View className="bg-primary-600 dark:bg-slate-800 pt-12 pb-6 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">AI 分析</Text>
          <TouchableOpacity
            className="bg-white/20 rounded-full p-2"
            onPress={() => router.push('/ai/prediction')}
          >
            <Ionicons name="sparkles" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* AI 健康度评分 */}
        <GlassCard className="mt-4 bg-white/20 border-0">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {insights?.healthScore || 85}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white/70 text-sm">经营健康度</Text>
              <Text className="text-white text-lg font-semibold">
                {insights?.healthStatus || '优秀'}
              </Text>
              <Text className="text-white/60 text-xs mt-1">
                较上周提升 {insights?.improvement || 5}%
              </Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* 分析类型选择 */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3 px-4">
          {analysisTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                selectedType === type.key
                  ? 'bg-primary-500'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
              onPress={() => setSelectedType(type.key as AnalysisType)}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={selectedType === type.key ? 'white' : '#64748b'}
              />
              <Text
                className={`ml-2 ${
                  selectedType === type.key
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        <View className="p-4">
          {/* 经营健康雷达图 */}
          <GlassCard className="mb-4">
            <Text className="text-slate-800 dark:text-white font-semibold text-base mb-4">
              经营健康度分析
            </Text>
            <RadarChart
              data={healthRadarData}
              width={SCREEN_WIDTH - 64}
              height={200}
              chartConfig={{
                ...chartConfig,
                backgroundColor: 'transparent',
              }}
              style={styles.chart}
            />
          </GlassCard>

          {/* AI 洞察卡片 */}
          <Text className="text-slate-800 dark:text-white font-semibold text-base mb-3">
            AI 智能洞察
          </Text>
          {insights?.insights?.map((insight: any, index: number) => (
            <InsightCard key={index} insight={insight} />
          ))}

          {/* 市场趋势 */}
          <Text className="text-slate-800 dark:text-white font-semibold text-base mt-6 mb-3">
            市场趋势
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
            {marketTrends?.trends?.map((trend: any, index: number) => (
              <TrendCard key={index} trend={trend} />
            ))}
          </ScrollView>

          {/* 周销售对比 */}
          <GlassCard className="mt-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-800 dark:text-white font-semibold text-base">
                周销售趋势
              </Text>
              <View className="flex-row">
                <View className="flex-row items-center mr-4">
                  <View className="w-3 h-3 bg-primary-500 rounded-full mr-1" />
                  <Text className="text-slate-500 text-xs">收入</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                  <Text className="text-slate-500 text-xs">订单</Text>
                </View>
              </View>
            </View>
            <BarChart
              data={{
                labels: weeklySalesData.labels,
                datasets: [
                  { data: weeklySalesData.revenue.map((v) => v / 100) },
                ],
              }}
              width={SCREEN_WIDTH - 64}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          </GlassCard>

          {/* AI 选品推荐 */}
          <TouchableOpacity
            className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 mt-6"
            onPress={() => router.push('/ai/selection')}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
                <Ionicons name="bulb" size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">AI 智能选品</Text>
                <Text className="text-white/80 text-sm mt-1">根据市场分析推荐最适合的商品</Text>
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
    marginLeft: -8,
  },
});
