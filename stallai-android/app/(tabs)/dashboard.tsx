import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { BusinessScore } from '../../components/dashboard/BusinessScore';
import { AISummary } from '../../components/dashboard/AISummary';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { MetricCard } from '../../components/ui/MetricCard';
import { GlassCard } from '../../components/ui/GlassCard';
import { AIBadge } from '../../components/ui/AIBadge';
import { colors, spacing, typography } from '../../theme';
import { dashboardService } from '../../services/dashboardService';
import { useDashboardStore } from '../../stores/dashboardStore';
import { AISuggestion } from '../../types';

export default function DashboardScreen() {
  const { setDashboardData, dashboardData, isLoading, setLoading, setError } = useDashboardStore();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) setDashboardData(data);
  }, [data]);

  const onRefresh = async () => {
    setLoading(true);
    try {
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新失败');
    } finally {
      setLoading(false);
    }
  };

  const metrics = dashboardData?.todayMetrics;
  const suggestions = dashboardData?.aiSuggestions || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>早上好，摊主</Text>
          <Text style={styles.date}>2024年1月15日 星期一</Text>
        </View>
        <View style={styles.levelBadge}>
          <Ionicons name="trophy" size={14} color={colors.wood} />
          <Text style={styles.levelText}>Lv.3</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching || isLoading} onRefresh={onRefresh} tintColor={colors.wood} colors={[colors.wood]} />}>
        {dashboardData && <BusinessScore score={dashboardData.businessScore} />}
        {dashboardData && <AISummary summary={dashboardData.aiSummary} />}

        <Animated.View entering={FadeInUp.delay(250).duration(600)} style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>今日数据</Text>
          <View style={styles.metricsGrid}>
            <MetricCard title="今日营收" value={metrics?.revenue || 0} type="currency" trend={metrics?.comparedToYesterday.revenue} icon="cash" iconColor={colors.success} />
            <MetricCard title="今日订单" value={metrics?.orders || 0} type="number" trend={metrics?.comparedToYesterday.orders} icon="receipt" iconColor={colors.info} />
          </View>
          <View style={[styles.metricsGrid, { marginTop: spacing.md }]}>
            <MetricCard title="今日利润" value={metrics?.profit || 0} type="currency" trend={metrics?.comparedToYesterday.profit} icon="trending-up" iconColor={colors.wood} />
            <MetricCard title="客单价" value={metrics?.avgOrderValue || 0} type="currency" icon="person" iconColor={colors.warning} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(600)} style={styles.suggestionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI 建议</Text>
            <AIBadge size="small" />
          </View>
          {suggestions.map((suggestion, index) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
          ))}
        </Animated.View>

        <QuickActions />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SuggestionCard: React.FC<{ suggestion: AISuggestion; index: number }> = ({ suggestion, index }) => {
  const getIcon = (type: AISuggestion['type']) => {
    switch (type) { case 'inventory': return 'cube'; case 'pricing': return 'pricetag'; case 'marketing': return 'megaphone'; case 'operation': return 'settings'; default: return 'bulb'; }
  };
  const getImpactColor = (impact: AISuggestion['impact']) => {
    switch (impact) { case 'high': return colors.error; case 'medium': return colors.warning; case 'low': return colors.info; default: return colors.mediumGray; }
  };
  const getImpactText = (impact: AISuggestion['impact']) => {
    switch (impact) { case 'high': return '高'; case 'medium': return '中'; case 'low': return '低'; default: return ''; }
  };

  return (
    <Animated.View entering={FadeInUp.delay(400 + index * 100).duration(500)}>
      <GlassCard style={styles.suggestionCard}>
        <View style={styles.suggestionHeader}>
          <View style={styles.suggestionType}>
            <Ionicons name={getIcon(suggestion.type)} size={18} color={colors.wood} />
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
          </View>
          <View style={[styles.impactBadge, { backgroundColor: `${getImpactColor(suggestion.impact)}15` }]}>
            <Text style={[styles.impactText, { color: getImpactColor(suggestion.impact) }]}>{getImpactText(suggestion.impact)}优先级</Text>
          </View>
        </View>
        <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
        <View style={styles.suggestionFooter}>
          <Text style={styles.actionText}>{suggestion.actionText}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.wood} />
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  greeting: { fontSize: typography.sizes.xl, fontWeight: '600', color: colors.darkGray },
  date: { fontSize: typography.sizes.sm, color: colors.mediumGray, marginTop: spacing.xs },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: `${colors.wood}15`, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 20 },
  levelText: { fontSize: typography.sizes.sm, color: colors.wood, fontWeight: '600' },
  scrollView: { flex: 1 },
  metricsSection: { marginHorizontal: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.darkGray, marginBottom: spacing.md },
  metricsGrid: { flexDirection: 'row', gap: spacing.md },
  suggestionsSection: { marginHorizontal: spacing.md, marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  suggestionCard: { padding: spacing.md, marginBottom: spacing.md },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  suggestionType: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  suggestionTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  impactBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs / 2, borderRadius: 12 },
  impactText: { fontSize: typography.sizes.xs, fontWeight: '500' },
  suggestionDescription: { fontSize: typography.sizes.sm, color: colors.mediumGray, lineHeight: 20, marginBottom: spacing.sm },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.xs },
  actionText: { fontSize: typography.sizes.sm, color: colors.wood, fontWeight: '500' },
  bottomPadding: { height: 100 },
});
