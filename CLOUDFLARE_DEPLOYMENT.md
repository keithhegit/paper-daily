# Cloudflare Pages 部署指南

本文档说明如何将 DailyPaper 部署到 Cloudflare Pages。

## 📋 前置要求

1. **Cloudflare 账号**：注册 [Cloudflare](https://dash.cloudflare.com/sign-up)
2. **Node.js**：安装 Node.js 18+ 和 npm
3. **Wrangler CLI**：Cloudflare 官方 CLI 工具

## 🚀 快速开始

### 1. 安装依赖

```bash
cd DailyPaper
npm install
```

### 2. 创建 Cloudflare KV 命名空间

KV 用于存储论文数据。

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 进入 **Workers & Pages** > **KV**
4. 点击 **Create a namespace**
5. 命名空间名称：`PAPERS_KV`
6. 复制命名空间 ID

### 3. 配置 wrangler.toml

编辑 `wrangler.toml`，填入 KV 命名空间 ID：

```toml
[[kv_namespaces]]
binding = "PAPERS_KV"
id = "你的命名空间ID"  # 替换为实际的 ID
```

### 4. 登录 Cloudflare

```bash
npx wrangler login
```

### 5. 创建 Cloudflare Pages 项目

#### 方式一：通过 Wrangler CLI

```bash
# 在项目根目录
npx wrangler pages project create dailypaper
```

#### 方式二：通过 Cloudflare Dashboard

1. 进入 **Workers & Pages** > **Pages**
2. 点击 **Create a project**
3. 选择 **Upload assets**
4. 项目名称：`dailypaper`

### 6. 配置定时任务（Cron Triggers）

定时任务需要在 Cloudflare Workers 中配置，而不是 Pages Functions。

#### 创建 Worker 用于定时任务

1. 在 Cloudflare Dashboard 中，进入 **Workers & Pages** > **Workers**
2. 点击 **Create a Worker**
3. 名称：`dailypaper-scheduled`
4. 将 `functions/scheduled.ts` 的内容复制到 Worker 编辑器
5. 在 **Settings** > **Triggers** > **Cron Triggers** 中添加：
   - Cron: `0 0 * * *` (每天 UTC 0:00)
6. 在 **Settings** > **Variables** > **KV Namespace Bindings** 中添加：
   - Variable name: `PAPERS_KV`
   - KV namespace: 选择之前创建的 `PAPERS_KV`

**注意**：由于 Cloudflare Pages Functions 不支持 Cron Triggers，我们需要创建一个独立的 Worker 来处理定时任务。

### 7. 部署到 Cloudflare Pages

#### 方式一：使用 Wrangler CLI

```bash
# 构建项目（如果需要）
npm run build

# 部署
npx wrangler pages deploy docs --project-name=dailypaper
```

#### 方式二：通过 Git 集成（推荐）

1. 将代码推送到 GitHub/GitLab
2. 在 Cloudflare Dashboard 中：
   - 进入 **Workers & Pages** > **Pages** > **dailypaper**
   - 点击 **Connect to Git**
   - 选择你的仓库
   - 构建配置：
     - **Build command**: `npm install && npm run build`（如果需要）
     - **Build output directory**: `docs`
     - **Root directory**: `/`
   - 环境变量（如果需要）：
     - `NODE_VERSION`: `18`

### 8. 配置 Pages Functions

确保 `functions/` 目录在项目根目录下，Cloudflare Pages 会自动识别并部署 Functions。

### 9. 绑定 KV 命名空间到 Pages

1. 进入 **Workers & Pages** > **Pages** > **dailypaper** > **Settings** > **Functions**
2. 在 **KV Namespace Bindings** 中添加：
   - Variable name: `PAPERS_KV`
   - KV namespace: 选择 `PAPERS_KV`

## 🔧 本地开发

### 启动开发服务器

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npx wrangler pages dev docs --kv PAPERS_KV=你的KV命名空间ID
```

### 测试 API

```bash
# 测试获取论文 API
curl http://localhost:8788/api/fetch-papers

# 测试月份索引 API
curl http://localhost:8788/api/months-index
```

## 📝 项目结构

```
DailyPaper/
├── functions/              # Cloudflare Pages Functions
│   ├── api/
│   │   ├── fetch-papers.ts    # 获取论文 API
│   │   └── months-index.ts    # 月份索引 API
│   └── scheduled.ts           # 定时任务（需要单独部署为 Worker）
├── src/                   # 源代码
│   ├── arxiv.ts          # ArXiv API 客户端
│   └── utils.ts          # 工具函数
├── docs/                  # 前端静态文件
│   ├── index.html
│   ├── css/
│   └── js/
├── config.json            # 配置文件
├── package.json
├── tsconfig.json
└── wrangler.toml          # Cloudflare 配置
```

## ⚙️ 配置说明

### config.json

主要配置项：

- `sources.arxiv.categories`: ArXiv 类别列表
- `sources.arxiv.max_results`: 每个类别最多抓取数量
- `sources.arxiv.days_back`: 抓取最近几天的论文
- `categories`: 论文分类关键词

### wrangler.toml

- `name`: 项目名称
- `kv_namespaces`: KV 命名空间绑定
- `triggers.crons`: 定时任务配置（仅用于 Worker，Pages Functions 不支持）

## 🔄 工作流程

1. **定时任务**（每天 UTC 0:00）：
   - Worker `dailypaper-scheduled` 执行
   - 从 ArXiv 抓取最新论文
   - 保存到 KV 存储

2. **前端请求**：
   - 用户访问页面
   - 前端调用 `/api/months-index` 获取月份列表
   - 前端调用 `/api/fetch-papers` 获取论文数据
   - Pages Functions 从 KV 读取数据并返回

## 🐛 故障排除

### 问题：API 返回 404

**解决方案**：
- 确保 `functions/` 目录在项目根目录
- 检查文件路径是否正确
- 确保已部署到 Cloudflare Pages

### 问题：KV 数据为空

**解决方案**：
- 检查 KV 命名空间是否正确绑定
- 手动触发定时任务 Worker
- 检查 Worker 日志

### 问题：定时任务未执行

**解决方案**：
- 确保 Worker 已创建并配置了 Cron Trigger
- 检查 Cron 表达式是否正确
- 查看 Worker 日志

### 问题：CORS 错误

**解决方案**：
- 检查 API Functions 中是否设置了 CORS 头
- 确保 `Access-Control-Allow-Origin` 正确配置

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 🎯 下一步

1. ✅ 创建 KV 命名空间
2. ✅ 配置 wrangler.toml
3. ✅ 部署 Pages 项目
4. ✅ 创建定时任务 Worker
5. ✅ 绑定 KV 到 Pages
6. ✅ 测试 API 端点
7. ✅ 验证定时任务执行

## 💡 提示

- 首次部署后，定时任务可能需要等待下一个 Cron 触发时间
- 可以手动触发 Worker 来立即更新数据
- 使用 Cloudflare Dashboard 的日志功能调试问题
- 考虑添加错误监控（如 Sentry）

