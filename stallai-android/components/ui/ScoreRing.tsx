import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Canvas, Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import { colors, typography } from '../../theme';
import { getScoreColor } from '../../utils/colors';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
  animated?: boolean;
}

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas);

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  style,
  showLabel = true,
  animated = true,
}) => {
  const progress = useSharedValue(0);
  const scoreColor = getScoreColor(score);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(score / 100, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = score / 100;
    }
  }, [score, animated]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progress.value),
    };
  });

  const scoreText = Math.round(score);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.lightGray}
            strokeWidth={strokeWidth}
            style="stroke"
          />
          {/* Progress circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            style="stroke"
            strokeCap="round"
            strokeDasharray={circumference}
            transform={[{ rotate: -Math.PI / 2 }, { translateX: 0 }, { translateY: 0 }]}
            origin={{ x: center, y: center }}
          />
        </Group>
      </Canvas>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {scoreText}
          </Text>
          <Text style={styles.labelText}>经营分</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    lineHeight: 36,
  },
  labelText: {
    fontSize: typography.sizes.sm,
    color: colors.mediumGray,
    marginTop: 2,
  },
});

export default ScoreRing;
