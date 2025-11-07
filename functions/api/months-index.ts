/**
 * Cloudflare Pages Function: 获取月份索引 API
 * 路径: /api/months-index
 */

export const onRequest = async ({ env, request }: { env: { PAPERS_KV?: KVNamespace }, request: Request }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!env.PAPERS_KV) {
      return new Response(JSON.stringify([]), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // 从 KV 获取月份索引
    const index = await env.PAPERS_KV.get('months:index', 'json');
    
    if (index) {
      return new Response(JSON.stringify(index), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // 如果没有索引，返回空数组
    return new Response(JSON.stringify([]), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in months-index API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch months index' }),
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

