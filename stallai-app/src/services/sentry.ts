/**
 * Sentry 错误监控服务
 * Sentry Error Monitoring Service
 */

// 注意: 需要先安装 @sentry/react-native
// import * as Sentry from '@sentry/react-native';

/**
 * 初始化 Sentry
 */
export function initSentry(): void {
  // Sentry.init({
  //   dsn: 'YOUR_SENTRY_DSN',
  //   environment: __DEV__ ? 'development' : 'production',
  //   enabled: !__DEV__,
  // });
  
  // 如果需要自定义错误处理
  // Sentry.setTag('app', 'stallai-app');
}

/**
 * 记录普通日志
 */
export function logInfo(message: string, extra?: object): void {
  // Sentry.captureMessage(message, {
  //   level: Sentry.Severity.Info,
  //   extra,
  // });
  console.log(`[INFO] ${message}`, extra);
}

/**
 * 记录警告日志
 */
export function logWarning(message: string, extra?: object): void {
  // Sentry.captureMessage(message, {
  //   level: Sentry.Severity.Warning,
  //   extra,
  // });
  console.warn(`[WARN] ${message}`, extra);
}

/**
 * 记录错误日志
 */
export function logError(error: Error | string, extra?: object): void {
  // if (typeof error === 'string') {
  //   Sentry.captureMessage(error, {
  //     level: Sentry.Severity.Error,
  //     extra,
  //   });
  // } else {
  //   Sentry.captureException(error, {
  //     extra,
  //   });
  // }
  console.error(`[ERROR] ${typeof error === 'string' ? error : error.message}`, extra);
}
