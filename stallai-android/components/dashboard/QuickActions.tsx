import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ActionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onAddTransaction?: () => void;
  onAddProduct?: () => void;
  onViewReport?: () => void;
  onSettings?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddTransaction,
  onAddProduct,
  onViewReport,
  onSettings,
}) => {
  const actions: ActionItem[] = [
    {
      id: 'transaction',
      icon: 'add-circle',
      label: '记一笔',
      color: colors.wood,
      onPress: onAddTransaction || (() => {}),
    },
    {
      id: 'product',
      icon: 'cube',
      label: '加库存',
      color: colors.info,
      onPress: onAddProduct || (() => {}),
    },
    {
      id: 'report',
      icon: 'bar-chart',
      label: '看报表',
      color: colors.success,
      onPress: onViewReport || (() => {}),
    },
    {
      id: 'settings',
      icon: 'settings',
      label: '设置',
      color: colors.mediumGray,
      onPress: onSettings || (() => {}),
    },
  ];

  return (
    <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.container}>
      <Text style={styles.title}>快捷操作</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <ActionButton key={action.id} action={action} index={index} />
        ))}
      </View>
    </Animated.View>
  );
};

const ActionButton: React.FC<{ action: ActionItem; index: number }> = ({
  action,
  index,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(400 + index * 100).duration(400)}
      style={[styles.actionContainer, animatedStyle]}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={action.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${action.color}15` },
          ]}
        >
          <Ionicons name={action.icon} size={24} color={action.color} />
        </View>
        <Text style={styles.actionLabel}>{action.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
    fontWeight: '500',
  },
});

export default QuickActions;
