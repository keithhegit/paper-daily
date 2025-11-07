# 后端抓取 vs 前端自定义分类 - 架构说明

## 🔍 核心问题解答

### Q: 后端是按照哪5类来抓取 ArXiv 的吗？

**A: 是的！** 后端抓取逻辑基于 `config.json` 中的配置，**不会**因为前端的自定义分类而改变。

### Q: 自定义分类会影响后端每天抓取吗？

**A: 不会！** 自定义分类只影响前端筛选，**不会**影响后端的抓取逻辑。

---

## 📊 架构说明

### 后端抓取流程（Cloudflare Workers）

```
每天 UTC 0:00 执行定时任务
    ↓
读取 config.json
    ↓
从 ArXiv 抓取论文（基于 categories: cs.AI, cs.CV, cs.CL 等）
    ↓
使用 config.json 中的关键词分类论文
    ↓
保存到 Cloudflare KV
```

**关键点：**
- ✅ 抓取哪些 ArXiv 类别：由 `config.json` 的 `sources.arxiv.categories` 决定
- ✅ 如何分类论文：由 `config.json` 的 `categories` 中的关键词决定
- ❌ **不会**读取前端的自定义分类
- ❌ **不会**因为自定义分类而改变抓取范围

### 前端自定义分类流程

```
用户添加自定义分类（存储在 localStorage）
    ↓
用户配置关键词
    ↓
前端加载论文数据
    ↓
基于自定义分类的关键词动态匹配论文
    ↓
为匹配的论文添加标签
    ↓
显示在筛选按钮中
```

**关键点：**
- ✅ 只存在于浏览器 localStorage
- ✅ 只影响前端筛选和显示
- ✅ 基于已抓取的论文进行匹配
- ❌ **不会**影响后端抓取
- ❌ **不会**改变后端分类逻辑

---

## 🎯 当前实现

### 后端分类（config.json）

```json
{
  "categories": {
    "Computer Vision": {
      "keywords": ["computer vision", "image processing", ...]
    },
    "Natural Language Processing": {
      "keywords": ["natural language processing", "language model", ...]
    },
    "Machine Learning": {
      "keywords": ["machine learning", "deep learning", ...]
    },
    "Robotics": {
      "keywords": ["robotics", "autonomous", ...]
    },
    "Multimodal": {
      "keywords": ["multimodal", "vision-language", ...]
    }
  }
}
```

**这些分类：**
- ✅ 在后端抓取时应用
- ✅ 论文的 `tags` 字段包含这些分类
- ✅ 存储在 KV 中

### 前端自定义分类（localStorage）

```javascript
[
  {
    name: "Reinforcement Learning",
    keywords: ["reinforcement learning", "RL", "Q-learning"]
  }
]
```

**这些分类：**
- ✅ 只在前端应用
- ✅ 基于已抓取的论文进行匹配
- ✅ 不会影响后端抓取

---

## 🔄 数据流程

### 场景 1: 默认分类（如 "Machine Learning"）

```
1. 后端抓取论文
   ↓
2. 检查论文标题/摘要是否包含 "machine learning", "deep learning" 等
   ↓
3. 如果包含，添加 "Machine Learning" 标签
   ↓
4. 保存到 KV（tags 字段包含 "Machine Learning"）
   ↓
5. 前端加载数据，直接显示
```

### 场景 2: 自定义分类（如 "Reinforcement Learning"）

```
1. 后端抓取论文（不包含 "Reinforcement Learning" 标签）
   ↓
2. 保存到 KV（tags 字段不包含 "Reinforcement Learning"）
   ↓
3. 前端加载数据
   ↓
4. 前端检查论文标题/摘要是否包含 "reinforcement learning", "RL" 等
   ↓
5. 如果包含，添加 "Reinforcement Learning" 标签（仅在前端）
   ↓
6. 显示在筛选按钮中
```

---

## ⚠️ 重要区别

| 特性 | 后端分类（config.json） | 前端自定义分类（localStorage） |
|------|------------------------|------------------------------|
| **存储位置** | config.json + KV | 浏览器 localStorage |
| **应用时机** | 抓取时 | 加载时 |
| **影响范围** | 所有用户 | 仅当前浏览器 |
| **数据持久化** | 是（KV） | 是（localStorage） |
| **影响抓取** | ✅ 是 | ❌ 否 |
| **跨设备同步** | ✅ 是 | ❌ 否 |

---

## 💡 如果需要让自定义分类影响后端抓取

### 方案 A: 手动修改 config.json（简单）

1. 编辑 `config.json`
2. 在 `categories` 中添加新分类
3. 重新部署
4. 等待下次定时任务执行

**优点：** 简单直接  
**缺点：** 需要重新部署，影响所有用户

### 方案 B: 后端支持动态分类（复杂）

需要实现：
1. API 端点管理自定义分类（存储在 KV）
2. 修改抓取逻辑，读取自定义分类
3. 在抓取时应用自定义分类

**优点：** 灵活，支持多用户  
**缺点：** 需要大量开发工作

---

## 🎯 推荐方案

**当前架构已经足够好：**

1. **后端分类**：用于核心领域，所有用户共享
2. **前端自定义分类**：用于个人兴趣，灵活配置

**为什么这样设计？**
- ✅ 后端分类稳定，适合核心领域
- ✅ 前端分类灵活，适合个人需求
- ✅ 不需要修改后端代码
- ✅ 每个用户可以有不同分类

---

## 📝 总结

### 回答你的问题：

1. **后端是按照哪5类来抓取的吗？**
   - ✅ 是的，基于 `config.json` 中的 5 个默认分类

2. **自定义分类会影响后端抓取吗？**
   - ❌ 不会，自定义分类只影响前端筛选

3. **自定义分类会每天拉取新增领域吗？**
   - ❌ 不会，自定义分类只是在前端匹配已抓取的论文

### 工作流程：

```
后端（每天执行）：
  - 抓取 ArXiv 论文（基于 config.json）
  - 使用默认分类关键词分类
  - 保存到 KV

前端（用户访问时）：
  - 从 KV 加载论文
  - 应用自定义分类关键词匹配
  - 显示筛选结果
```

---

## 🔧 如果需要修改后端分类

编辑 `config.json`，然后重新部署：

```json
{
  "categories": {
    "Computer Vision": { ... },
    "Natural Language Processing": { ... },
    "Machine Learning": { ... },
    "Robotics": { ... },
    "Multimodal": { ... },
    "Reinforcement Learning": {  // 新增
      "keywords": [
        "reinforcement learning",
        "RL",
        "Q-learning",
        "policy gradient"
      ]
    }
  }
}
```

然后重新部署 Cloudflare Workers，下次定时任务会使用新配置。

