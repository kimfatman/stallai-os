# ============================================
# 摆摊AI经营OS - 后端 Dockerfile
# AI Street Vendor Management OS - Backend Dockerfile
# ============================================

# 基础镜像
FROM node:18-alpine AS base

# 安装pnpm
RUN npm install -g pnpm

# 工作目录
WORKDIR /app

# 依赖安装阶段
FROM base AS deps

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS build

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma Client
RUN pnpm prisma generate

# 构建应用
RUN pnpm build

# 生产镜像
FROM base AS production

# 设置环境变量
ENV NODE_ENV=production

# 工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/main"]
