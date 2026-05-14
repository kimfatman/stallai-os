import { format, formatDistanceToNow, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * Format currency with Chinese Yuan symbol
 */
export function formatCurrency(
  value: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
    compact?: boolean;
  }
): string {
  const { showSymbol = true, decimals = 2, compact = false } = options || {};

  let formatted: string;

  if (compact && Math.abs(value) >= 10000) {
    const compactValue = value / 10000;
    formatted = compactValue.toFixed(1) + '万';
  } else {
    formatted = value.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return showSymbol ? `¥${formatted}` : formatted;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date to Chinese format
 */
export function formatDate(date: Date | string, formatStr = 'yyyy年MM月dd日'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: zhCN });
}

/**
 * Format time to Chinese format
 */
export function formatTime(date: Date | string, formatStr = 'HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
}

/**
 * Format relative time (e.g., "2小时前", "昨天", "3天前")
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm');
  }

  if (isYesterday(dateObj)) {
    return '昨天';
  }

  const daysDiff = differenceInDays(new Date(), dateObj);

  if (daysDiff < 7) {
    return `${daysDiff}天前`;
  }

  if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks}周前`;
  }

  if (daysDiff < 365) {
    const months = Math.floor(daysDiff / 30);
    return `${months}个月前`;
  }

  const years = Math.floor(daysDiff / 365);
  return `${years}年前`;
}

/**
 * Format relative time in detail (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhCN });
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format distance
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format order number
 */
export function formatOrderNumber(num: number): string {
  return `#${num.toString().padStart(6, '0')}`;
}

/**
 * Format rank number
 */
export function formatRank(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format profit/loss with color indicator
 */
export function formatProfitLoss(value: number, showSign = true): string {
  const formatted = formatCurrency(Math.abs(value), { decimals: 2 });
  if (value > 0) {
    return showSign ? `+${formatted}` : formatted;
  }
  if (value < 0) {
    return showSign ? `-${formatted}` : formatted;
  }
  return formatted;
}
