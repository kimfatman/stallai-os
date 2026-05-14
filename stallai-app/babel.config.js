// babel.config.js - Babel 配置文件
// 用于 Expo Router 和 NativeWind 支持
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // 使用 Babel preset-env 处理 JavaScript
      ['babel-preset-expo', { 
        // 启用 React 18 新特性
        reactStrictMode: true,
        // 原生调试支持
        native: true,
      }],
    ],
    plugins: [
      // NativeWind 配置 - 必须放在最前面
      // 提供 Tailwind CSS 支持
      'nativewind/babel',
      
      // 模块路径别名配置
      // 支持 @/ 风格的导入路径
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@stores': './src/stores',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
          },
        },
      ],
      
      // Reanimated 动画库配置
      // 必须在 babel-preset-expo 之后加载
      'react-native-reanimated/plugin',
      
      // 装饰器支持 (用于 class-validator 等)
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
