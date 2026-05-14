import { MD3LightTheme, configureFonts } from 'react-native-paper';

// Color palette - Chinese modern minimalist theme
export const colors = {
  // Primary colors
  primary: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#1A1A1A',
  },
  
  // Wood color palette
  wood: {
    50: '#F5F0EB',
    100: '#E8DDD0',
    200: '#D4C4AD',
    300: '#BFAB8A',
    400: '#A89267',
    500: '#8B7355',
    600: '#735E46',
    700: '#5B4A37',
    800: '#433628',
    900: '#2B2219',
  },
  
  // Chinese traditional colors
  chinese: {
    red: '#E53935',
    redLight: '#FFEBEE',
    redDark: '#C62828',
    gold: '#FFB300',
    goldLight: '#FFE082',
    green: '#43A047',
    greenLight: '#E8F5E9',
    greenDark: '#2E7D32',
    blue: '#1E88E5',
    blueLight: '#E3F2FD',
    blueDark: '#1565C0',
  },
  
  // Semantic colors
  success: '#43A047',
  warning: '#FFB300',
  error: '#E53935',
  info: '#1E88E5',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  
  // Text colors
  text: {
    primary: '#1A1A1A',
    secondary: '#616161',
    disabled: '#9E9E9E',
    placeholder: '#BDBDBD',
  },
  
  // Border colors
  border: {
    light: '#EEEEEE',
    medium: '#E0E0E0',
    dark: '#BDBDBD',
  },
  
  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(255, 255, 255, 0.7)',
  },
};

// Font configuration
const fontConfig = {
  fontFamily: 'System',
};

// React Native Paper theme
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.chinese.red,
    primaryContainer: colors.chinese.redLight,
    secondary: colors.wood[500],
    secondaryContainer: colors.wood[100],
    tertiary: colors.chinese.blue,
    tertiaryContainer: colors.chinese.blueLight,
    surface: colors.white,
    surfaceVariant: colors.primary[100],
    surfaceDisabled: colors.primary[200],
    background: colors.background,
    error: colors.error,
    errorContainer: colors.chinese.redLight,
    onPrimary: colors.white,
    onPrimaryContainer: colors.chinese.redDark,
    onSecondary: colors.white,
    onSecondaryContainer: colors.wood[800],
    onTertiary: colors.white,
    onTertiaryContainer: colors.chinese.blueDark,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    onSurfaceDisabled: colors.text.disabled,
    onError: colors.white,
    onErrorContainer: colors.error,
    onBackground: colors.text.primary,
    outline: colors.border.medium,
    outlineVariant: colors.border.light,
    inverseSurface: colors.primary[900],
    inverseOnSurface: colors.primary[50],
    inversePrimary: colors.chinese.redLight,
    shadow: colors.black,
    scrim: colors.overlay.dark,
    backdrop: colors.overlay.light,
    elevation: {
      level0: 'transparent',
      level1: colors.white,
      level2: colors.primary[50],
      level3: colors.primary[100],
      level4: colors.primary[200],
      level5: colors.primary[300],
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};

// Typography scale
export const typography = {
  displayLarge: {
    fontSize: 57,
    fontWeight: '400' as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '400' as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '400' as const,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

// Spacing scale (based on 4px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  xs: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  glass: {
    shadowColor: colors.wood[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
};

export default theme;
