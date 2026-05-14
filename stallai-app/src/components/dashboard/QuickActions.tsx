import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface QuickAction {
  id: string;
  icon: string;
  iconType: 'ionicons' | 'material';
  label: string;
  color: string;
  route?: string;
}

interface QuickActionsProps {
  onAction?: (action: QuickAction) => void;
}

const actions: QuickAction[] = [
  { id: '1', icon: 'add-circle', iconType: 'ionicons', label: '记一笔', color: '#E53935', route: '/product/new' },
  { id: '2', icon: 'qr-code-scanner', iconType: 'material', label: '扫码收款', color: '#43A047' },
  { id: '3', icon: 'package-variant', iconType: 'material', label: '库存盘点', color: '#1E88E5' },
  { id: '4', icon: 'map-marker', iconType: 'material', label: '摆摊地图', color: '#8B7355' },
  { id: '5', icon: 'store', iconType: 'material', label: '货源广场', color: '#FFB300' },
  { id: '6', icon: 'file-document', iconType: 'material', label: 'AI日报', color: '#9C27B0' },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {actions.slice(0, 4).map((action, index) => (
          <Animated.View
            key={action.id}
            entering={FadeInUp.delay(100 + index * 50).duration(400)}
            style={styles.gridItem}
          >
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: action.color + '15' }]}
              onPress={() => onAction?.(action)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: action.color + '20' }]}>
                {action.iconType === 'ionicons' ? (
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                ) : (
                  <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                )}
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      <View style={styles.grid}>
        {actions.slice(4, 6).map((action, index) => (
          <Animated.View
            key={action.id}
            entering={FadeInUp.delay(300 + index * 50).duration(400)}
            style={styles.gridItemHalf}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonHalf, { backgroundColor: action.color + '15' }]}
              onPress={() => onAction?.(action)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: action.color + '20' }]}>
                {action.iconType === 'ionicons' ? (
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                ) : (
                  <MaterialCommunityIcons name={action.icon as any} size={22} color={action.color} />
                )}
              </View>
              <Text style={styles.actionLabelHalf}>{action.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  gridItemHalf: {
    flex: 1,
  },
  actionButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonHalf: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  actionLabelHalf: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 10,
  },
});
