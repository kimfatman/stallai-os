import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#E53935',
  backgroundColor = '#F5F5F5',
  showPercentage = false,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Percentage Text */}
        {showPercentage && (
          <SvgText
            x={center}
            y={center}
            fontSize={size * 0.25}
            fontWeight="bold"
            fill={color}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {percentage}%
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
