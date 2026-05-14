/**
 * 格式化工具函数
 * Format Utilities
 */

/**
 * 格式化货币
 */
export function formatCurrency(value: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
}

/**
 * 格式化数字 (带千分位)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: 'full' | 'date' | 'time' | 'short' = 'date'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'full':
      return d.toLocaleString('zh-CN');
    case 'date':
      return d.toLocaleDateString('zh-CN');
    case 'time':
      return d.toLocaleTimeString('zh-CN');
    case 'short':
      return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    default:
      return d.toLocaleDateString('zh-CN');
  }
}

/**
 * 相对时间格式化
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

/**
 * 格式化手机号
 */
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
