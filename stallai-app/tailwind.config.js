// NativeWind Tailwind 配置
// 为 React Native 提供 Tailwind CSS 支持

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 内容路径配置 - 指定需要扫描 Tailwind 类的文件
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  
  // 重要：NativeWind 必须在 presets 中声明
  presets: [require('nativewind/preset')],
  
  // 自定义主题配置
  theme: {
    // 扩展默认主题
    extend: {
      // 颜色配置 - 摆摊AI品牌色
      colors: {
        // 主色调 - 科技蓝
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // 次要色调 - 活力橙
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // 成功色
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        // 警告色
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        // 错误色
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
        // 背景色
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          dark: '#0f172a',
        },
        // 卡片色
        card: {
          light: '#ffffff',
          dark: '#1e293b',
        },
      },
      
      // 字体配置
      fontFamily: {
        sans: ['System', 'ui-sans-serif', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      
      // 圆角配置
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'full': '9999px',
      },
      
      // 阴影配置 - 玻璃态效果
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.12)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      
      // 动画配置
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.5s ease-out',
      },
      
      // 关键帧动画
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      // 渐变配置
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      },
    },
  },
  
  // NativeWind 特定配置
  // 用于启用 darkMode 等特性
  plugins: [],
  
  // 重要：设置 darkMode
  darkMode: 'class',
  
  // 别名配置
  presets: [
    require('nativewind/preset'),
  ],
};
