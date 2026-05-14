import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { getTrendColor } from '../../utils/colors';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';

interface MetricCardProps {
  title: string;
  value: number;
  type?: 'currency' | 'number' | 'percentage';
  trend?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  type = 'number',
  trend,
  icon,
  iconColor = colors.wood,
  onPress,
  style,
  compact = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatValue = () => {
    switch (type) {
      case 'currency':
        return formatCurrency(value, false);
      case 'percentage':
        return formatPercentage(value, false);
      default:
        return formatNumber(value);
    }
  };

  const trendColor = trend !== undefined ? getTrendColor(trend) : null;
  const trendIcon = trend !== undefined ? (trend >= 0 ? 'trending-up' : 'trending-down') : null;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[styles.container, compact && styles.compact, style, animatedStyle]}>
      <CardWrapper
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons name={icon} size={compact ? 16 : 20} color={iconColor} />
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.value, compact && styles.valueCompact]}>
            {formatValue()}
          </Text>
          
          {trend !== undefined && (
            <View style={styles.trendContainer}>
              <Ionicons
                name={trendIcon as any}
                size={14}
                color={trendColor!}
              />
              <Text style={[styles.trendText, { color: trendColor! }]}>
                {formatPercentage(trend)}
              </Text>
              <Text style={styles.trendLabel}>较昨日</Text>
            </View>
          )}
        </View>
      </CardWrapper>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
  },
  compact: {
    minWidth: 100,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.sm,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.darkGray,
  },
  valueCompact: {
    fontSize: typography.sizes.xxl,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: typography.sizes.xs,
    color: colors.mediumGray,
  },
});

export default MetricCard;
