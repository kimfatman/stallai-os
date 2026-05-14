import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import AnimatedCounter from '../ui/AnimatedCounter';
import { formatTimeAgo } from '@/utils/formatters';

interface InventoryItemType {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  cost: number;
  lastRestock: Date;
  imageUrl?: string;
}

interface InventoryItemProps {
  item: InventoryItemType;
  onPress?: () => void;
  onStockUpdate?: (newStock: number) => void;
}

export default function InventoryItem({
  item,
  onPress,
  onStockUpdate,
}: InventoryItemProps) {
  const isLowStock = item.currentStock <= item.minStock;
  const stockPercentage = Math.min((item.currentStock / (item.minStock * 2)) * 100, 100);

  return (
    <TouchableOpacity onPress={onPress}>
      <GlassCard
        style={[
          styles.card,
          isLowStock && styles.cardWarning,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{item.name}</Text>
            {isLowStock && (
              <View style={styles.warningBadge}>
                <Ionicons name="warning" size={12} color="#FFFFFF" />
                <Text style={styles.warningText}>库存预警</Text>
              </View>
            )}
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>

        <View style={styles.stockContainer}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>当前库存</Text>
            <View style={styles.stockValueRow}>
              <AnimatedCounter
                value={item.currentStock}
                style={[styles.stockValue, isLowStock && styles.stockValueWarning]}
              />
              <Text style={styles.stockUnit}>{item.unit}</Text>
            </View>
          </View>

          <View style={styles.stockBar}>
            <View style={styles.stockBarTrack}>
              <View
                style={[
                  styles.stockBarFill,
                  { width: `${stockPercentage}%` },
                  isLowStock && styles.stockBarFillWarning,
                ]}
              />
            </View>
          </View>

          <Text style={styles.minStockText}>
            最低库存: {item.minStock}{item.unit}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Ionicons name="time-outline" size={14} color="#9E9E9E" />
            <Text style={styles.footerText}>
              上次入库: {formatTimeAgo(item.lastRestock)}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => onStockUpdate?.(Math.max(0, item.currentStock - 1))}
            >
              <Ionicons name="remove" size={18} color="#E53935" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adjustButton, styles.adjustButtonAdd]}
              onPress={() => onStockUpdate?.(item.currentStock + 1)}
            >
              <Ionicons name="add" size={18} color="#43A047" />
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
  },
  cardWarning: {
    borderWidth: 1,
    borderColor: '#E53935',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  warningText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    color: '#757575',
  },
  stockContainer: {
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    color: '#757575',
  },
  stockValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  stockValueWarning: {
    color: '#E53935',
  },
  stockUnit: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  stockBar: {
    marginBottom: 4,
  },
  stockBarTrack: {
    height: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    backgroundColor: '#43A047',
    borderRadius: 3,
  },
  stockBarFillWarning: {
    backgroundColor: '#E53935',
  },
  minStockText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonAdd: {
    backgroundColor: '#E8F5E9',
  },
});
