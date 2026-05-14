import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import AnimatedCounter from '../ui/AnimatedCounter';
import { Ionicons } from '@expo/vector-icons';

interface TodayMetricsProps {
  data?: {
    revenue: number;
    orders: number;
    visitors: number;
    conversion: number;
  };
}

const defaultData = {
  revenue: 1238.5,
  orders: 42,
  visitors: 156,
  conversion: 26.9,
};

export default function TodayMetrics({ data = defaultData }: TodayMetricsProps) {
  return (
    <View style={styles.container}>
      <GlassCard style={styles.mainCard}>
        <View style={styles.mainContent}>
          <View style={styles.mainIcon}>
            <Ionicons name="cash" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.mainLabel}>今日营收</Text>
            <AnimatedCounter
              value={data.revenue}
              prefix="¥"
              style={styles.mainValue}
            />
          </View>
        </View>
        <View style={styles.mainStats}>
          <View style={styles.mainStat}>
            <Ionicons name="arrow-up" size={12} color="#43A047" />
            <Text style={styles.mainStatText}>+15.2%</Text>
          </View>
          <Text style={styles.mainStatLabel}>较昨日</Text>
        </View>
      </GlassCard>

      <View style={styles.subMetrics}>
        <GlassCard style={styles.subCard}>
          <View style={styles.subHeader}>
            <Ionicons name="receipt" size={18} color="#1E88E5" />
          </View>
          <AnimatedCounter
            value={data.orders}
            style={styles.subValue}
          />
          <Text style={styles.subLabel}>订单数</Text>
        </GlassCard>

        <GlassCard style={styles.subCard}>
          <View style={styles.subHeader}>
            <Ionicons name="people" size={18} color="#8B7355" />
          </View>
          <AnimatedCounter
            value={data.visitors}
            style={styles.subValue}
          />
          <Text style={styles.subLabel}>访客数</Text>
        </GlassCard>

        <GlassCard style={styles.subCard}>
          <View style={styles.subHeader}>
            <Ionicons name="trending-up" size={18} color="#43A047" />
          </View>
          <AnimatedCounter
            value={data.conversion}
            style={styles.subValue}
            suffix="%"
            decimals={1}
          />
          <Text style={styles.subLabel}>转化率</Text>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  mainCard: {
    padding: 16,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  mainInfo: {
    flex: 1,
  },
  mainLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  mainStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 2,
  },
  mainStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#43A047',
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  subMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  subCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  subHeader: {
    marginBottom: 8,
  },
  subValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  subLabel: {
    fontSize: 11,
    color: '#757575',
  },
});
