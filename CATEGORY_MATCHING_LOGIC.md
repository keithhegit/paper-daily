# 分类匹配逻辑说明

## 📊 当前实现

### 匹配范围

**5个默认分类的匹配逻辑：**

```typescript
// src/utils.ts - classifyPaper 函数
const text = `${paper.title} ${paper.abstract}`.toLowerCase();
```

**答案：不是只匹配 Abstract，而是匹配 标题 + 摘要**

### 详细说明

1. **匹配文本**：`标题 + 摘要`（合并后的文本）
2. **匹配方式**：不区分大小写的子字符串匹配
3. **匹配位置**：在合并后的文本中搜索关键词

### 代码实现

```typescript
export const classifyPaper = (paper: Paper, config: Config): string[] => {
  const tags = new Set<string>();
  
  // 合并标题和摘要
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  
  // 遍历所有分类
  for (const [categoryName, categoryInfo] of Object.entries(config.categories)) {
    const keywords = categoryInfo.keywords || [];
    
    // 检查是否包含任一关键词
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        tags.add(categoryName);
        break; // 找到一个关键词就停止
      }
    }
  }
  
  return Array.from(tags);
};
```

## 🔍 匹配示例

### 示例 1: Computer Vision 分类

**关键词配置：**
```json
"Computer Vision": {
  "keywords": [
    "computer vision",
    "image processing",
    "object detection",
    "image segmentation"
  ]
}
```

**论文示例：**
- 标题：`"Deep Learning for Image Recognition"`
- 摘要：`"We propose a novel method for computer vision tasks..."`

**匹配过程：**
```
合并文本 = "deep learning for image recognition we propose a novel method for computer vision tasks..."
         ↓
检查是否包含 "computer vision" → ✅ 是
         ↓
添加标签：["Computer Vision"]
```

### 示例 2: Machine Learning 分类

**关键词配置：**
```json
"Machine Learning": {
  "keywords": [
    "machine learning",
    "deep learning",
    "neural network"
  ]
}
```

**论文示例：**
- 标题：`"A New Neural Network Architecture"`
- 摘要：`"This paper introduces a novel approach..."`

**匹配过程：**
```
合并文本 = "a new neural network architecture this paper introduces a novel approach..."
         ↓
检查是否包含 "neural network" → ✅ 是
         ↓
添加标签：["Machine Learning"]
```

## 📋 匹配规则

### 规则 1: 匹配范围
- ✅ **标题**：完整匹配
- ✅ **摘要**：完整匹配
- ❌ **作者**：不匹配
- ❌ **会议信息**：不匹配

### 规则 2: 匹配方式
- **不区分大小写**：`"Machine Learning"` 和 `"machine learning"` 等价
- **子字符串匹配**：`"deep learning"` 可以匹配 `"deep learning model"`
- **顺序无关**：关键词在文本中的位置不影响匹配

### 规则 3: 多分类匹配
- 一篇论文可以属于**多个分类**
- 只要标题或摘要中包含任一分类的关键词，就会添加该分类标签

### 规则 4: 关键词优先级
- 使用 `break` 语句，找到第一个匹配的关键词就停止
- 这意味着如果配置了多个关键词，只要匹配到第一个就会添加标签

## 🎯 实际匹配情况

### 当前配置的关键词

**Computer Vision (13篇):**
- 关键词：computer vision, image processing, object detection, image segmentation, face recognition, video analysis, 3d reconstruction, pose estimation, visual recognition, image generation

**NLP (153篇):**
- 关键词：natural language processing, language model, transformer, bert, gpt, machine translation, text generation, question answering, sentiment analysis, named entity recognition

**Machine Learning (125篇):**
- 关键词：machine learning, deep learning, neural network, reinforcement learning, transfer learning, few-shot learning, meta-learning, optimization, generative model, contrastive learning

**Robotics (115篇):**
- 关键词：robotics, autonomous, robot learning, manipulation, navigation, control

**Multimodal (37篇):**
- 关键词：multimodal, vision-language, clip, image-text, video-text

## ⚠️ 注意事项

### 1. 一篇论文可能属于多个分类

例如：
- 标题：`"Vision-Language Models for Robotics"`
- 可能匹配：Computer Vision, NLP, Robotics, Multimodal

### 2. 关键词匹配是精确的子字符串匹配

- ✅ `"deep learning"` 可以匹配 `"deep learning model"`
- ❌ `"deep learning"` 不能匹配 `"deeplearn"`（缺少空格）
- ✅ `"RL"` 可以匹配 `"RL algorithm"` 或 `"using RL"`

### 3. 关键词顺序不影响匹配

- `"machine learning"` 和 `"learning machine"` 是不同的关键词
- 如果配置了 `"machine learning"`，只有文本中包含完整短语才会匹配

## 🔧 如何优化匹配

### 建议 1: 添加更多关键词变体

```json
"Machine Learning": {
  "keywords": [
    "machine learning",
    "ML",  // 缩写
    "deep learning",
    "DL",  // 缩写
    "neural network",
    "neural networks",  // 复数形式
    "neural net",
    "NN"  // 缩写
  ]
}
```

### 建议 2: 使用更通用的术语

```json
"Computer Vision": {
  "keywords": [
    "computer vision",
    "CV",  // 缩写
    "visual",
    "image",
    "vision"
  ]
}
```

### 建议 3: 考虑同义词

```json
"Natural Language Processing": {
  "keywords": [
    "natural language processing",
    "NLP",
    "language model",
    "text",
    "language"
  ]
}
```

## 📊 匹配统计

根据你提供的数据：
- Computer Vision: 13篇
- NLP: 153篇
- Machine Learning: 125篇
- Robotics: 115篇
- Multimodal: 37篇

**总计：443篇**（可能有重叠，因为一篇论文可以属于多个分类）

## 💡 总结

**回答你的问题：**

❌ **不是只匹配 Abstract**

✅ **匹配范围：标题 + 摘要**

✅ **匹配方式：不区分大小写的子字符串匹配**

✅ **匹配时机：后端抓取时（在 `src/arxiv.ts` 中调用 `classifyPaper`）**

