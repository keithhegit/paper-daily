# 本地测试指南

本指南将帮助你本地运行和测试 DailyPaper 项目。

## 📋 前置要求

1. **Node.js 18+** 和 npm
2. **网络连接**（用于访问 ArXiv API）

## 🚀 快速开始

### 步骤 1: 安装依赖

```bash
cd DailyPaper
npm install
```

### 步骤 2: 测试数据抓取功能

运行测试脚本，从 ArXiv 抓取论文并保存到本地：

```bash
npm run test:fetch
```

这个命令会：
- ✅ 从 ArXiv 抓取论文
- ✅ 进行去重和排序
- ✅ 按月份分组
- ✅ 显示统计信息
- ✅ 保存测试数据到 `test-output/` 目录

**预期输出示例：**
```
============================================================
开始本地测试 ArXiv 抓取功能
============================================================

📚 步骤 1: 从 ArXiv 抓取论文...
✅ 成功抓取 45 篇论文

🔄 步骤 2: 去重处理...
✅ 去重后剩余 45 篇论文

📅 步骤 3: 按日期排序...
✅ 排序完成

📊 步骤 4: 按月份分组...
✅ 分为 1 个月份

📈 统计信息:
- 总论文数: 45
- 已发表: 8
- 预印本: 37

📂 分类统计:
  - Machine Learning: 25
  - Computer Vision: 12
  - Natural Language Processing: 8

💾 步骤 5: 保存测试数据...
✅ 已保存到: test-output/papers-all.json
✅ 已保存月份索引到: test-output/months-index.json

✅ 测试完成！
```

### 步骤 3: 启动本地测试服务器

启动一个本地服务器来测试前端页面和 API：

```bash
npm run test:server
```

服务器将在 `http://localhost:8788` 启动。

**预期输出：**
```
============================================================
🚀 本地测试服务器已启动
============================================================

📍 访问地址:
   - 前端页面: http://localhost:8788/
   - API 端点: http://localhost:8788/api/fetch-papers
   - 月份索引: http://localhost:8788/api/months-index

💡 提示:
   - 确保已运行 'npm run test:fetch' 生成测试数据
   - 按 Ctrl+C 停止服务器
```

### 步骤 4: 测试前端页面

1. 打开浏览器，访问 `http://localhost:8788/`
2. 你应该能看到：
   - 论文列表
   - 筛选功能（月份、状态、分类）
   - 搜索功能
   - 导出功能

### 步骤 5: 测试 API 端点

#### 测试获取所有论文

```bash
curl http://localhost:8788/api/fetch-papers
```

#### 测试获取指定月份

```bash
curl http://localhost:8788/api/fetch-papers?month=2025-10
```

#### 测试月份索引

```bash
curl http://localhost:8788/api/months-index
```

## 🔍 验证要点

### 1. 数据抓取验证

检查 `test-output/` 目录中的文件：
- `papers-all.json` - 所有论文数据
- `papers-YYYY-MM.json` - 各月份数据
- `months-index.json` - 月份索引

打开这些文件，验证：
- ✅ 论文数据结构正确
- ✅ 包含所有必要字段（title, authors, abstract, etc.）
- ✅ 会议信息正确提取
- ✅ 分类标签正确

### 2. 前端功能验证

在浏览器中测试：
- ✅ 页面正常加载
- ✅ 论文列表显示
- ✅ 月份筛选功能
- ✅ 状态筛选（已发表/预印本）
- ✅ 分类筛选
- ✅ 搜索功能
- ✅ 排序功能
- ✅ 导出功能

### 3. API 功能验证

使用 curl 或浏览器测试：
- ✅ `/api/fetch-papers` 返回所有论文
- ✅ `/api/fetch-papers?month=YYYY-MM` 返回指定月份
- ✅ `/api/months-index` 返回月份索引
- ✅ CORS 头正确设置

## 🐛 常见问题

### 问题 1: 抓取失败或返回 0 篇论文

**可能原因：**
- 网络连接问题
- ArXiv API 限制
- 配置的类别没有新论文

**解决方案：**
- 检查网络连接
- 增加 `config.json` 中的 `days_back` 值
- 检查 `max_results` 设置

### 问题 2: 服务器启动失败

**可能原因：**
- 端口 8788 被占用
- 缺少测试数据

**解决方案：**
- 修改 `test-local-server.ts` 中的端口号
- 确保先运行 `npm run test:fetch`

### 问题 3: 前端页面无法加载数据

**可能原因：**
- API 端点返回错误
- CORS 问题
- 测试数据未生成

**解决方案：**
- 打开浏览器开发者工具查看控制台错误
- 检查 Network 标签页中的 API 请求
- 确保已运行 `npm run test:fetch`

### 问题 4: TypeScript 编译错误

**可能原因：**
- 类型定义问题
- 缺少依赖

**解决方案：**
```bash
npm install
npm run type-check
```

## 📊 测试数据说明

测试数据保存在 `test-output/` 目录：

```
test-output/
├── papers-all.json          # 所有论文
├── papers-2025-10.json      # 2025年10月的论文
├── papers-2025-11.json      # 2025年11月的论文
└── months-index.json        # 月份索引
```

这些文件是 JSON 格式，可以直接查看和编辑。

## 🎯 下一步

测试通过后，你可以：

1. **部署到 Cloudflare Pages**
   - 参考 `CLOUDFLARE_DEPLOYMENT.md`

2. **调整配置**
   - 编辑 `config.json` 自定义抓取参数

3. **优化性能**
   - 调整抓取数量
   - 优化分类逻辑

## 💡 提示

- 首次运行可能需要一些时间（取决于网络和抓取数量）
- 建议先用较小的 `max_results` 值测试
- 查看控制台输出了解详细过程
- 测试数据可以手动编辑来测试不同场景

## 🔗 相关文档

- [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - 部署指南
- [README_CLOUDFLARE.md](./README_CLOUDFLARE.md) - 项目说明

