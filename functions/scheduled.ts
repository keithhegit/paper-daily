/**
 * Cloudflare Scheduled Worker: 定时抓取论文并更新 KV
 * 每天 UTC 0:00 执行
 */

import { fetchArXivPapers } from '../src/arxiv';
import { deduplicatePapers, sortPapersByDate, groupPapersByMonth } from '../src/utils';
import config from '../config.json';

export interface Env {
  PAPERS_KV: KVNamespace;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Scheduled task started at:', new Date().toISOString());

    try {
      // 抓取论文
      const papers = await fetchArXivPapers(config as any);
      console.log(`Fetched ${papers.length} papers from ArXiv`);

      // 去重
      const uniquePapers = deduplicatePapers(papers);
      console.log(`After deduplication: ${uniquePapers.length} papers`);

      // 从 KV 获取已有数据
      let existingPapers: any[] = [];
      if (env.PAPERS_KV) {
        const existing = await env.PAPERS_KV.get('papers:all', 'json');
        if (existing && Array.isArray(existing)) {
          existingPapers = existing;
        }
      }

      // 合并数据（新论文在前）
      const existingIds = new Set(existingPapers.map((p: any) => p.id));
      const newPapers = uniquePapers.filter(p => !existingIds.has(p.id));
      const allPapers = [...newPapers, ...existingPapers];

      // 按日期排序
      const sortedPapers = sortPapersByDate(allPapers, true);

      // 按月份分组
      const papersByMonth = groupPapersByMonth(sortedPapers);

      // 保存到 KV
      if (env.PAPERS_KV) {
        // 保存所有论文
        await env.PAPERS_KV.put('papers:all', JSON.stringify(sortedPapers));

        // 保存各月份数据
        const monthsIndex: Array<{ month: string; count: number; published_count: number; preprint_count: number }> = [];
        
        for (const [month, monthPapers] of Object.entries(papersByMonth)) {
          await env.PAPERS_KV.put(`papers:${month}`, JSON.stringify(monthPapers));
          
          const publishedCount = monthPapers.filter(p => p.conference).length;
          const preprintCount = monthPapers.length - publishedCount;
          
          monthsIndex.push({
            month,
            count: monthPapers.length,
            published_count: publishedCount,
            preprint_count: preprintCount,
          });
        }

        // 保存月份索引（按日期倒序）
        monthsIndex.sort((a, b) => b.month.localeCompare(a.month));
        await env.PAPERS_KV.put('months:index', JSON.stringify(monthsIndex));

        console.log(`Saved ${sortedPapers.length} total papers to KV`);
        console.log(`Saved ${Object.keys(papersByMonth).length} months of data`);
        console.log(`Added ${newPapers.length} new papers`);
      } else {
        console.warn('PAPERS_KV not configured, skipping KV storage');
      }

      console.log('Scheduled task completed successfully');
    } catch (error) {
      console.error('Error in scheduled task:', error);
      throw error;
    }
  },
};

