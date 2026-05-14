// NativeWind Metro 配置
// 用于 Tailwind CSS 在 React Native 中的工作

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * 获取默认的 Metro 配置
 * @see https://docs.expo.dev/guides/customize-metro/
 */
const config = getDefaultConfig(__dirname);

/**
 * 使用 NativeWind 扩展默认配置
 * - designSystem: 扩展的设计系统配置
 * - plugins: NativeWind 插件
 */
module.exports = withNativeWind(config, {
  // 设计系统配置
  design: {
    // 颜色配置
    colors: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // 主色调
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      // 成功/警告/错误等语义颜色
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    // 间距配置
    spacing: {
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '8': '32px',
      '10': '40px',
      '12': '48px',
    },
    // 圆角配置
    borderRadius: {
      sm: '4px',
      DEFAULT: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
  },
  // 插件配置
  plugins: [],
  // 启用 CSS 文件处理
  file: {
    // 监视的文件扩展名
    extensions: ['css', 'native.css'],
  },
});
