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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface DailyReport {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  topProducts: { name: string; count: number; revenue: number }[];
  peakHours: { hour: string; orders: number }[];
  aiSummary: string;
  suggestions: { type: string; content: string; icon: string }[];
}

const mockReport: DailyReport = {
  date: '2024-01-15',
  revenue: 1238.5,
  orders: 42,
  customers: 38,
  topProducts: [
    { name: '烤冷面', count: 15, revenue: 180 },
    { name: '烤肠', count: 28, revenue: 84 },
    { name: '铁板烧', count: 8, revenue: 160 },
  ],
  peakHours: [
    { hour: '17:00-18:00', orders: 12 },
    { hour: '18:00-19:00', orders: 15 },
    { hour: '19:00-20:00', orders: 10 },
  ],
  aiSummary: '今日经营表现良好，营收较昨日增长15.2%。烤冷面依然是销量冠军，建议继续保持库存充足。晚高峰时段人流较大，可适当延长营业时间。',
  suggestions: [
    {
      type: 'inventory',
      content: '建议明日增加烤肠备货量50根，预计可增加约75元营收',
      icon: 'package-variant',
    },
    {
      type: 'timing',
      content: '18:00-19:00为今日订单高峰，建议提前准备好食材',
      icon: 'clock-outline',
    },
    {
      type: 'promotion',
      content: '烤冷面复购率高，可考虑推出套餐优惠提升客单价',
      icon: 'tag-outline',
    },
  ],
};

export default function DailyReportScreen() {
  const router = useRouter();
  const report = mockReport;

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'inventory':
        return '#1E88E5';
      case 'timing':
        return '#FFB300';
      case 'promotion':
        return '#43A047';
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
          <Text style={styles.title}>AI日报</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </Animated.View>

        {/* Date Selector */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <View style={styles.dateSelector}>
            <TouchableOpacity style={styles.dateArrow}>
              <Ionicons name="chevron-back" size={24} color="#757575" />
            </TouchableOpacity>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>{report.date}</Text>
              <Text style={styles.dateLabel}>昨日</Text>
            </View>
            <TouchableOpacity style={styles.dateArrow}>
              <Ionicons name="chevron-forward" size={24} color="#757575" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* AI Summary Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <GlassCard variant="gradient" style={styles.summaryCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <MaterialCommunityIcons name="brain" size={20} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI智能分析</Text>
              </View>
            </View>
            <Text style={styles.aiSummary}>{report.aiSummary}</Text>
          </GlassCard>
        </Animated.View>

        {/* Key Metrics */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>关键指标</Text>
          <View style={styles.metricsRow}>
            <GlassCard style={styles.metricCard}>
              <MaterialCommunityIcons name="currency-cny" size={24} color="#E53935" />
              <AnimatedCounter
                value={report.revenue}
                prefix="¥"
                style={styles.metricValue}
              />
              <Text style={styles.metricLabel}>营收</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="arrow-up" size={12} color="#43A047" />
                <Text style={styles.metricTrendText}>+15.2%</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.metricCard}>
              <MaterialCommunityIcons name="receipt" size={24} color="#1E88E5" />
              <AnimatedCounter
                value={report.orders}
                style={styles.metricValue}
              />
              <Text style={styles.metricLabel}>订单</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="arrow-up" size={12} color="#43A047" />
                <Text style={styles.metricTrendText}>+12.5%</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.metricCard}>
              <MaterialCommunityIcons name="account-group" size={24} color="#8B7355" />
              <AnimatedCounter
                value={report.customers}
                style={styles.metricValue}
              />
              <Text style={styles.metricLabel}>顾客</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="arrow-up" size={12} color="#43A047" />
                <Text style={styles.metricTrendText}>+8.3%</Text>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        {/* Top Products */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>爆款商品</Text>
          <GlassCard style={styles.productsCard}>
            {report.topProducts.map((product, index) => (
              <View
                key={product.name}
                style={[
                  styles.productItem,
                  index < report.topProducts.length - 1 && styles.productItemBorder,
                ]}
              >
                <View style={styles.productRank}>
                  <Text style={[
                    styles.productRankText,
                    index === 0 && styles.productRankGold,
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCount}>售出 {product.count} 份</Text>
                </View>
                <View style={styles.productRevenue}>
                  <Text style={styles.productRevenueValue}>¥{product.revenue}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Peak Hours */}
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>高峰时段</Text>
          <GlassCard style={styles.peakCard}>
            {report.peakHours.map((peak, index) => (
              <View key={peak.hour} style={styles.peakItem}>
                <Text style={styles.peakHour}>{peak.hour}</Text>
                <View style={styles.peakBar}>
                  <View
                    style={[
                      styles.peakBarFill,
                      { width: `${(peak.orders / 15) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.peakOrders}>{peak.orders}单</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* AI Suggestions */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <Text style={styles.sectionTitle}>AI经营建议</Text>
          {report.suggestions.map((suggestion, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(650 + index * 100).duration(400)}
            >
              <GlassCard style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <View
                    style={[
                      styles.suggestionIcon,
                      { backgroundColor: getSuggestionColor(suggestion.type) + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={suggestion.icon as any}
                      size={20}
                      color={getSuggestionColor(suggestion.type)}
                    />
                  </View>
                  <Text style={styles.suggestionContent}>{suggestion.content}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
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
  shareButton: {
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },
  dateArrow: {
    padding: 8,
  },
  dateDisplay: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dateLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#8B7355',
    marginBottom: 24,
  },
  aiHeader: {
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiSummary: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  metricTrendText: {
    fontSize: 11,
    color: '#43A047',
    fontWeight: '500',
  },
  productsCard: {
    marginBottom: 24,
    padding: 0,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  productRankGold: {
    backgroundColor: '#FFB300',
    color: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  productCount: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  productRevenue: {
    alignItems: 'flex-end',
  },
  productRevenueValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  peakCard: {
    marginBottom: 24,
  },
  peakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  peakHour: {
    fontSize: 13,
    color: '#616161',
    width: 100,
  },
  peakBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  peakBarFill: {
    height: '100%',
    backgroundColor: '#E53935',
    borderRadius: 4,
  },
  peakOrders: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    width: 50,
    textAlign: 'right',
  },
  suggestionCard: {
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});
