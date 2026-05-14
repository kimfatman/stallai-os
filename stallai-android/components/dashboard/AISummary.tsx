import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { AIBadge } from '../ui/AIBadge';
import { GlassCard } from '../ui/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface AISummaryProps {
  summary: string;
}

export const AISummary: React.FC<AISummaryProps> = ({ summary }) => {
  return (
    <Animated.View entering={FadeInUp.delay(200).duration(600)}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={20} color={colors.wood} />
            <Text style={styles.title}>AI 经营洞察</Text>
          </View>
          <AIBadge size="small" />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={colors.mediumGray} />
            <Text style={styles.timeText}>刚刚更新</Text>
          </View>
          <View style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color={colors.wood} />
            <Text style={styles.refreshText}>刷新</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.darkGray,
  },
  content: {
    backgroundColor: `${colors.wood}08`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.wood,
  },
  summary: {
    fontSize: typography.sizes.md,
    color: colors.darkGray,
    lineHeight: 24,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.mediumGray,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.wood}10`,
    borderRadius: borderRadius.sm,
  },
  refreshText: {
    fontSize: typography.sizes.sm,
    color: colors.wood,
    fontWeight: '500',
  },
});

export default AISummary;
