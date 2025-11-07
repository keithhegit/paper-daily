/**
 * 工具函数模块
 */

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  updated: string;
  categories: string[];
  primary_category: string;
  pdf_url: string;
  arxiv_url: string;
  source: string;
  venue: string;
  comment?: string;
  journal_ref?: string;
  conference?: string;
  tags: string[];
}

export interface Config {
  sources: {
    arxiv: {
      enabled: boolean;
      categories: string[];
      max_results: number;
      days_back: number;
    };
  };
  categories: Record<string, { keywords: string[] }>;
  venues: {
    conferences: string[];
    journals: string[];
  };
}

/**
 * 从 journal_ref 字段提取会议/期刊信息
 */
export const extractVenueFromJournalRef = (journalRef: string | null | undefined): string | null => {
  if (!journalRef) return null;
  
  // 确保 journalRef 是字符串
  if (typeof journalRef !== 'string') {
    journalRef = String(journalRef);
  }

  const trimmed = journalRef.trim();
  if (trimmed.length === 0) return null;

  const conferences = [
    'CVPR', 'ICCV', 'ECCV', 'NeurIPS', 'ICML', 'ICLR',
    'ACL', 'EMNLP', 'NAACL', 'AAAI', 'IJCAI', 'KDD',
    'ICRA', 'IROS', 'CoRL', 'RSS', 'ICPR',
    'SIGIR', 'WWW', 'WSDM', 'RecSys',
    'SIGMOD', 'VLDB', 'ICDE',
    'SIGGRAPH', 'ICASSP', 'INTERSPEECH'
  ];

  // 模式1: 提取括号中的会议缩写及周围信息
  const patternWithAcronym = /([^()]*)\s*\(([A-Z]{2,})\s*(?:\d+)?\)\s*,?\s*(\d{4})?/;
  const match = trimmed.match(patternWithAcronym);
  
  if (match) {
    const fullName = match[1].trim();
    const acronym = match[2];
    const year = match[3];

    if (conferences.includes(acronym.toUpperCase())) {
      const result = year ? `${fullName} (${acronym} ${year})` : `${fullName} (${acronym})`;
      if (result.length <= 200) {
        return result;
      }
    }
  }

  // 模式2: 直接返回 journal_ref（如果看起来像期刊/会议名称）
  if (trimmed.length > 3 && trimmed.length <= 200) {
    const keywords = ['conference', 'journal', 'proceedings', 'transactions', 'letters', 'review', 'symposium', 'workshop'];
    if (keywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      return trimmed;
    }
  }

  return null;
};

/**
 * 从 comment 字段提取会议/期刊信息
 */
export const extractVenueFromComment = (comment: string | null | undefined): string | null => {
  if (!comment) return null;
  
  // 确保 comment 是字符串
  if (typeof comment !== 'string') {
    comment = String(comment);
  }

  let processed = comment.trim();

  // 预处理：移除冗余信息
  processed = processed.replace(/\d+\s*pages?[,;]?\s*/gi, '');
  processed = processed.replace(/\d+\s*figures?[,;]?\s*/gi, '');
  processed = processed.replace(/\d+\s*tables?[,;]?\s*/gi, '');
  processed = processed.replace(/\d+\s*appendices[,;]?\s*/gi, '');
  processed = processed.replace(/https?:\/\/[^\s,;]+/gi, '');
  processed = processed.replace(/GitHub\s+link:?\s*/gi, '');
  processed = processed.replace(/\s+/g, ' ').trim();

  // 如果是 preprint，返回 null
  if (processed.toLowerCase().includes('preprint') && !processed.toLowerCase().includes('accepted')) {
    return null;
  }

  const conferences = [
    'CVPR', 'ICCV', 'ECCV', 'NeurIPS', 'ICML', 'ICLR',
    'ACL', 'EMNLP', 'NAACL', 'AAAI', 'IJCAI', 'KDD',
    'ICRA', 'IROS', 'CoRL', 'RSS',
    'SIGIR', 'WWW', 'WSDM', 'RecSys',
    'SIGMOD', 'VLDB', 'ICDE',
    'SIGGRAPH', 'ICASSP', 'INTERSPEECH'
  ];

  const journals = [
    'Nature', 'Science', 'PAMI', 'TPAMI', 'JMLR', 'IJCV',
    'IEEE', 'ACM', 'Transactions', 'Journal'
  ];

  // 模式1: "Accepted at/to CVPR 2025" 或 "Published in ICCV 2025"
  const pattern1 = /(?:accepted?\s+(?:at\s+(?:the\s+)?|to\s+(?:the\s+)?|by\s+(?:the\s+)?|for\s+(?:the\s+)?)|published\s+(?:in\s+(?:the\s+)?|at\s+(?:the\s+)?|with\s+)|to\s+appear\s+(?:in\s+(?:the\s+)?|at\s+(?:the\s+)?))\s*(.+?)(?:[.,;]|$)/i;
  const match1 = processed.match(pattern1);
  if (match1) {
    let venueText = match1[1].trim().replace(/\s+/g, ' ');
    venueText = venueText.replace(/,\s*[A-Z][a-zA-Z\s,]+,\s*[A-Z]{2,}(?:\s*,\s*[A-Z]{2,4})?$/, '');
    if (venueText.length > 5 && venueText.length <= 200) {
      return venueText;
    }
  }

  // 模式2: 直接以会议名开头
  for (const conf of conferences) {
    const pattern = new RegExp(`\\b(${conf}\\s+\\d{4}(?:\\s*[,\\-]\\s*[\\w\\s]+)?)`, 'i');
    const match = processed.match(pattern);
    if (match) {
      let venueText = match[1].trim();
      if (venueText.includes(',') || venueText.includes('-')) {
        const yearMatch = venueText.match(new RegExp(`${conf}\\s+\\d{4}`, 'i'));
        if (yearMatch) {
          venueText = yearMatch[0];
        }
      }
      return venueText;
    }
  }

  // 模式3: 只有会议名和年份
  for (const conf of conferences) {
    const pattern = new RegExp(`\\b${conf}\\s*[:']?\\s*(\\d{4})\\b`, 'i');
    const match = processed.match(pattern);
    if (match) {
      return `${conf} ${match[1]}`;
    }
  }

  // 模式4: 只有会议名
  for (const conf of conferences) {
    if (new RegExp(`\\b${conf}\\b`, 'i').test(processed)) {
      return conf;
    }
  }

  // 检查期刊
  for (const journal of journals) {
    if (processed.toLowerCase().includes(journal.toLowerCase())) {
      const firstSentence = processed.split('.')[0].trim();
      if (firstSentence.length <= 80) {
        return firstSentence;
      }
      return processed.substring(0, 80).trim() + '...';
    }
  }

  return null;
};

/**
 * 根据关键词分类论文
 */
export const classifyPaper = (paper: Paper, config: Config): string[] => {
  const tags = new Set<string>();
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();

  for (const [categoryName, categoryInfo] of Object.entries(config.categories)) {
    const keywords = categoryInfo.keywords || [];
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        tags.add(categoryName);
        break;
      }
    }
  }

  return Array.from(tags);
};

/**
 * 格式化作者列表
 */
export const formatAuthors = (authors: string[], maxAuthors: number = 5): string => {
  if (authors.length <= maxAuthors) {
    return authors.join(', ');
  }
  return authors.slice(0, maxAuthors).join(', ') + ' et al.';
};

/**
 * 去重论文（根据 ID）
 */
export const deduplicatePapers = (papers: Paper[]): Paper[] => {
  const seen = new Set<string>();
  const unique: Paper[] = [];

  for (const paper of papers) {
    if (paper.id && !seen.has(paper.id)) {
      seen.add(paper.id);
      unique.push(paper);
    }
  }

  return unique;
};

/**
 * 按日期排序论文
 */
export const sortPapersByDate = (papers: Paper[], descending: boolean = true): Paper[] => {
  return [...papers].sort((a, b) => {
    const dateA = new Date(a.published).getTime();
    const dateB = new Date(b.published).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
};

/**
 * 按月份分组论文
 */
export const groupPapersByMonth = (papers: Paper[]): Record<string, Paper[]> => {
  const grouped: Record<string, Paper[]> = {};

  for (const paper of papers) {
    const yearMonth = paper.published.substring(0, 7); // "2025-10"
    if (!grouped[yearMonth]) {
      grouped[yearMonth] = [];
    }
    grouped[yearMonth].push(paper);
  }

  return grouped;
};

