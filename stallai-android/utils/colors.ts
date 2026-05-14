import { colors } from '../theme';

// Get color based on trend direction
export const getTrendColor = (value: number): string => {
  if (value > 0) return colors.success;
  if (value < 0) return colors.error;
  return colors.mediumGray;
};

// Get color based on stock status
export const getStockStatusColor = (status: 'normal' | 'low' | 'out'): string => {
  switch (status) {
    case 'normal':
      return colors.success;
    case 'low':
      return colors.warning;
    case 'out':
      return colors.error;
    default:
      return colors.mediumGray;
  }
};

// Get color based on impact level
export const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
  switch (impact) {
    case 'high':
      return colors.error;
    case 'medium':
      return colors.warning;
    case 'low':
      return colors.info;
    default:
      return colors.mediumGray;
  }
};

// Get color based on score
export const getScoreColor = (score: number): string => {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
};

// Hex to rgba
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Lighten color
export const lighten = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

// Darken color
export const darken = (hex: string, amount: number): string => {
  return lighten(hex, -amount);
};

// Generate gradient colors
export const generateGradient = (baseColor: string, direction: 'light' | 'dark' = 'light'): string[] => {
  if (direction === 'light') {
    return [baseColor, lighten(baseColor, 20)];
  }
  return [baseColor, darken(baseColor, 20)];
};

// Category colors for charts
export const categoryColors = [
  colors.wood,
  colors.red,
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#795548',
];

// Get category color by index
export const getCategoryColor = (index: number): string => {
  return categoryColors[index % categoryColors.length];
};
