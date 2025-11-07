# 分类设置指南

## ✅ 已完成的配置

### 1. 图标更新
- ✅ 已更新为新的 Logo URL

### 2. 后端分类（config.json）

已添加以下分类到 `config.json`：

#### AI Companion（AI陪伴领域）
- 关键词：ai companion, virtual companion, emotional ai, affective computing, human-computer interaction, HCI, emotion recognition, emotion detection, psychological ai, mental health ai, conversational ai, empathetic ai, social robot, companion robot, emotional intelligence, empathy, emotion understanding, sentiment analysis, emotion analysis

#### AI Agents（智能体领域）
- 关键词：ai agent, intelligent agent, autonomous agent, multi-agent system, agent framework, agent architecture, agent learning, reinforcement learning agent, language agent, tool-using agent, agentic ai, agent planning, LLM agent, GPT agent, autonomous agent, agent system, agentic, agent-based

#### 扩展 ArXiv 类别
- ✅ 已添加 `cs.HC`（人机交互）类别，用于抓取更多 AI陪伴相关论文

### 3. 前端自定义分类（推荐用于 GEO）

**GEO - Generative Engine Optimization** 建议使用前端自定义分类：

1. 打开管理界面
2. 添加分类：`GEO - Generative Engine Optimization`
3. 配置关键词：
   ```
   generative engine optimization, GEO, SEO, search engine optimization, 
   generative ai optimization, LLM optimization, prompt optimization, 
   RAG, retrieval augmented generation, semantic search, vector search,
   search optimization, generative search
   ```

## 📊 分类总结

### 后端分类（7个）

1. **Computer Vision** - 计算机视觉
2. **Natural Language Processing** - 自然语言处理
3. **Machine Learning** - 机器学习
4. **Robotics** - 机器人学
5. **Multimodal** - 多模态（已扩展关键词）
6. **AI Companion** - AI陪伴（新增）✨
7. **AI Agents** - 智能体（新增）✨

### 前端自定义分类（推荐）

- **GEO - Generative Engine Optimization** - 生成引擎优化

## 🔄 下一步操作

### 1. 重新部署后端

修改 `config.json` 后，需要重新部署：

```bash
# 提交更改
git add config.json
git commit -m "Add AI Companion and AI Agents categories, add cs.HC category"
git push

# 重新部署 Cloudflare Workers
# 或等待下次定时任务执行
```

### 2. 手动触发定时任务（可选）

在 Cloudflare Dashboard 中手动触发 Worker，立即应用新配置。

### 3. 添加 GEO 前端分类

1. 访问网站
2. 点击"研究领域"旁的"管理"按钮
3. 添加分类：`GEO - Generative Engine Optimization`
4. 配置关键词（见上方）
5. 保存

## 📈 预期效果

### 后端分类（AI Companion + AI Agents）

- ✅ 每天自动抓取和分类
- ✅ 所有用户可见
- ✅ 数据持久化
- ✅ 跨设备同步

### 前端分类（GEO）

- ✅ 立即生效
- ✅ 灵活调整
- ✅ 不影响其他用户

## 🎯 关键词优化建议

### AI Companion 关键词说明

**核心概念：**
- ai companion, virtual companion - AI陪伴核心
- emotional ai, affective computing - 情感AI
- emotion recognition, emotion detection - 情绪识别
- human-computer interaction, HCI - 人机交互
- psychological ai, mental health ai - 心理学AI
- conversational ai, empathetic ai - 对话和共情AI

**覆盖范围：**
- ✅ 人机互动
- ✅ 情绪识别
- ✅ 心理学相关

### AI Agents 关键词说明

**核心概念：**
- ai agent, intelligent agent - 智能体核心
- autonomous agent - 自主智能体
- multi-agent system - 多智能体系统
- agent framework, agent architecture - 智能体框架
- language agent, LLM agent, GPT agent - 语言智能体
- tool-using agent - 工具使用智能体
- agentic ai - 智能体AI

**覆盖范围：**
- ✅ 智能体架构
- ✅ 智能体学习
- ✅ 智能体规划
- ✅ 语言智能体

### GEO 关键词说明

**核心概念：**
- generative engine optimization, GEO - 核心概念
- SEO, search engine optimization - 搜索引擎优化
- LLM optimization, prompt optimization - LLM优化
- RAG, retrieval augmented generation - 检索增强生成
- semantic search, vector search - 语义搜索

**覆盖范围：**
- ✅ 生成引擎优化
- ✅ 搜索优化
- ✅ 提示优化

## ⚠️ 注意事项

1. **重新部署后**，需要等待下次定时任务执行（或手动触发）才能看到新分类的论文
2. **GEO 分类**建议先用前端自定义分类测试，如果论文较多再考虑加入后端
3. **cs.HC 类别**已添加，会抓取更多人机交互相关论文，可能增加 AI Companion 分类的论文数量

## 🔍 验证方法

部署后，检查：

1. **后端分类**：
   - 查看筛选按钮，应该显示 "AI Companion" 和 "AI Agents"
   - 查看论文数量是否合理

2. **前端分类**：
   - 添加 GEO 分类后，查看是否有匹配的论文
   - 查看控制台日志确认匹配情况

3. **ArXiv 类别**：
   - 查看是否抓取了 cs.HC 类别的论文
   - 这些论文可能更多匹配到 AI Companion 分类

