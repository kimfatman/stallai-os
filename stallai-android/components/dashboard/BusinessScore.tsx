import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ScoreRing } from '../ui/ScoreRing';
import { AIBadge } from '../ui/AIBadge';
import { GlassCard } from '../ui/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getScoreColor } from '../../utils/colors';

interface BusinessScoreProps {
  score: number;
  onPress?: () => void;
}

export const BusinessScore: React.FC<BusinessScoreProps> = ({
  score,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const scoreColor = getScoreColor(score);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '一般';
    return '需改进';
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <GlassCard style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>经营评分</Text>
            <AIBadge size="small" />
          </View>
          
          <View style={styles.content}>
            <ScoreRing score={score} size={140} strokeWidth={12} />
            
            <View style={styles.infoContainer}>
              <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}15` }]}>
                <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                  {getScoreLabel(score)}
                </Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="trending-up" size={16} color={colors.success} />
                  <Text style={styles.statText}>营收增长</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color={colors.info} />
                  <Text style={styles.statText}>客流稳定</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              基于近7天经营数据综合评估
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mediumGray} />
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.darkGray,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  infoContainer: {
    flex: 1,
    gap: spacing.md,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  scoreLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.mediumGray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.mediumGray,
  },
});

export default BusinessScore;
