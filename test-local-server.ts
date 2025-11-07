/**
 * 本地测试服务器
 * 模拟 Cloudflare Pages Functions，用于测试前端
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

const PORT = 8788;
const TEST_DATA_DIR = path.join(__dirname, 'test-output');

// 读取测试数据
const readTestData = (filename: string): any => {
  const filePath = path.join(TEST_DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }
  return null;
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API 路由
  if (pathname === '/api/months-index') {
    const index = readTestData('months-index.json');
    if (index) {
      res.writeHead(200);
      res.end(JSON.stringify(index));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Months index not found. Please run test-local.ts first.' }));
    }
    return;
  }

  if (pathname === '/api/fetch-papers') {
    const month = url.searchParams.get('month');
    
    if (month && month !== 'all') {
      // 获取指定月份的数据
      const monthData = readTestData(`papers-${month}.json`);
      if (monthData) {
        res.writeHead(200);
        res.end(JSON.stringify(monthData));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: `Data for month ${month} not found` }));
      }
    } else {
      // 获取所有数据
      const allData = readTestData('papers-all.json');
      if (allData) {
        res.writeHead(200);
        res.end(JSON.stringify(allData));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Papers data not found. Please run test-local.ts first.' }));
      }
    }
    return;
  }

  // 静态文件服务（用于前端页面）
  if (pathname === '/' || pathname === '/index.html') {
    const indexPath = path.join(__dirname, 'docs', 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.writeHead(200);
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('index.html not found');
    }
    return;
  }

  // CSS 文件
  if (pathname.startsWith('/css/')) {
    const filePath = path.join(__dirname, 'docs', pathname);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/css');
      res.writeHead(200);
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('CSS file not found');
    }
    return;
  }

  // JS 文件
  if (pathname.startsWith('/js/')) {
    const filePath = path.join(__dirname, 'docs', pathname);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('JS file not found');
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 本地测试服务器已启动');
  console.log('='.repeat(60));
  console.log(`\n📍 访问地址:`);
  console.log(`   - 前端页面: http://localhost:${PORT}/`);
  console.log(`   - API 端点: http://localhost:${PORT}/api/fetch-papers`);
  console.log(`   - 月份索引: http://localhost:${PORT}/api/months-index`);
  console.log(`\n💡 提示:`);
  console.log(`   - 确保已运行 'npm run test:fetch' 生成测试数据`);
  console.log(`   - 按 Ctrl+C 停止服务器\n`);
});

