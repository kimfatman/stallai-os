import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../../components/ui/GlassCard';
import { AIBadge } from '../../components/ui/AIBadge';
import { colors, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const weeklyData = [
    { day: '周一', revenue: 1850, orders: 32 },
    { day: '周二', revenue: 2100, orders: 35 },
    { day: '周三', revenue: 1950, orders: 30 },
    { day: '周四', revenue: 2240, orders: 38 },
    { day: '周五', revenue: 2580, orders: 42 },
    { day: '周六', revenue: 3200, orders: 55 },
    { day: '周日', revenue: 2900, orders: 48 },
  ];

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

  const predictions = {
    tomorrowRevenue: 2750,
    tomorrowOrders: 45,
    confidence: 85,
    trend: 'up' as const,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>AI 分析</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <View style={styles.predictionTitleRow}>
              <Ionicons name="sparkles" size={20} color={colors.wood} />
              <Text style={styles.predictionTitle}>明日预测</Text>
            </View>
            <AIBadge size="small" />
          </View>
          <View style={styles.predictionRow}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>预测营收</Text>
              <Text style={styles.predictionValue}>{formatCurrency(predictions.tomorrowRevenue, false)}</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={14} color={colors.success} />
                <Text style={styles.trendText}>+6.5%</Text>
              </View>
            </View>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>预测订单</Text>
              <Text style={styles.predictionValue}>{predictions.tomorrowOrders} 单</Text>
              <Text style={styles.confidenceText}>置信度 {predictions.confidence}%</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>本周趋势</Text>
        </View>

        <GlassCard style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {weeklyData.map((day, index) => {
              const height = (day.revenue / maxRevenue) * 150;
              return (
                <Animated.View key={day.day} entering={FadeInUp.delay(index * 100).duration(400)} style={styles.barContainer}>
                  <View style={[styles.bar, { height }]} />
                  <Text style={styles.barLabel}>{day.day}</Text>
                </Animated.View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.wood }]} />
              <Text style={styles.legendText}>营收趋势</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI 畅销预测</Text>
        </View>

        <GlassCard style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="flame" size={24} color={colors.red} />
            <Text style={styles.forecastTitle}>周末爆款预测</Text>
          </View>
          <View style={styles.forecastList}>
            {['烤肠', '奶茶', '鸡蛋灌饼'].map((item, index) => (
              <View key={item} style={styles.forecastItem}>
                <View style={styles.forecastRank}>
                  <Text style={styles.forecastRankText}>{index + 1}</Text>
                </View>
                <Text style={styles.forecastName}>{item}</Text>
                <Text style={styles.forecastGrowth}>预计+{20 - index * 5}%</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={20} color={colors.warning} />
            <Text style={styles.insightTitle}>AI 洞察</Text>
          </View>
          <Text style={styles.insightText}>
            周末客流预计较工作日增长约35%，建议提前备货烤肠和奶茶原料。同时，周六下午17:00-19:00为客流高峰，可适当推出限时优惠活动。
          </Text>
        </GlassCard>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: typography.sizes.xxxl, fontWeight: '700', color: colors.darkGray },
  predictionCard: { marginHorizontal: spacing.md, padding: spacing.lg },
  predictionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  predictionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  predictionTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.darkGray },
  predictionRow: { flexDirection: 'row', justifyContent: 'space-around' },
  predictionItem: { alignItems: 'center' },
  predictionLabel: { fontSize: typography.sizes.sm, color: colors.mediumGray },
  predictionValue: { fontSize: typography.sizes.xxxl, fontWeight: '700', color: colors.darkGray, marginTop: spacing.xs },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${colors.success}15`, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10, marginTop: spacing.xs },
  trendText: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: '600' },
  confidenceText: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: spacing.xs },
  sectionHeader: { marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.darkGray },
  chartCard: { marginHorizontal: spacing.md, padding: spacing.lg },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 24, backgroundColor: colors.wood, borderRadius: 12, minHeight: 20 },
  barLabel: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: spacing.sm },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: typography.sizes.xs, color: colors.mediumGray },
  forecastCard: { marginHorizontal: spacing.md, padding: spacing.lg },
  forecastHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  forecastTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  forecastList: { gap: spacing.sm },
  forecastItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  forecastRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.red, justifyContent: 'center', alignItems: 'center' },
  forecastRankText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: '700' },
  forecastName: { flex: 1, fontSize: typography.sizes.md, color: colors.darkGray, marginLeft: spacing.md },
  forecastGrowth: { fontSize: typography.sizes.sm, color: colors.success, fontWeight: '600' },
  insightCard: { marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  insightTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  insightText: { fontSize: typography.sizes.sm, color: colors.mediumGray, lineHeight: 22 },
  bottomPadding: { height: 100 },
});
