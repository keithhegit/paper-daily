/**
 * Cloudflare Pages Function: 获取论文数据 API
 * 路径: /api/fetch-papers
 */

import { fetchArXivPapers } from '../../src/arxiv';
import { deduplicatePapers, sortPapersByDate } from '../../src/utils';
import config from '../../config.json';

export const onRequest = async ({ env, request }: { env: { PAPERS_KV?: KVNamespace }, request: Request }) => {
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const month = url.searchParams.get('month'); // 可选：获取指定月份的数据

    // 如果指定了月份，从 KV 获取该月数据
    if (month && env.PAPERS_KV) {
      const monthData = await env.PAPERS_KV.get(`papers:${month}`, 'json');
      if (monthData) {
        return new Response(JSON.stringify(monthData), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // 如果没有指定月份或 KV 中没有数据，尝试从 KV 获取所有数据
    if (env.PAPERS_KV) {
      const allData = await env.PAPERS_KV.get('papers:all', 'json');
      if (allData) {
        // 如果请求了特定月份，过滤数据
        if (month && month !== 'all') {
          const filtered = (allData as any[]).filter(
            (p: any) => p.published?.startsWith(month)
          );
          return new Response(JSON.stringify(filtered), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          });
        }
        return new Response(JSON.stringify(allData), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // 如果 KV 中没有数据，实时抓取（仅用于开发/测试，生产环境应该依赖定时任务）
    console.log('No cached data found, fetching from ArXiv...');
    const papers = await fetchArXivPapers(config as any);
    const uniquePapers = deduplicatePapers(papers);
    const sortedPapers = sortPapersByDate(uniquePapers);

    return new Response(JSON.stringify(sortedPapers), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-papers API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch papers', message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

