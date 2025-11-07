# 快速开始 - 本地测试

## 🚀 三步快速测试

### 步骤 1: 安装依赖

```bash
cd DailyPaper
npm install
```

### 步骤 2: 测试数据抓取

运行测试脚本，从 ArXiv 抓取论文：

```bash
npm run test:fetch
```

**预期输出：**
- ✅ 显示抓取的论文数量
- ✅ 显示统计信息（分类、月份分布等）
- ✅ 保存测试数据到 `test-output/` 目录

### 步骤 3: 启动本地服务器并测试前端

在**新的终端窗口**中运行：

```bash
npm run test:server
```

然后在浏览器中访问：**http://localhost:8788/**

## 📊 验证清单

### ✅ 数据抓取验证
- [ ] 成功抓取到论文（数量 > 0）
- [ ] `test-output/` 目录生成了 JSON 文件
- [ ] 论文数据包含完整字段（title, authors, abstract 等）

### ✅ 前端功能验证
- [ ] 页面正常加载
- [ ] 论文列表显示
- [ ] 筛选功能正常（月份、状态、分类）
- [ ] 搜索功能正常
- [ ] 导出功能正常

### ✅ API 验证
在浏览器中访问：
- [ ] http://localhost:8788/api/fetch-papers
- [ ] http://localhost:8788/api/months-index

## 🐛 如果遇到问题

### 问题：npm install 失败
```bash
# 清除缓存重试
npm cache clean --force
npm install
```

### 问题：抓取返回 0 篇论文
- 检查网络连接
- 检查 `config.json` 中的 `days_back` 和 `max_results` 设置
- 尝试增加 `days_back` 值（如改为 30）

### 问题：服务器启动失败
- 检查端口 8788 是否被占用
- 确保已先运行 `npm run test:fetch`

### 问题：前端无法加载数据
- 打开浏览器开发者工具（F12）
- 查看 Console 和 Network 标签页
- 确保已运行 `npm run test:fetch` 生成测试数据

## 📝 详细文档

更多详细信息请参考：
- [LOCAL_TEST.md](./LOCAL_TEST.md) - 完整测试指南
- [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - 部署指南

## 💡 提示

- 首次运行可能需要几分钟（取决于网络和抓取数量）
- 建议先用较小的 `max_results` 值测试（如 10-20）
- 测试数据保存在 `test-output/` 目录，可以手动查看和编辑

