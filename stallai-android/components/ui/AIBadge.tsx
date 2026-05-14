import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface AIBadgeProps {
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  showText?: boolean;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  size = 'medium',
  style,
  showText = true,
}) => {
  const sizeStyles = {
    small: { container: styles.smallContainer, text: styles.smallText, icon: 12 },
    medium: { container: styles.mediumContainer, text: styles.mediumText, icon: 14 },
    large: { container: styles.largeContainer, text: styles.largeText, icon: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, style]}>
      <Ionicons name="sparkles" size={currentSize.icon} color={colors.red} />
      {showText && (
        <Text style={[styles.text, currentSize.text]}>AI</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.red}15`,
    borderRadius: borderRadius.sm,
    gap: spacing.xs / 2,
  },
  smallContainer: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mediumContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  largeContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.red,
    fontWeight: '700',
  },
  smallText: {
    fontSize: typography.sizes.xs,
  },
  mediumText: {
    fontSize: typography.sizes.sm,
  },
  largeText: {
    fontSize: typography.sizes.md,
  },
});

export default AIBadge;
