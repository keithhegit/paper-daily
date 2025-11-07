/**
 * 本地测试脚本
 * 用于测试 ArXiv 抓取功能
 */

import { fetchArXivPapers } from './arxiv';
import { deduplicatePapers, sortPapersByDate, groupPapersByMonth } from './utils';
import * as fs from 'fs';
import * as path from 'path';

// 读取配置文件
const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const runTest = async () => {
  console.log('='.repeat(60));
  console.log('开始本地测试 ArXiv 抓取功能');
  console.log('='.repeat(60));

  try {
    // 1. 测试抓取论文
    console.log('\n📚 步骤 1: 从 ArXiv 抓取论文...');
    const papers = await fetchArXivPapers(config);
    console.log(`✅ 成功抓取 ${papers.length} 篇论文`);

    if (papers.length === 0) {
      console.warn('⚠️  未抓取到任何论文，请检查配置和网络连接');
      return;
    }

    // 2. 去重
    console.log('\n🔄 步骤 2: 去重处理...');
    const uniquePapers = deduplicatePapers(papers);
    console.log(`✅ 去重后剩余 ${uniquePapers.length} 篇论文`);

    // 3. 排序
    console.log('\n📅 步骤 3: 按日期排序...');
    const sortedPapers = sortPapersByDate(uniquePapers, true);
    console.log(`✅ 排序完成`);

    // 4. 按月份分组
    console.log('\n📊 步骤 4: 按月份分组...');
    const papersByMonth = groupPapersByMonth(sortedPapers);
    console.log(`✅ 分为 ${Object.keys(papersByMonth).length} 个月份`);

    // 显示统计信息
    console.log('\n📈 统计信息:');
    console.log(`- 总论文数: ${sortedPapers.length}`);
    console.log(`- 已发表: ${sortedPapers.filter(p => p.conference).length}`);
    console.log(`- 预印本: ${sortedPapers.filter(p => !p.conference).length}`);
    
    // 分类统计
    const categoryStats: Record<string, number> = {};
    sortedPapers.forEach(paper => {
      paper.tags.forEach(tag => {
        categoryStats[tag] = (categoryStats[tag] || 0) + 1;
      });
    });
    console.log('\n📂 分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });

    // 月份统计
    console.log('\n📅 月份分布:');
    Object.entries(papersByMonth)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .forEach(([month, monthPapers]) => {
        const published = monthPapers.filter(p => p.conference).length;
        const preprint = monthPapers.length - published;
        console.log(`  - ${month}: ${monthPapers.length} 篇 (已发表: ${published}, 预印本: ${preprint})`);
      });

    // 5. 保存测试数据
    console.log('\n💾 步骤 5: 保存测试数据...');
    const outputDir = path.join(__dirname, '..', 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存所有论文
    const allPapersPath = path.join(outputDir, 'papers-all.json');
    fs.writeFileSync(allPapersPath, JSON.stringify(sortedPapers, null, 2), 'utf-8');
    console.log(`✅ 已保存到: ${allPapersPath}`);

    // 保存各月份数据
    const monthsIndex: Array<{ month: string; count: number; published_count: number; preprint_count: number }> = [];
    for (const [month, monthPapers] of Object.entries(papersByMonth)) {
      const monthPath = path.join(outputDir, `papers-${month}.json`);
      fs.writeFileSync(monthPath, JSON.stringify(monthPapers, null, 2), 'utf-8');
      
      const publishedCount = monthPapers.filter(p => p.conference).length;
      const preprintCount = monthPapers.length - publishedCount;
      
      monthsIndex.push({
        month,
        count: monthPapers.length,
        published_count: publishedCount,
        preprint_count: preprintCount,
      });
    }

    // 保存月份索引
    monthsIndex.sort((a, b) => b.month.localeCompare(a.month));
    const indexPath = path.join(outputDir, 'months-index.json');
    fs.writeFileSync(indexPath, JSON.stringify(monthsIndex, null, 2), 'utf-8');
    console.log(`✅ 已保存月份索引到: ${indexPath}`);

    // 显示示例论文
    console.log('\n📄 示例论文（前 3 篇）:');
    sortedPapers.slice(0, 3).forEach((paper, index) => {
      console.log(`\n${index + 1}. ${paper.title}`);
      console.log(`   作者: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''}`);
      console.log(`   日期: ${paper.published}`);
      console.log(`   类别: ${paper.primary_category}`);
      console.log(`   标签: ${paper.tags.join(', ') || '无'}`);
      if (paper.conference) {
        console.log(`   会议: ${paper.conference}`);
      }
      console.log(`   URL: ${paper.arxiv_url}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));
    console.log(`\n测试数据已保存到: ${outputDir}`);
    console.log('你可以查看生成的 JSON 文件来验证数据格式。\n');

  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error(error);
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      console.error('堆栈:', error.stack);
    }
    process.exit(1);
  }
};

// 运行测试
runTest();

