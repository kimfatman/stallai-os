import { ThemeColors } from '../types';

export const colors: ThemeColors = {
  // Primary palette - Chinese modern minimalist
  cream: '#FAFAFA',
  darkGray: '#1A1A1A',
  wood: '#8B7355',
  red: '#E53935',
  
  // Supporting colors
  lightGray: '#F5F5F5',
  mediumGray: '#9E9E9E',
  white: '#FFFFFF',
  black: '#000000',
  
  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#E53935',
  info: '#2196F3',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const typography = {
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    hero: 48,
  },
  
  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Paper theme configuration
export const paperTheme = {
  colors: {
    primary: colors.wood,
    onPrimary: colors.white,
    primaryContainer: colors.lightGray,
    onPrimaryContainer: colors.darkGray,
    secondary: colors.red,
    onSecondary: colors.white,
    secondaryContainer: '#FFEBEE',
    onSecondaryContainer: colors.darkGray,
    tertiary: colors.darkGray,
    onTertiary: colors.white,
    tertiaryContainer: colors.cream,
    onTertiaryContainer: colors.darkGray,
    error: colors.error,
    onError: colors.white,
    errorContainer: '#FFEBEE',
    onErrorContainer: colors.error,
    background: colors.cream,
    onBackground: colors.darkGray,
    surface: colors.white,
    onSurface: colors.darkGray,
    surfaceVariant: colors.lightGray,
    onSurfaceVariant: colors.mediumGray,
    outline: colors.mediumGray,
    outlineVariant: colors.lightGray,
    shadow: colors.black,
    scrim: colors.black,
    inverseSurface: colors.darkGray,
    inverseOnSurface: colors.white,
    inversePrimary: colors.wood,
    elevation: {
      level0: 'transparent',
      level1: colors.white,
      level2: colors.lightGray,
      level3: colors.cream,
      level4: colors.cream,
      level5: colors.cream,
    },
    surfaceDisabled: 'rgba(26, 26, 26, 0.12)',
    onSurfaceDisabled: 'rgba(26, 26, 26, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 12,
};
