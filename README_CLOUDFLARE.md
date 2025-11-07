# DailyPaper - Cloudflare 版本

这是 DailyPaper 的 Cloudflare Pages + Workers 版本，使用纯前端托管和边缘计算。

## 🎯 主要改动

### 从 Python 迁移到 TypeScript/JavaScript

- ✅ **数据抓取**：从 Python `arxiv` 库改为使用 ArXiv REST API + XML 解析
- ✅ **HTML 生成**：从静态生成改为前端动态渲染
- ✅ **自动化**：从 GitHub Actions 改为 Cloudflare Cron Triggers
- ✅ **数据存储**：从 Git 版本控制改为 Cloudflare KV

## 📁 项目结构

```
DailyPaper/
├── functions/              # Cloudflare Pages Functions
│   ├── api/
│   │   ├── fetch-papers.ts    # GET /api/fetch-papers
│   │   └── months-index.ts    # GET /api/months-index
│   └── scheduled.ts           # 定时任务（需单独部署为 Worker）
├── src/                   # 源代码
│   ├── arxiv.ts          # ArXiv API 客户端
│   └── utils.ts          # 工具函数（分类、提取会议信息等）
├── docs/                  # 前端静态文件（Cloudflare Pages 部署目录）
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js       # 已修改为使用 API
├── config.json            # 配置文件（替代 config.yaml）
├── package.json
├── tsconfig.json
├── wrangler.toml          # Cloudflare 配置
└── CLOUDFLARE_DEPLOYMENT.md  # 部署指南
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Cloudflare

1. 创建 KV 命名空间（见 `CLOUDFLARE_DEPLOYMENT.md`）
2. 更新 `wrangler.toml` 中的 KV 命名空间 ID

### 3. 本地开发

```bash
npx wrangler pages dev docs --kv PAPERS_KV=你的KV命名空间ID
```

### 4. 部署

```bash
# 部署到 Cloudflare Pages
npx wrangler pages deploy docs --project-name=dailypaper
```

详细部署步骤请参考 [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

## 🔄 工作流程

1. **定时任务**（每天 UTC 0:00）：
   - Cloudflare Worker 执行 `functions/scheduled.ts`
   - 从 ArXiv 抓取最新论文
   - 保存到 Cloudflare KV

2. **前端请求**：
   - 用户访问页面
   - 前端调用 `/api/months-index` 获取月份列表
   - 前端调用 `/api/fetch-papers` 获取论文数据
   - Pages Functions 从 KV 读取并返回

## 📊 API 端点

### GET /api/fetch-papers

获取论文数据。

**查询参数**：
- `month` (可选): 指定月份，格式 `YYYY-MM`，如 `2025-10`。不指定则返回所有论文。

**响应**：
```json
[
  {
    "id": "2310.12345",
    "title": "Paper Title",
    "authors": ["Author 1", "Author 2"],
    "abstract": "Abstract text...",
    "published": "2025-10-31",
    "updated": "2025-10-31",
    "categories": ["cs.AI"],
    "primary_category": "cs.AI",
    "pdf_url": "https://arxiv.org/pdf/2310.12345.pdf",
    "arxiv_url": "https://arxiv.org/abs/2310.12345",
    "source": "ArXiv",
    "venue": "cs.AI",
    "conference": "NeurIPS 2025",
    "tags": ["Machine Learning"]
  }
]
```

### GET /api/months-index

获取月份索引。

**响应**：
```json
[
  {
    "month": "2025-10",
    "count": 958,
    "published_count": 140,
    "preprint_count": 818
  }
]
```

## ⚙️ 配置

编辑 `config.json` 来自定义：

- `sources.arxiv.categories`: ArXiv 类别列表
- `sources.arxiv.max_results`: 每个类别最多抓取数量
- `sources.arxiv.days_back`: 抓取最近几天的论文
- `categories`: 论文分类关键词

## 🔧 开发

### 类型检查

```bash
npm run type-check
```

### 构建

```bash
npm run build
```

## 📝 注意事项

1. **定时任务**：需要单独创建一个 Cloudflare Worker 来执行定时任务，因为 Pages Functions 不支持 Cron Triggers。
2. **KV 存储**：首次部署后，需要等待定时任务执行或手动触发 Worker 来填充数据。
3. **CORS**：API Functions 已配置 CORS，支持跨域请求。

## 🆚 与原版对比

| 功能 | 原版 (GitHub Pages) | Cloudflare 版本 |
|------|-------------------|----------------|
| 数据抓取 | Python 脚本 | TypeScript + ArXiv API |
| HTML 生成 | Python 静态生成 | 前端动态渲染 |
| 自动化 | GitHub Actions | Cloudflare Cron Triggers |
| 数据存储 | Git 版本控制 | Cloudflare KV |
| 部署 | GitHub Pages | Cloudflare Pages |
| 成本 | 免费 | 免费（有额度限制） |

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [ArXiv API 文档](https://arxiv.org/help/api/user-manual)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

