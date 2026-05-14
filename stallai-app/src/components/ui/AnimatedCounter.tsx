import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  color?: string;
  decimals?: number;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  style,
  color,
  decimals = 0,
  duration = 1500,
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);
  const displayValue = useSharedValue('0');

  useEffect(() => {
    animatedValue.value = 0;
    animatedValue.value = withDelay(
      200,
      withTiming(value, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [value, duration]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Math.round(animatedValue.value * Math.pow(10, decimals)) / Math.pow(10, decimals);
      displayValue.value = current.toFixed(decimals);
    }, 16);

    return () => clearInterval(interval);
  }, [value, decimals]);

  return (
    <AnimatedNumber
      prefix={prefix}
      suffix={suffix}
      animatedValue={animatedValue}
      style={style}
      color={color}
      decimals={decimals}
    />
  );
}

interface AnimatedNumberProps {
  prefix: string;
  suffix: string;
  animatedValue: Animated.SharedValue<number>;
  style?: TextStyle;
  color?: string;
  decimals: number;
}

function AnimatedNumber({
  prefix,
  suffix,
  animatedValue,
  style,
  color,
  decimals,
}: AnimatedNumberProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const displayValue = animatedValue.value.toFixed(decimals);
    return {};
  });

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedText prefix={prefix} suffix={suffix} animatedValue={animatedValue} style={style} color={color} decimals={decimals} />
    </Animated.View>
  );
}

interface AnimatedTextProps {
  prefix: string;
  suffix: string;
  animatedValue: Animated.SharedValue<number>;
  style?: TextStyle;
  color?: string;
  decimals: number;
}

function AnimatedText({ prefix, suffix, animatedValue, style, color, decimals }: AnimatedTextProps) {
  const [displayValue, setDisplayValue] = React.useState('0');

  React.useEffect(() => {
    const interval = setInterval(() => {
      const current = animatedValue.value.toFixed(decimals);
      setDisplayValue(current);
    }, 16);

    return () => clearInterval(interval);
  }, [animatedValue, decimals]);

  return (
    <Text style={[style, color && { color }]}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}
