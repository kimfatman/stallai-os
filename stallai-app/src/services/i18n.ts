/**
 * i18n 国际化服务
 * Internationalization Service
 */

// 当前语言
let currentLocale = 'zh-CN';

// 翻译数据
const translations: Record<string, Record<string, string>> = {
  'zh-CN': {
    // 通用
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.success': '成功',
    'common.retry': '重试',
    
    // 导航
    'nav.home': '首页',
    'nav.dashboard': '驾驶舱',
    'nav.accounts': '记账',
    'nav.inventory': '库存',
    'nav.insights': '分析',
    'nav.community': '社区',
    
    // 首页
    'home.greeting': '早上好',
    'home.todayRevenue': '今日收入',
    'home.todayOrders': '今日订单',
    'home.aiInsights': 'AI智能分析',
  },
  'en-US': {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
  },
};

/**
 * 初始化 i18n
 */
export async function initI18n(): Promise<void> {
  // 可以从存储加载用户语言偏好
  // const locale = await AsyncStorage.getItem('@stallai_locale');
  // if (locale) currentLocale = locale;
}

/**
 * 翻译函数
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const translation = translations[currentLocale]?.[key] || translations['zh-CN'][key] || key;
  
  if (!params) return translation;
  
  return translation.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

/**
 * 设置语言
 */
export function setLocale(locale: string): void {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLocales(): { code: string; name: string }[] {
  return [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
  ];
}
