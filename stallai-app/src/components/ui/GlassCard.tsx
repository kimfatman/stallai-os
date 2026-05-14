import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { BorderlessButton } from 'react-native-gesture-handler';

interface GlassCardProps {
  children: React.ReactNode;
  style?: object;
  variant?: 'default' | 'gradient' | 'elevated';
  onPress?: () => void;
  disabled?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function GlassCard({
  children,
  style,
  variant = 'default',
  onPress,
  disabled = false,
}: GlassCardProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const cardContent = (
    <AnimatedView entering={FadeIn.duration(400)} style={[styles.card, animatedStyle, style]}>
      {variant === 'gradient' ? (
        <View style={styles.gradientBackground}>{children}</View>
      ) : (
        <>
          {Platform.OS === 'ios' && variant !== 'elevated' && (
            <BlurView intensity={20} tint="light" style={styles.blur} />
          )}
          <View style={[styles.cardContent, variant === 'elevated' && styles.elevatedContent]}>
            {children}
          </View>
        </>
      )}
      <View style={[styles.border, variant === 'gradient' && styles.gradientBorder]} />
    </AnimatedView>
  );

  if (onPress) {
    return (
      <BorderlessButton
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.button}
      >
        {cardContent}
      </BorderlessButton>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  cardContent: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  elevatedContent: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.1)',
  },
  gradientBorder: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
