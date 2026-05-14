/**
 * 加载中组件
 * Loading Spinner Component
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#3b82f6',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-slate-500 text-sm mt-3">{text}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
