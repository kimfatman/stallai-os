import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../../components/ui/GlassCard';
import { AIBadge } from '../../components/ui/AIBadge';
import { colors, spacing, typography } from '../../theme';
import { transactionService } from '../../services/transactionService';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { Transaction } from '../../types';

export default function AccountsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const { data: summary } = useQuery({
    queryKey: ['transactions-summary'],
    queryFn: transactionService.getSummary,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getTransactions({ pageSize: 20 }),
  });

  const getPeriodSummary = () => {
    switch (selectedPeriod) {
      case 'today':
        return { income: summary?.todayIncome || 0, expense: summary?.todayExpense || 0 };
      case 'week':
        return { income: summary?.weekIncome || 0, expense: summary?.weekExpense || 0 };
      case 'month':
        return { income: summary?.monthIncome || 0, expense: summary?.monthExpense || 0 };
    }
  };

  const periodData = getPeriodSummary();
  const profit = periodData.income - periodData.expense;

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <GlassCard style={styles.transactionCard}>
        <View style={styles.transactionRow}>
          <View style={[styles.iconContainer, { backgroundColor: item.type === 'income' ? `${colors.success}15` : `${colors.error}15` }]}>
            <Ionicons name={item.type === 'income' ? 'arrow-down' : 'arrow-up'} size={20} color={item.type === 'income' ? colors.success : colors.error} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={styles.transactionDesc}>{item.description}</Text>
            <Text style={styles.transactionTime}>{formatTime(item.createdAt)} · {item.paymentMethod}</Text>
          </View>
          <Text style={[styles.transactionAmount, { color: item.type === 'income' ? colors.success : colors.error }]}>
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, false)}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>记账</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.periodTabs}>
            {(['today', 'week', 'month'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodTab, selectedPeriod === period && styles.periodTabActive]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[styles.periodTabText, selectedPeriod === period && styles.periodTabTextActive]}>
                  {period === 'today' ? '今日' : period === 'week' ? '本周' : '本月'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>收入</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(periodData.income, false)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>支出</Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>{formatCurrency(periodData.expense, false)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>结余</Text>
              <Text style={[styles.summaryValue, { color: profit >= 0 ? colors.success : colors.error }]}>{formatCurrency(profit, false)}</Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI 分析</Text>
          <AIBadge size="small" />
        </View>

        <GlassCard style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={20} color={colors.wood} />
            <Text style={styles.aiTitle}>智能洞察</Text>
          </View>
          <Text style={styles.aiText}>
            {selectedPeriod === 'today' ? '今日收入表现良好，较昨日增长15%，继续保持！' :
             selectedPeriod === 'week' ? '本周收入稳定，预计可完成月度目标的80%。' :
             '本月收入趋势向好，建议继续保持当前经营策略。'}
          </Text>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近记录</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>查看全部</Text>
          </TouchableOpacity>
        </View>

        {transactions?.data.map((item, index) => renderTransaction({ item, index }))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontSize: typography.sizes.xxxl, fontWeight: '700', color: colors.darkGray },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.wood, justifyContent: 'center', alignItems: 'center' },
  summaryCard: { marginHorizontal: spacing.md, padding: spacing.lg },
  periodTabs: { flexDirection: 'row', backgroundColor: colors.lightGray, borderRadius: 12, padding: 4, marginBottom: spacing.lg },
  periodTab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: 10 },
  periodTabActive: { backgroundColor: colors.white },
  periodTabText: { fontSize: typography.sizes.sm, color: colors.mediumGray },
  periodTabTextActive: { color: colors.darkGray, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.lightGray },
  summaryLabel: { fontSize: typography.sizes.sm, color: colors.mediumGray, marginBottom: spacing.xs },
  summaryValue: { fontSize: typography.sizes.lg, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.darkGray },
  seeAll: { fontSize: typography.sizes.sm, color: colors.wood },
  aiCard: { marginHorizontal: spacing.md, padding: spacing.md },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  aiTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  aiText: { fontSize: typography.sizes.sm, color: colors.mediumGray, lineHeight: 22 },
  transactionCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md },
  transactionRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { flex: 1, marginLeft: spacing.md },
  transactionCategory: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  transactionDesc: { fontSize: typography.sizes.sm, color: colors.mediumGray, marginTop: 2 },
  transactionTime: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: 2 },
  transactionAmount: { fontSize: typography.sizes.lg, fontWeight: '700' },
  bottomPadding: { height: 100 },
});
