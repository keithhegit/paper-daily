# 研究领域分类分析

## 🎯 你的研究方向

1. **AI陪伴领域**（人机互动、情绪识别、心理学）
2. **GEO-Generative Engine Optimization**
3. **智能体领域**（AI Agents）
4. **多模态领域**（已存在）

## 📊 分类建议

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **后端分类（config.json）** | 所有用户共享，数据持久化 | 需要重新部署，影响所有用户 | ⭐⭐⭐ |
| **前端自定义分类** | 灵活，随时调整 | 仅当前浏览器有效 | ⭐⭐⭐⭐⭐ |

## 🔍 各领域分析

### 1. AI陪伴领域（AI Companion）

**关键词建议：**
```
ai companion, virtual companion, emotional ai, affective computing, 
human-computer interaction, HCI, emotion recognition, emotion detection,
psychological ai, mental health ai, conversational ai, empathetic ai,
social robot, companion robot, emotional intelligence, sentiment analysis
```

**ArXiv 类别覆盖：**
- ✅ cs.AI（人工智能）
- ✅ cs.HC（人机交互）
- ✅ cs.CL（计算语言学，对话系统）
- ⚠️ 可能需要添加 cs.HC 类别到抓取列表

**建议：**
- 可以作为**独立分类**添加
- 关键词较多，适合后端分类

### 2. GEO-Generative Engine Optimization

**关键词建议：**
```
generative engine optimization, GEO, SEO, search engine optimization,
generative ai optimization, LLM optimization, prompt optimization,
retrieval augmented generation, RAG, semantic search, vector search
```

**ArXiv 类别覆盖：**
- ✅ cs.AI（人工智能）
- ✅ cs.IR（信息检索）
- ✅ cs.CL（计算语言学）

**建议：**
- 这是一个**新兴领域**，论文可能较少
- 可以作为**独立分类**添加
- 关键词相对集中

### 3. 智能体领域（AI Agents）

**关键词建议：**
```
ai agent, intelligent agent, autonomous agent, multi-agent system,
agent framework, agent architecture, agent learning, reinforcement learning agent,
language agent, tool-using agent, agentic ai, agent planning
```

**ArXiv 类别覆盖：**
- ✅ cs.AI（人工智能）
- ✅ cs.LG（机器学习）
- ✅ cs.RO（机器人学，智能体相关）

**建议：**
- 这是一个**热门领域**，论文较多
- 可以作为**独立分类**添加
- 与现有的 "Machine Learning" 和 "Robotics" 可能有重叠

### 4. 多模态领域

**现状：**
- ✅ 已存在于默认分类中
- 关键词：multimodal, vision-language, clip, image-text, video-text

**建议：**
- 保持现有配置
- 可以扩展关键词（如果需要）

## 🎯 推荐方案

### 方案 A: 后端分类（推荐用于核心领域）

**适合：**
- AI陪伴领域
- 智能体领域

**原因：**
- 这些是你**长期研究方向**
- 需要**持续跟踪**
- 适合所有用户共享

### 方案 B: 前端自定义分类（推荐用于新兴/小众领域）

**适合：**
- GEO-Generative Engine Optimization

**原因：**
- 新兴领域，论文可能较少
- 可以先测试，灵活调整
- 不影响其他用户

## 📝 具体实施建议

### 建议 1: 修改 config.json 添加核心分类

在 `config.json` 中添加：

```json
{
  "categories": {
    "Computer Vision": { ... },
    "Natural Language Processing": { ... },
    "Machine Learning": { ... },
    "Robotics": { ... },
    "Multimodal": { ... },
    
    "AI Companion": {
      "keywords": [
        "ai companion",
        "virtual companion",
        "emotional ai",
        "affective computing",
        "human-computer interaction",
        "HCI",
        "emotion recognition",
        "emotion detection",
        "psychological ai",
        "mental health ai",
        "conversational ai",
        "empathetic ai",
        "social robot",
        "companion robot",
        "emotional intelligence"
      ]
    },
    
    "AI Agents": {
      "keywords": [
        "ai agent",
        "intelligent agent",
        "autonomous agent",
        "multi-agent system",
        "agent framework",
        "agent architecture",
        "agent learning",
        "reinforcement learning agent",
        "language agent",
        "tool-using agent",
        "agentic ai",
        "agent planning",
        "LLM agent",
        "GPT agent"
      ]
    }
  }
}
```

### 建议 2: 前端自定义分类用于 GEO

在管理界面中添加：
- 分类名称：`GEO - Generative Engine Optimization`
- 关键词：`generative engine optimization, GEO, SEO, search engine optimization, generative ai optimization, LLM optimization, prompt optimization, RAG, retrieval augmented generation`

### 建议 3: 扩展 ArXiv 类别（可选）

如果需要更多 AI陪伴相关论文，可以添加：
```json
{
  "sources": {
    "arxiv": {
      "categories": [
        "cs.AI",
        "cs.CV",
        "cs.CL",
        "cs.LG",
        "cs.IR",
        "cs.RO",
        "cs.HC"  // 新增：人机交互
      ]
    }
  }
}
```

## 🔄 实施步骤

### 步骤 1: 修改 config.json

1. 编辑 `config.json`
2. 添加 "AI Companion" 和 "AI Agents" 分类
3. 可选：添加 cs.HC 类别

### 步骤 2: 重新部署

1. 提交代码到 Git
2. 重新部署 Cloudflare Workers
3. 等待下次定时任务执行（或手动触发）

### 步骤 3: 前端添加 GEO 分类

1. 在管理界面添加 "GEO - Generative Engine Optimization"
2. 配置关键词
3. 立即生效

## 📊 预期效果

### 后端分类（AI Companion + AI Agents）

- ✅ 每天自动抓取和分类
- ✅ 所有用户可见
- ✅ 数据持久化在 KV
- ✅ 跨设备同步

### 前端分类（GEO）

- ✅ 立即生效
- ✅ 灵活调整关键词
- ✅ 不影响其他用户
- ⚠️ 仅当前浏览器有效

## 💡 最终建议

1. **后端添加**：
   - ✅ AI Companion（核心研究方向）
   - ✅ AI Agents（核心研究方向）

2. **前端自定义**：
   - ✅ GEO（新兴领域，先测试）

3. **保持现有**：
   - ✅ Multimodal（已存在，可扩展关键词）

4. **可选优化**：
   - 添加 cs.HC 类别到抓取列表（更多 AI陪伴相关论文）

