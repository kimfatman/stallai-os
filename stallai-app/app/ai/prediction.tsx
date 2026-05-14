import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import GlassCard from '@/components/ui/GlassCard';

interface TrendingProduct {
  id: string;
  name: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  growth: number;
  reason: string;
  risk: '低' | '中' | '高';
  potential: number;
}

const mockTrends: TrendingProduct[] = [
  {
    id: '1',
    name: '淄博烧烤',
    category: '肉类',
    trend: 'up',
    growth: 156,
    reason: '网红城市效应持续，周边搜索量暴涨',
    risk: '低',
    potential: 95,
  },
  {
    id: '2',
    name: '柠檬茶',
    category: '饮品',
    trend: 'up',
    growth: 89,
    reason: '夏季清凉饮品需求激增',
    risk: '低',
    potential: 88,
  },
  {
    id: '3',
    name: '淀粉肠',
    category: '肉类',
    trend: 'up',
    growth: 67,
    reason: '低成本高回报，新手友好',
    risk: '低',
    potential: 82,
  },
  {
    id: '4',
    name: '关东煮',
    category: '小吃',
    trend: 'stable',
    growth: 12,
    reason: '稳定品类，四季皆宜',
    risk: '低',
    potential: 65,
  },
  {
    id: '5',
    name: '烤冷面',
    category: '主食',
    trend: 'stable',
    growth: 5,
    reason: '经典品类，市场趋于饱和',
    risk: '中',
    potential: 55,
  },
];

const timeRanges = ['今日', '本周', '本月', '本季'];

export default function PredictionScreen() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState('本周');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return '#43A047';
      case 'down':
        return '#E53935';
      default:
        return '#757575';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case '低':
        return '#43A047';
      case '中':
        return '#FFB300';
      case '高':
        return '#E53935';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={['#FAFAFA', '#F5F0EB', '#FFFFFF']}
        style={styles.background}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>爆款预测</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <MaterialCommunityIcons name="refresh" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </Animated.View>

        {/* AI Prediction Summary */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <GlassCard variant="gradient" style={styles.summaryCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <MaterialCommunityIcons name="brain" size={20} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI趋势预测</Text>
              </View>
              <View style={styles.updateTime}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.updateTimeText}>更新于 10:30</Text>
              </View>
            </View>
            <Text style={styles.summaryText}>
              基于市场数据分析，未来7天烧烤类、小吃类商品将迎来爆发式增长，建议提前备货。
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Time Range Selector */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <View style={styles.timeRangeContainer}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  selectedRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => setSelectedRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    selectedRange === range && styles.timeRangeTextActive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Trend List */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>热门趋势商品</Text>
            <Text style={styles.listCount}>共 {mockTrends.length} 个</Text>
          </View>

          {mockTrends.map((product, index) => (
            <Animated.View
              key={product.id}
              entering={FadeInUp.delay(350 + index * 80).duration(400)}
            >
              <GlassCard style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.trendInfo}>
                    <View style={styles.trendTitleRow}>
                      <Text style={styles.trendName}>{product.name}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{product.category}</Text>
                      </View>
                    </View>
                    <View style={styles.trendMeta}>
                      <View style={styles.trendIndicator}>
                        <MaterialCommunityIcons
                          name={getTrendIcon(product.trend) as any}
                          size={16}
                          color={getTrendColor(product.trend)}
                        />
                        <Text
                          style={[
                            styles.trendGrowth,
                            { color: getTrendColor(product.trend) },
                          ]}
                        >
                          +{product.growth}%
                        </Text>
                      </View>
                      <View style={styles.riskBadge}>
                        <Text style={[styles.riskText, { color: getRiskColor(product.risk) }]}>
                          风险: {product.risk}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.potentialContainer}>
                  <View style={styles.potentialHeader}>
                    <Text style={styles.potentialLabel}>爆款潜力</Text>
                    <Text style={styles.potentialValue}>{product.potential}%</Text>
                  </View>
                  <View style={styles.potentialTrack}>
                    <View
                      style={[styles.potentialFill, { width: `${product.potential}%` }]}
                    />
                  </View>
                </View>

                <View style={styles.reasonContainer}>
                  <View style={styles.reasonIcon}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#8B7355" />
                  </View>
                  <Text style={styles.reasonText}>{product.reason}</Text>
                </View>

                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>查看详情</Text>
                  <Ionicons name="chevron-forward" size={16} color="#757575" />
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Market Insights */}
        <Animated.View entering={FadeInUp.delay(700).duration(500)}>
          <Text style={styles.sectionTitle}>市场洞察</Text>
          <GlassCard style={styles.insightsCard}>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="lightbulb" size={24} color="#FFB300" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>夏季清凉经济</Text>
                <Text style={styles.insightText}>柠檬茶、冷饮类搜索量上涨120%，建议增加饮品品类</Text>
              </View>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="fire" size={24} color="#E53935" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>夜市经济复苏</Text>
                <Text style={styles.insightText}>周末夜市人流恢复至疫情前水平，烧烤类摊位营业额平均增长80%</Text>
              </View>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="wallet" size={24} color="#43A047" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>消费升级趋势</Text>
                <Text style={styles.insightText}>消费者更愿意为品质支付溢价，高客单价商品表现亮眼</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#8B7355',
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  updateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updateTimeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#E53935',
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  listCount: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  trendCard: {
    marginBottom: 14,
  },
  trendHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendInfo: {
    flex: 1,
  },
  trendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  trendName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  categoryBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#E53935',
  },
  trendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendGrowth: {
    fontSize: 14,
    fontWeight: '700',
  },
  riskBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  potentialContainer: {
    marginBottom: 12,
  },
  potentialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  potentialLabel: {
    fontSize: 12,
    color: '#757575',
  },
  potentialValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  potentialTrack: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  potentialFill: {
    height: '100%',
    backgroundColor: '#E53935',
    borderRadius: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F0EB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  reasonIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
  detailButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailButtonText: {
    fontSize: 13,
    color: '#757575',
    marginRight: 4,
  },
  insightsCard: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  insightDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
