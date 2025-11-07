/**
 * ArXiv API 客户端
 */

import { XMLParser } from 'fast-xml-parser';
import type { Paper, Config } from './utils';
import { extractVenueFromJournalRef, extractVenueFromComment, classifyPaper } from './utils';

// 使用全局 fetch（Node.js 18+ 和 Cloudflare Workers 都支持）

interface ArXivEntry {
  id: string;
  title: string;
  author: { name: string } | { name: string }[];
  summary: string;
  published: string;
  updated: string;
  category: { '@_term': string } | { '@_term': string }[];
  link: { '@_href': string; '@_rel': string; '@_type': string } | { '@_href': string; '@_rel': string; '@_type': string }[];
  'arxiv:comment'?: string;
  'arxiv:journal_ref'?: string;
}

interface ArXivResponse {
  feed: {
    entry: ArXivEntry | ArXivEntry[];
    'opensearch:totalResults': { '#text': string };
  };
}

/**
 * 从 ArXiv API 抓取论文
 */
export const fetchArXivPapers = async (config: Config): Promise<Paper[]> => {
  const arxivConfig = config.sources.arxiv;
  if (!arxivConfig.enabled) {
    return [];
  }

  const papers: Paper[] = [];
  const categories = arxivConfig.categories;
  const maxResults = arxivConfig.max_results;
  const daysBack = arxivConfig.days_back;

  // 计算时间范围
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  for (const category of categories) {
    try {
      // 构建 ArXiv API 查询 URL
      const searchQuery = `cat:${category}`;
      const url = new URL('http://export.arxiv.org/api/query');
      url.searchParams.set('search_query', searchQuery);
      url.searchParams.set('start', '0');
      url.searchParams.set('max_results', maxResults.toString());
      url.searchParams.set('sortBy', 'submittedDate');
      url.searchParams.set('sortOrder', 'descending');

      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(`Failed to fetch ${category}: ${response.statusText}`);
        continue;
      }

      const xmlText = await response.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
      });

      const data = parser.parse(xmlText) as ArXivResponse;
      const entries = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];

      let count = 0;
      for (const entry of entries) {
        // 检查发布时间
        const paperDate = new Date(entry.updated || entry.published);
        if (paperDate < startDate) {
          continue;
        }

        // 提取作者
        const authors = Array.isArray(entry.author)
          ? entry.author.map(a => a.name)
          : [entry.author.name];

        // 提取类别
        const categories = Array.isArray(entry.category)
          ? entry.category.map(c => c['@_term'])
          : [entry.category['@_term']];

        const primaryCategory = categories[0] || category;

        // 提取链接
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        const pdfLink = links.find(l => l['@_rel'] === 'related' && l['@_type'] === 'application/pdf');
        const absLink = links.find(l => l['@_rel'] === 'alternate');

        // 提取论文 ID
        const arxivId = entry.id.split('/').pop() || entry.id.split('/').slice(-1)[0];

        // 提取会议/期刊信息
        const journalRef = entry['arxiv:journal_ref'];
        const comment = entry['arxiv:comment'];
        // 确保是字符串或 null/undefined
        const journalRefStr = journalRef ? String(journalRef) : null;
        const commentStr = comment ? String(comment) : null;
        const conference = extractVenueFromJournalRef(journalRefStr) || extractVenueFromComment(commentStr);

        // 构建论文对象
        const paper: Paper = {
          id: arxivId,
          title: entry.title.trim().replace(/\s+/g, ' '),
          authors,
          abstract: entry.summary.trim().replace(/\s+/g, ' '),
          published: new Date(entry.published).toISOString().split('T')[0],
          updated: new Date(entry.updated).toISOString().split('T')[0],
          categories,
          primary_category: primaryCategory,
          pdf_url: pdfLink?.['@_href'] || `https://arxiv.org/pdf/${arxivId}.pdf`,
          arxiv_url: absLink?.['@_href'] || `https://arxiv.org/abs/${arxivId}`,
          source: 'ArXiv',
          venue: category,
          comment: commentStr || undefined,
          journal_ref: journalRefStr || undefined,
          conference: conference || undefined,
          tags: [], // 将在后面分类
        };

        // 分类论文
        paper.tags = classifyPaper(paper, config);

        papers.push(paper);
        count++;
      }

      console.log(`Fetched ${count} papers from ${category} (date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      continue;
    }
  }

  console.log(`Total fetched ${papers.length} papers from ArXiv`);
  return papers;
};

