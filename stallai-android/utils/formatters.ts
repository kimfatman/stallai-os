import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Currency formatter
export const formatCurrency = (amount: number, showSign = true): string => {
  const sign = showSign && amount > 0 ? '+' : '';
  return `${sign}¥${amount.toFixed(2)}`;
};

// Compact currency formatter (for large numbers)
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toFixed(0)}`;
};

// Number formatter with thousand separators
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

// Percentage formatter
export const formatPercentage = (value: number, showSign = true): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Date formatters
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年MM月dd日', { locale: zhCN });
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MM/dd', { locale: zhCN });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: zhCN });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MM月dd日 HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
};

// Business score formatter
export const formatScore = (score: number): string => {
  return score.toFixed(0);
};

// Phone number formatter
export const formatPhone = (phone: string): string => {
  if (phone.length === 11) {
    return `${phone.slice(0, 3)} **** ${phone.slice(7)}`;
  }
  return phone;
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Duration formatter
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  }
  return `${mins}分钟`;
};
