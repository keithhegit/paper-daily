# 导出功能说明

## BibTeX 格式 (.bib 文件)

### 什么是 BibTeX？

BibTeX 是一种用于管理学术引用和参考文献的标准格式，广泛用于：
- **LaTeX 文档**：学术论文、书籍、报告
- **引用管理软件**：Zotero, Mendeley, EndNote, JabRef 等
- **学术写作工具**：Overleaf, ShareLaTeX 等

### 如何使用导出的 .bib 文件？

#### 方法 1: 导入到引用管理软件

1. **Zotero**:
   - 打开 Zotero
   - 文件 → 导入
   - 选择 `papers.bib` 文件
   - 论文会自动导入到你的库中

2. **Mendeley**:
   - 打开 Mendeley Desktop
   - 文件 → 添加文件
   - 选择 `papers.bib` 文件

3. **EndNote**:
   - 打开 EndNote
   - 文件 → 导入
   - 选择 BibTeX 格式
   - 导入 `papers.bib` 文件

#### 方法 2: 在 LaTeX 中使用

```latex
\documentclass{article}
\begin{document}

% 引用论文
\cite{paper_id_1}
\cite{paper_id_2}

% 在文档末尾显示参考文献
\bibliography{papers}  % 不需要 .bib 扩展名
\bibliographystyle{plain}

\end{document}
```

### BibTeX 条目格式

导出的文件格式示例：

```bibtex
@article{2311_04671v1,
  title={X-Diffusion: Training Diffusion Policies on Cross-Embodiment Human Demonstrations},
  author={Maximus A. Pace, Prithwish Dan, Chuanruo Ning et al.},
  year={2025},
  journal={arXiv preprint arXiv:2311.04671},
  note={NeurIPS 2025}
}
```

### 字段说明

- `@article`: 条目类型（论文）
- `title`: 论文标题
- `author`: 作者列表
- `year`: 发表年份
- `journal`: 期刊/会议名称
- `note`: 额外信息（如会议名称）

