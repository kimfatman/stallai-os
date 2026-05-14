# 摆摊AI经营OS
# AI Street Vendor Management Operating System

<div align="center">

![Logo](docs/images/logo.png)

**让每一个小摊贩都能享受AI带来的便利**

基于 React Native + NestJS 构建的智能摆摊经营管理系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)](https://reactnative.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)

[English](./README.md) | [中文](./README_zh.md)

</div>

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 项目简介

摆摊AI经营OS 是一款专为街头摊贩设计的智能经营管理应用。通过 AI 技术，帮助摊贩实现：

- 智能账目管理
- 实时库存监控
- AI 选品推荐
- 爆款趋势预测
- 货源智能匹配
- 社区经验分享

### 愿景

> "让科技普惠每一个勤劳的创业者"

我们相信，无论是大企业还是小摊位，每个经营者都应该能够享受 AI 带来的便利。

---

## 功能特性

### 核心功能

#### 1. AI 驾驶舱 (AI Dashboard)
- 实时经营数据概览
- AI 智能分析摘要
- 关键指标可视化
- 异常情况预警

#### 2. 智能记账 (Smart Accounts)
- 收入/支出快速记录
- 语音记账
- 自动分类统计
- 经营报表生成

#### 3. 库存管理 (Inventory Management)
- 商品库存实时监控
- 库存预警提醒
- 自动补货建议
- 批次管理

#### 4. AI 选品 (AI Product Selection)
- 基于市场趋势的选品建议
- 竞品分析
- 利润预估
- 季节性选品推荐

#### 5. 爆款预测 (Trend Prediction)
- 热门商品预测
- 季节性趋势分析
- 区域热度分析
- 社交媒体热点追踪

#### 6. 货源广场 (Supplier Marketplace)
- 优质货源展示
- 价格比较
- 供应商评价
- 一键联系

#### 7. 摆摊地图 (Stall Map)
- 热门摆摊地点推荐
- 人流量分析
- 竞争对手分布
- 最优路线规划

#### 8. 社区交流 (Community)
- 摊主经验分享
- 问题求助
- 资源置换
- 官方公告

---

## 技术栈

### 移动端 (stallai-app)

| 技术 | 说明 | 版本 |
|------|------|------|
| React Native | 跨平台移动框架 | 0.73.x |
| Expo | React Native 开发工具 | SDK 50+ |
| TypeScript | 类型安全 | 5.3.x |
| Tailwind CSS | 原子化 CSS | NativeWind |
| Zustand | 状态管理 | 4.x |
| React Navigation | 路由导航 | 6.x |
| TanStack Query | 服务端状态管理 | 5.x |
| Reanimated | 动画库 | 3.x |
| Gesture Handler | 手势处理 | 2.x |
| Chart.js | 图表可视化 | 4.x |
| Apollo Client | GraphQL 客户端 | 3.x |

### 后端 (stallai-backend)

| 技术 | 说明 | 版本 |
|------|------|------|
| NestJS | Node.js 企业级框架 | 10.x |
| TypeScript | 类型安全 | 5.3.x |
| Prisma | ORM | 5.x |
| PostgreSQL | 主数据库 | 15.x |
| Redis | 缓存/会话存储 | 7.x |
| JWT | 身份认证 | - |
| Socket.io | WebSocket | 4.x |
| Bull | 任务队列 | - |
| OpenAI | AI 能力 | - |
| class-validator | 数据验证 | - |
| Swagger | API 文档 | - |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        摆摊AI经营OS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────────────┐  │
│   │                 │         │      PostgreSQL         │  │
│   │   stallai-app   │────────▶│         Redis           │  │
│   │  (React Native) │         │      NestJS Backend     │  │
│   │                 │◀────────│                         │  │
│   └─────────────────┘         └─────────────────────────┘  │
│           │                            │                   │
│           │                            │                   │
│           ▼                            ▼                   │
│   ┌─────────────────┐         ┌─────────────────────────┐  │
│   │  设备原生功能    │         │    AI Agents / WebSocket │  │
│   │  相机/位置/推送  │         │    第三方服务集成        │  │
│   └─────────────────┘         └─────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 环境要求

| 环境 | 版本要求 |
|------|----------|
| Node.js | >= 18.0.0 |
| pnpm | >= 8.0.0 |
| Docker | >= 20.10 (可选) |
| PostgreSQL | 15.x (可选，使用 Docker 时自动安装) |
| Redis | 7.x (可选，使用 Docker 时自动安装) |

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-org/stallai-os.git
cd stallai-os
```

#### 2. 安装依赖

```bash
# 使用 pnpm 安装所有 workspace 依赖
pnpm install
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
```

#### 4. 启动基础设施 (Docker)

```bash
# 启动 PostgreSQL 和 Redis
pnpm docker:up

# 查看容器状态
docker ps
```

#### 5. 初始化数据库

```bash
# 运行数据库迁移
pnpm db:migrate

# 填充初始数据 (可选)
pnpm db:seed
```

#### 6. 启动开发服务

```bash
# 启动所有服务 (后端 + 前端)
pnpm dev

# 或者分别启动
pnpm --filter stallai-backend run start:dev
pnpm --filter stallai-app start
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 后端 API | http://localhost:3000 |
| API 文档 | http://localhost:3000/api/docs |
| Prisma Studio | http://localhost:5555 |
| 移动端 Expo | 在终端中显示二维码 |

---

## 环境配置

### 环境变量说明

| 变量名 | 必填 | 说明 | 默认值 |
|--------|------|------|--------|
| `NODE_ENV` | 是 | 运行环境 | development |
| `DATABASE_URL` | 是 | PostgreSQL 连接字符串 | - |
| `REDIS_HOST` | 否 | Redis 主机地址 | localhost |
| `REDIS_PORT` | 否 | Redis 端口 | 6379 |
| `JWT_SECRET` | 是 | JWT 密钥 (生产环境必须修改) | - |
| `JWT_EXPIRATION` | 否 | JWT 过期时间 | 7d |
| `OPENAI_API_KEY` | 否 | OpenAI API 密钥 | - |
| `API_BASE_URL` | 否 | API 基础 URL | http://localhost:3000 |

### 配置示例

```bash
# 开发环境
NODE_ENV=development
DATABASE_URL=postgresql://stallai:stallai123@localhost:5432/stallai
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-key-change-in-production

# 生产环境
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/production_db
REDIS_HOST=redis.production.com
REDIS_PORT=6379
JWT_SECRET=your-very-long-and-secure-secret-key
OPENAI_API_KEY=sk-xxxxx
```

---

## 开发指南

### 项目结构

```
stallai-os/
├── package.json              # 根包配置
├── pnpm-workspace.yaml        # workspace 配置
├── docker-compose.yml         # Docker 编排
├── .env.example               # 环境变量示例
├── README.md                  # 项目文档
│
├── stallai-app/              # React Native 移动应用
│   ├── app/                  # 页面路由 (Expo Router)
│   ├── src/                  # 源代码
│   │   ├── components/       # UI 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── stores/           # Zustand 状态管理
│   │   ├── services/         # API 服务
│   │   ├── utils/            # 工具函数
│   │   └── types/            # TypeScript 类型定义
│   ├── package.json
│   └── ...
│
└── stallai-backend/          # NestJS 后端服务
    ├── src/                  # 源代码
    │   ├── modules/          # 功能模块
    │   ├── common/           # 公共模块
    │   └── ai/               # AI 代理模块
    ├── prisma/               # Prisma ORM
    │   ├── schema.prisma     # 数据库模型
    │   └── seed.ts           # 种子数据
    ├── Dockerfile
    ├── docker-compose.yml
    ├── package.json
    └── ...
```

### 移动端开发

```bash
# 进入移动端目录
cd stallai-app

# 启动开发服务器 (带 Expo)
npx expo start

# 使用特定的 Expo 启动器
npx expo start --tunnel
npx expo start --android
npx expo start --ios

# 类型检查
pnpm typecheck

# 代码格式化
pnpm lint
pnpm lint:fix
```

### 后端开发

```bash
# 进入后端目录
cd stallai-backend

# 开发模式启动 (热重载)
npm run start:dev

# 生产模式构建
npm run build

# 生产模式启动
npm run start:prod

# Prisma 操作
npx prisma migrate dev          # 创建迁移
npx prisma migrate deploy      # 应用迁移
npx prisma db seed             # 填充数据
npx prisma studio              # 打开 Prisma Studio

# 测试
npm run test
npm run test:cov               # 覆盖率测试
```

### 代码规范

```bash
# ESLint 检查
pnpm lint

# Prettier 格式化
pnpm format

# 提交前检查
pnpm precommit
```

---

## API 文档

启动后端服务后，访问 Swagger UI 查看完整的 API 文档：

```
http://localhost:3000/api/docs
```

### 主要 API 端点

#### 认证模块 `/auth`
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/refresh` | 刷新 Token |
| POST | `/auth/logout` | 用户登出 |

#### 用户模块 `/users`
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/users/profile` | 获取个人资料 |
| PATCH | `/users/profile` | 更新个人资料 |
| GET | `/users/settings` | 获取设置 |
| PATCH | `/users/settings` | 更新设置 |

#### 商品模块 `/products`
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/products` | 获取商品列表 |
| POST | `/products` | 创建商品 |
| GET | `/products/:id` | 获取商品详情 |
| PATCH | `/products/:id` | 更新商品 |
| DELETE | `/products/:id` | 删除商品 |

#### 交易模块 `/transactions`
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/transactions` | 获取交易记录 |
| POST | `/transactions` | 创建交易记录 |
| GET | `/transactions/stats` | 获取统计报表 |

#### 库存模块 `/inventory`
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/inventory` | 获取库存列表 |
| PATCH | `/inventory/:id` | 更新库存 |
| POST | `/inventory/restock` | 发起补货建议 |

#### AI 模块 `/ai`
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/ai/analyze` | AI 经营分析 |
| POST | `/ai/select` | AI 选品推荐 |
| POST | `/ai/predict` | 爆款趋势预测 |
| GET | `/ai/daily-report` | 获取每日 AI 报告 |

#### 货源模块 `/suppliers`
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/suppliers` | 获取供应商列表 |
| GET | `/suppliers/:id` | 获取供应商详情 |

#### 社区模块 `/community`
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/community/posts` | 获取帖子列表 |
| POST | `/community/posts` | 创建帖子 |
| POST | `/community/posts/:id/comments` | 评论帖子 |

---

## 数据库模型

### 主要实体关系

```
User (用户)
├── Products (商品)
├── Transactions (交易记录)
├── Inventory (库存)
└── Posts (社区帖子)

Supplier (供应商)
└── Products (供应商品)

AIAnalysis (AI分析记录)
└── Linked to User
```

详细字段请参考 `stallai-backend/prisma/schema.prisma`

---

## Docker 部署

### 使用 Docker Compose 启动

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建
docker-compose up -d --build --force-recreate
```

### 仅启动基础设施

```bash
# 只启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis
```

### 生产环境部署

```bash
# 使用生产环境变量文件
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 测试

### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行测试并监听变化
pnpm test:watch

# 生成覆盖率报告
pnpm test:cov
```

### E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e

# 生成覆盖率报告
pnpm test:e2e:cov
```

---

## 贡献指南

欢迎提交 Pull Request 或 Issue！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 配置规则
- 使用 Prettier 格式化代码
- 编写必要的单元测试
- 更新相关文档

---

## 常见问题

### Q: 数据库连接失败？
A: 确保 PostgreSQL 已启动，检查 `DATABASE_URL` 环境变量配置是否正确。

### Q: 移动端无法连接后端？
A: 检查后端服务是否运行，确保 `API_BASE_URL` 配置正确指向后端地址。

### Q: AI 功能无法使用？
A: 检查 `OPENAI_API_KEY` 是否配置，确保 API 余额充足。

---

## 更新日志

### v1.0.0 (2024-01-xx)
- 初始版本发布
- 核心功能上线

---

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 联系方式

- 项目主页: https://github.com/your-org/stallai-os
- 问题反馈: https://github.com/your-org/stallai-os/issues
- 邮箱: support@stallai.com

---

<div align="center">

**Made with ❤️ for street vendors worldwide**

</div>
