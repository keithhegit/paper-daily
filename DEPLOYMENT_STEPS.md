# 部署步骤指南

## ✅ 当前状态

所有代码已更新完成：
- ✅ `config.json` - 已添加 AI Companion 和 AI Agents 分类，添加 cs.HC 类别
- ✅ 前端代码 - 已更新图标和自定义分类功能
- ✅ 后端代码 - 已准备好，使用新的 config.json

## 🚀 部署前准备

### 步骤 1: 本地测试（推荐先做）

#### 1.1 测试数据抓取

```bash
cd DailyPaper
npm run test:fetch
```

**预期结果：**
- 应该能看到抓取了包含 cs.HC 类别的论文
- 应该能看到 "AI Companion" 和 "AI Agents" 分类的论文
- 查看控制台输出，确认新分类有匹配的论文

#### 1.2 启动本地服务器测试前端

```bash
# 在新的终端窗口
npm run test:server
```

访问 `http://localhost:8788/` 查看：
- ✅ 新 Logo 是否显示
- ✅ 筛选按钮中是否有 "AI Companion" 和 "AI Agents"
- ✅ 这些分类是否有论文数量

### 步骤 2: 检查 Cloudflare 配置

#### 2.1 确认 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **KV**
3. 确认已创建 `PAPERS_KV` 命名空间
4. 复制命名空间 ID

#### 2.2 更新 wrangler.toml

编辑 `wrangler.toml`，填入 KV 命名空间 ID：

```toml
[[kv_namespaces]]
binding = "PAPERS_KV"
id = "你的KV命名空间ID"  # 替换这里
```

## 📦 部署步骤

### 方式一：使用 Wrangler CLI（推荐）

#### 步骤 1: 登录 Cloudflare

```bash
cd DailyPaper
npx wrangler login
```

#### 步骤 2: 部署 Pages

```bash
# 部署前端页面和 Functions
npx wrangler pages deploy docs --project-name=dailypaper
```

#### 步骤 3: 部署定时任务 Worker

由于 Pages Functions 不支持 Cron Triggers，需要单独部署 Worker：

1. 在 Cloudflare Dashboard 中：
   - 进入 **Workers & Pages** > **Workers**
   - 点击 **Create a Worker**
   - 名称：`dailypaper-scheduled`

2. 将 `functions/scheduled.ts` 的内容复制到 Worker 编辑器

3. 配置 KV 绑定：
   - **Settings** > **Variables** > **KV Namespace Bindings**
   - Variable name: `PAPERS_KV`
   - KV namespace: 选择 `PAPERS_KV`

4. 配置 Cron Trigger：
   - **Settings** > **Triggers** > **Cron Triggers**
   - 添加：`0 0 * * *` (每天 UTC 0:00)

5. 保存并部署

#### 步骤 4: 手动触发一次（立即测试）

在 Cloudflare Dashboard 中：
1. 进入 **Workers & Pages** > **Workers** > **dailypaper-scheduled**
2. 点击 **Triggers** 标签
3. 点击 **Run trigger** 或 **Test** 按钮
4. 查看日志，确认抓取成功

### 方式二：通过 Git 集成（推荐用于生产环境）

1. 将代码推送到 GitHub/GitLab
2. 在 Cloudflare Dashboard 中：
   - **Workers & Pages** > **Pages** > **dailypaper**
   - 点击 **Connect to Git**
   - 选择你的仓库
   - 构建配置：
     - **Build command**: `npm install`（如果需要）
     - **Build output directory**: `docs`
     - **Root directory**: `/`

## 🔍 验证部署

### 1. 检查前端页面

访问你的 Cloudflare Pages URL：
- 检查 Logo 是否显示
- 检查筛选按钮中是否有新分类
- 检查新分类是否有论文数量

### 2. 检查 API

```bash
# 测试获取论文 API
curl https://你的域名.pages.dev/api/fetch-papers

# 测试月份索引 API
curl https://你的域名.pages.dev/api/months-index
```

### 3. 检查定时任务

1. 查看 Worker 日志
2. 确认定时任务执行成功
3. 检查 KV 中是否有新数据

## ⚠️ 重要提示

### 关于"是否需要先爬一次后端"

**答案：是的，建议先手动触发一次**

**原因：**
1. 新分类需要重新抓取和分类才能看到论文
2. 定时任务默认每天 UTC 0:00 执行，可能需要等待
3. 手动触发可以立即看到效果

**方法：**
1. 在 Cloudflare Dashboard 中手动触发 Worker
2. 或者等待下次定时任务执行（UTC 0:00）

### 数据更新流程

```
部署完成
    ↓
手动触发 Worker（或等待定时任务）
    ↓
Worker 读取新的 config.json
    ↓
抓取 ArXiv 论文（包含 cs.HC 类别）
    ↓
使用新分类关键词分类论文
    ↓
保存到 KV
    ↓
前端显示新分类和论文
```

## 🐛 故障排除

### 问题 1: 新分类显示数量为 0

**可能原因：**
- 还没有运行抓取任务
- 关键词没有匹配到论文
- KV 数据未更新

**解决方案：**
1. 手动触发 Worker
2. 检查 Worker 日志
3. 查看是否有匹配的论文

### 问题 2: 部署失败

**检查：**
- KV 命名空间 ID 是否正确
- wrangler.toml 配置是否正确
- 是否已登录 Cloudflare

### 问题 3: 前端无法访问

**检查：**
- Pages 部署是否成功
- 域名配置是否正确
- Functions 是否正确部署

## 📝 快速检查清单

部署前：
- [ ] 本地测试通过
- [ ] KV 命名空间已创建
- [ ] wrangler.toml 配置正确
- [ ] 已登录 Cloudflare

部署后：
- [ ] Pages 部署成功
- [ ] Worker 部署成功
- [ ] 手动触发 Worker 测试
- [ ] 前端页面正常显示
- [ ] 新分类有论文数量
- [ ] API 端点正常

## 🎯 推荐流程

1. **本地测试** → 确保代码正常
2. **部署到 Cloudflare** → 部署 Pages 和 Worker
3. **手动触发 Worker** → 立即测试新分类
4. **验证前端** → 检查新分类是否显示
5. **配置 GEO 前端分类** → 添加 GEO 自定义分类

