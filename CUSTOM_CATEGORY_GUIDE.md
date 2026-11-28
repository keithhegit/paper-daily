# 自定义分类使用指南

## 问题排查：为什么分类显示数量为 0？

如果你添加了自定义分类但显示数量为 0，请检查以下几点：

### ✅ 检查清单

1. **是否配置了关键词？**
   - 添加分类后，必须为分类配置关键词
   - 关键词用于匹配论文的标题和摘要
   - 如果没有关键词，系统无法匹配任何论文

2. **关键词是否正确？**
   - 关键词是**不区分大小写**的
   - 系统会在论文的**标题和摘要**中搜索关键词
   - 关键词必须是**完整的单词或短语**（子字符串匹配）

3. **是否保存了关键词？**
   - 输入关键词后，必须点击"保存"按钮
   - 或者按 Enter 键保存
   - 保存成功后会显示"✓ 已保存"提示

4. **数据是否已加载？**
   - 确保论文数据已加载完成
   - 查看浏览器控制台是否有错误信息

## 📝 使用步骤

### 步骤 1: 添加分类
1. 点击"研究领域"旁的"⚙️ 管理"按钮
2. 输入分类名称（如 "Reinforcement Learning"）
3. 点击"+ 添加分类"

### 步骤 2: 配置关键词（重要！）
1. 在分类下方的"关键词"输入框中输入关键词
2. **多个关键词用逗号分隔**
3. 例如：`reinforcement learning, RL, Q-learning, policy gradient, DQN`
4. 点击"保存"按钮或按 Enter 键

### 步骤 3: 验证
1. 关闭管理界面
2. 查看分类按钮，应该显示匹配的论文数量
3. 如果仍为 0，检查关键词是否在论文中出现

## 💡 关键词配置技巧

### 好的关键词示例

**Reinforcement Learning 分类：**
```
reinforcement learning, RL, Q-learning, policy gradient, DQN, PPO, actor-critic, reward, agent
```

**Computer Vision 分类：**
```
computer vision, image recognition, object detection, segmentation, CNN, ResNet, YOLO
```

**Natural Language Processing 分类：**
```
NLP, natural language processing, transformer, BERT, GPT, language model, text generation
```

### 关键词选择建议

1. **使用常见术语**：使用该领域常用的英文术语
2. **包含缩写**：如 "RL" 代表 "Reinforcement Learning"
3. **包含技术名称**：如 "DQN", "PPO", "BERT" 等
4. **包含相关概念**：如 "reward", "agent", "policy" 等

### 测试关键词

如果想测试关键词是否有效：

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页
3. 保存关键词后，会显示匹配的论文信息
4. 例如：`Matched paper "X-Diffusion: Training..." to category "test"`

## 🔍 调试方法

### 方法 1: 查看控制台日志

打开浏览器控制台（F12），查看以下信息：
- `Applying custom category tags...` - 显示所有自定义分类
- `Matched paper "..." to category "..."` - 显示匹配的论文
- `Applied custom tags: X matches found` - 显示总匹配数

### 方法 2: 检查关键词配置

1. 打开管理界面
2. 查看每个分类的关键词是否正确保存
3. 确保关键词不为空

### 方法 3: 测试单个关键词

1. 先配置一个简单的关键词（如 "test"）
2. 查看是否有论文匹配
3. 如果没有，尝试更具体的关键词

## ⚠️ 常见问题

### Q: 为什么配置了关键词还是 0？

**A:** 可能的原因：
1. 关键词在论文中不存在
2. 关键词拼写错误
3. 关键词太具体，没有论文包含
4. 数据还未加载完成

**解决方案：**
- 使用更通用的关键词
- 检查论文标题和摘要中实际使用的术语
- 查看控制台日志确认匹配情况

### Q: 如何知道哪些关键词有效？

**A:** 
1. 查看控制台日志中的匹配信息
2. 或者先搜索论文，看看标题和摘要中使用了哪些术语
3. 使用这些术语作为关键词

### Q: 可以添加中文关键词吗？

**A:** 可以，但建议使用英文关键词，因为：
- ArXiv 论文主要是英文
- 英文关键词匹配更准确
- 如果论文中有中文，中文关键词也可以匹配

## 📊 示例：配置 "Reinforcement Learning" 分类

1. **添加分类**：输入 "Reinforcement Learning"，点击添加

2. **配置关键词**：
   ```
   reinforcement learning, RL, Q-learning, policy gradient, DQN, PPO, actor-critic, reward, agent, MDP, value function
   ```

3. **保存**：点击"保存"按钮

4. **查看结果**：分类按钮应该显示匹配的论文数量

## 🎯 最佳实践

1. **关键词要全面**：包含该领域的各种术语和缩写
2. **定期更新**：根据新论文调整关键词
3. **测试验证**：添加关键词后查看控制台确认匹配
4. **避免重复**：不要与默认分类的关键词重复

