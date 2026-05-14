import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, shadows } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  blurEnabled?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  blurEnabled = true,
}) => {
  if (blurEnabled) {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.container, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.container, styles.fallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    ...shadows.md,
  },
  fallback: {
    backgroundColor: colors.white,
  },
});

export default GlassCard;
