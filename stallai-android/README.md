# 摆摊AI经营OS - Android App

AI驱动的智能摆摊经营管理平台 Android 应用

## 📱 功能特性

### 核心功能
- **AI驾驶舱** - 实时经营数据概览、AI智能分析、经营评分
- **智能记账** - 收入/支出记录、自动分类统计
- **库存管理** - 库存监控、预警提醒、补货建议
- **AI分析** - 趋势预测、爆款分析、数据洞察
- **个人中心** - 用户等级、成就系统、设置

### 设计特色
- 中国现代简约风格设计
- 玻璃态(Glassmorphism)UI效果
- 流畅的动画交互
- 深色/浅色模式支持

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm 或 yarn
- Android Studio (用于Android构建)
- JDK 17

### 安装依赖

```bash
cd stallai-android
npm install
# 或
yarn install
```

### 开发模式运行

```bash
# 启动 Expo 开发服务器
npx expo start

# 在 Android 模拟器/真机上运行
npx expo run:android

# 或使用 Expo Go App 扫描二维码
```

### 构建 APK

```bash
# 生成开发版 APK
npx expo run:android --variant release

# 或使用 EAS 构建
npx eas build --platform android
```

## 📁 项目结构

```
stallai-android/
├── app/                          # 页面路由
│   ├── (tabs)/                   # Tab导航页面
│   │   ├── dashboard.tsx         # AI驾驶舱首页
│   │   ├── accounts.tsx          # 记账系统
│   │   ├── inventory.tsx         # 库存管理
│   │   ├── insights.tsx          # AI分析
│   │   └── profile.tsx           # 个人中心
│   ├── _layout.tsx               # 根布局
│   └── index.tsx                 # 入口
├── components/                   # 组件
│   ├── ui/                       # UI组件
│   │   ├── GlassCard.tsx         # 玻璃态卡片
│   │   ├── ScoreRing.tsx         # 环形评分
│   │   ├── MetricCard.tsx        # 指标卡片
│   │   └── AIBadge.tsx           # AI徽章
│   └── dashboard/                # 仪表盘组件
│       ├── BusinessScore.tsx     # 经营评分
│       ├── AISummary.tsx         # AI摘要
│       └── QuickActions.tsx      # 快捷操作
├── stores/                       # 状态管理
│   ├── appStore.ts
│   ├── authStore.ts
│   └── dashboardStore.ts
├── services/                     # API服务
│   ├── api.ts
│   ├── dashboardService.ts
│   ├── transactionService.ts
│   └── inventoryService.ts
├── theme/                        # 主题配置
│   └── index.ts
├── types/                        # TypeScript类型
│   └── index.ts
└── utils/                        # 工具函数
    ├── formatters.ts
    └── colors.ts
```

## 🎨 设计系统

### 颜色
- **奶油色 (Cream)**: #FAFAFA - 主背景
- **深灰色 (Dark Gray)**: #1A1A1A - 主文字
- **木质色 (Wood)**: #8B7355 - 主色调
- **中国红 (Red)**: #E53935 - 强调色
- **成功绿**: #22C55E
- **警告黄**: #F59E0B
- **信息蓝**: #3B82F6

### 字体
- 主字体: System Default
- 标题: 600 weight
- 正文: 400 weight

## 🔧 技术栈

- **React Native** - 跨平台框架
- **Expo** - 开发工具链
- **TypeScript** - 类型安全
- **Zustand** - 状态管理
- **TanStack Query** - 数据获取
- **React Navigation** - 导航
- **React Native Reanimated** - 动画
- **React Native Paper** - UI组件

## 📦 依赖说明

主要依赖:
- `expo` - Expo SDK
- `expo-router` - 文件系统路由
- `react-native-reanimated` - 动画库
- `zustand` - 状态管理
- `@tanstack/react-query` - 数据获取
- `react-native-paper` - Material Design组件

## 📝 开发指南

### 添加新页面
1. 在 `app/` 目录下创建 `.tsx` 文件
2. 使用 Expo Router 的约定进行路由

### 添加新组件
1. 在 `components/` 目录下创建组件
2. 使用主题系统中的颜色和样式

### API集成
1. 在 `services/` 目录下创建服务文件
2. 使用 `api.ts` 中的 axios 实例

## 🔐 环境配置

创建 `.env` 文件:
```
API_BASE_URL=https://your-api.com
```

## 📄 许可证

MIT License
