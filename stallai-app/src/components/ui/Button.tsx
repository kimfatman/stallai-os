/**
 * 按钮组件
 * Button Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary-500',
          text: 'text-white',
          disabled: 'bg-primary-300',
        };
      case 'secondary':
        return {
          container: 'bg-slate-100 dark:bg-slate-700',
          text: 'text-slate-700 dark:text-slate-200',
          disabled: 'bg-slate-50 dark:bg-slate-800',
        };
      case 'outline':
        return {
          container: 'border-2 border-primary-500 bg-transparent',
          text: 'text-primary-500',
          disabled: 'border-slate-300',
        };
      case 'ghost':
        return {
          container: 'bg-transparent',
          text: 'text-primary-500',
          disabled: 'text-slate-300',
        };
      case 'danger':
        return {
          container: 'bg-red-500',
          text: 'text-white',
          disabled: 'bg-red-300',
        };
      default:
        return {
          container: 'bg-primary-500',
          text: 'text-white',
          disabled: 'bg-primary-300',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-2 px-3',
          text: 'text-xs',
        };
      case 'md':
        return {
          container: 'py-3 px-4',
          text: 'text-sm',
        };
      case 'lg':
        return {
          container: 'py-4 px-6',
          text: 'text-base',
        };
      default:
        return {
          container: 'py-3 px-4',
          text: 'text-sm',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      className={`rounded-xl items-center justify-center flex-row ${variantStyles.container} ${sizeStyles.container} ${className} ${isDisabled ? 'opacity-60' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={style}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? 'white' : '#3b82f6'} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text className={`font-semibold ${variantStyles.text} ${sizeStyles.text} ${icon ? 'ml-2' : ''}`} style={textStyle}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
