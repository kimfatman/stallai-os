import { colors } from '@/theme';

/**
 * Color utilities for the app
 */

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Lighten a color
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const t = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * t);
  const g = Math.round(rgb.g + (255 - rgb.g) * t);
  const b = Math.round(rgb.b + (255 - rgb.b) * t);

  return rgbToHex(r, g, b);
}

// Darken a color
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const t = percent / 100;
  const r = Math.round(rgb.r * (1 - t));
  const g = Math.round(rgb.g * (1 - t));
  const b = Math.round(rgb.b * (1 - t));

  return rgbToHex(r, g, b);
}

// Get contrast color (black or white)
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Add alpha to color
export function addAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// Generate gradient colors
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  if (!start || !end) return [startColor, endColor];

  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    colors.push(rgbToHex(r, g, b));
  }
  return colors;
}

// Get status color based on value and thresholds
export function getStatusColor(
  value: number,
  thresholds: { low: number; high: number },
  options?: {
    lowColor?: string;
    mediumColor?: string;
    highColor?: string;
  }
): string {
  const { lowColor = colors.chinese.red, mediumColor = colors.chinese.gold, highColor = colors.chinese.green } = options || {};

  if (value <= thresholds.low) return lowColor;
  if (value >= thresholds.high) return highColor;
  return mediumColor;
}

// Get trend color
export function getTrendColor(value: number): string {
  if (value > 0) return colors.chinese.green;
  if (value < 0) return colors.chinese.red;
  return colors.primary[500];
}

// Get rating color
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return colors.chinese.gold;
  if (rating >= 4.0) return colors.chinese.green;
  if (rating >= 3.0) return colors.chinese.gold;
  return colors.chinese.red;
}

// Get category color
export function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    '主食': colors.wood[500],
    '肉类': colors.chinese.red,
    '蔬菜': colors.chinese.green,
    '蛋类': colors.chinese.gold,
    '调料': colors.wood[400],
    '饮品': colors.chinese.blue,
    '其他': colors.primary[500],
  };
  return categoryColors[category] || colors.primary[500];
}

// Get stock status color
export function getStockStatusColor(
  currentStock: number,
  minStock: number
): { color: string; backgroundColor: string } {
  if (currentStock <= 0) {
    return {
      color: colors.white,
      backgroundColor: colors.chinese.red,
    };
  }
  if (currentStock <= minStock * 0.5) {
    return {
      color: colors.white,
      backgroundColor: colors.chinese.red,
    };
  }
  if (currentStock <= minStock) {
    return {
      color: colors.chinese.redDark,
      backgroundColor: colors.chinese.redLight,
    };
  }
  return {
    color: colors.chinese.greenDark,
    backgroundColor: colors.chinese.greenLight,
  };
}

// Get business score color
export function getScoreColor(score: number): string {
  if (score >= 80) return colors.chinese.green;
  if (score >= 60) return colors.chinese.gold;
  if (score >= 40) return colors.chinese.red;
  return colors.chinese.redDark;
}

// Opacity variants
export const opacityVariants = {
  0: 0,
  5: 0.05,
  10: 0.1,
  15: 0.15,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  35: 0.35,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
};

// Pre-defined color combinations
export const colorCombinations = {
  primary: {
    bg: colors.chinese.redLight,
    text: colors.chinese.redDark,
    border: colors.chinese.red,
  },
  success: {
    bg: colors.chinese.greenLight,
    text: colors.chinese.greenDark,
    border: colors.chinese.green,
  },
  warning: {
    bg: '#FFF8E1',
    text: '#F57C00',
    border: colors.chinese.gold,
  },
  info: {
    bg: colors.chinese.blueLight,
    text: colors.chinese.blueDark,
    border: colors.chinese.blue,
  },
};
