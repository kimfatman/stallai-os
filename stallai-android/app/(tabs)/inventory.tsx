import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../../components/ui/GlassCard';
import { colors, spacing, typography } from '../../theme';
import { inventoryService } from '../../services/inventoryService';
import { Product, InventoryAlert } from '../../types';
import { getStockStatusColor } from '../../utils/colors';

export default function InventoryScreen() {
  const { data: products } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: inventoryService.getProducts,
  });

  const { data: alerts } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: inventoryService.getAlerts,
  });

  const lowStockProducts = products?.filter(p => p.status === 'low' || p.status === 'out') || [];
  const normalProducts = products?.filter(p => p.status === 'normal') || [];

  const getStatusLabel = (status: Product['status']) => {
    switch (status) { case 'low': return '库存不足'; case 'out': return '已售罄'; default: return '正常'; }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>库存</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {alerts && alerts.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <GlassCard style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color={colors.warning} />
                <Text style={styles.alertTitle}>库存预警</Text>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{alerts.length}</Text>
                </View>
              </View>
              {alerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertProductName}>{alert.productName}</Text>
                    <Text style={styles.alertAction}>{alert.suggestedAction}</Text>
                  </View>
                  <TouchableOpacity style={styles.restockButton}>
                    <Text style={styles.restockText}>补货</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Ionicons name="cube" size={24} color={colors.info} />
            <Text style={styles.statValue}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>商品总数</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{lowStockProducts.length}</Text>
            <Text style={styles.statLabel}>需要补货</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.statValue}>{normalProducts.length}</Text>
            <Text style={styles.statLabel}>库存充足</Text>
          </GlassCard>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>商品列表</Text>
          <TouchableOpacity><Text style={styles.filterText}>筛选</Text></TouchableOpacity>
        </View>

        {products?.map((product, index) => (
          <Animated.View key={product.id} entering={FadeInUp.delay(index * 50).duration(400)}>
            <GlassCard style={styles.productCard}>
              <View style={styles.productRow}>
                <View style={[styles.productIcon, { backgroundColor: `${getStockStatusColor(product.status)}15` }]}>
                  <Ionicons name="cube-outline" size={24} color={getStockStatusColor(product.status)} />
                </View>
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStockStatusColor(product.status)}15` }]}>
                      <Text style={[styles.statusText, { color: getStockStatusColor(product.status) }]}>{getStatusLabel(product.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.productSku}>SKU: {product.sku}</Text>
                  <View style={styles.productStats}>
                    <View style={styles.stockInfo}>
                      <Text style={styles.stockLabel}>库存</Text>
                      <Text style={[styles.stockValue, { color: getStockStatusColor(product.status) }]}>{product.stock}</Text>
                    </View>
                    <View style={styles.stockInfo}>
                      <Text style={styles.stockLabel}>单价</Text>
                      <Text style={styles.stockValue}>¥{product.unitPrice}</Text>
                    </View>
                    <View style={styles.stockInfo}>
                      <Text style={styles.stockLabel}>日销</Text>
                      <Text style={styles.stockValue}>{product.salesVelocity}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        ))}

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
  alertCard: { marginHorizontal: spacing.md, padding: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  alertTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray, flex: 1 },
  alertBadge: { backgroundColor: colors.warning, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  alertBadgeText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: '700' },
  alertItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.lightGray },
  alertInfo: { flex: 1 },
  alertProductName: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.darkGray },
  alertAction: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: 2 },
  restockButton: { backgroundColor: colors.warning, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
  restockText: { color: colors.white, fontSize: typography.sizes.sm, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  statValue: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.darkGray, marginTop: spacing.sm },
  statLabel: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: spacing.xs },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.darkGray },
  filterText: { fontSize: typography.sizes.sm, color: colors.wood },
  productCard: { marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md },
  productRow: { flexDirection: 'row' },
  productIcon: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1, marginLeft: spacing.md },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: '500' },
  productSku: { fontSize: typography.sizes.xs, color: colors.mediumGray, marginTop: 2 },
  productStats: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.lg },
  stockInfo: { alignItems: 'center' },
  stockLabel: { fontSize: typography.sizes.xs, color: colors.mediumGray },
  stockValue: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.darkGray, marginTop: 2 },
  bottomPadding: { height: 100 },
});
