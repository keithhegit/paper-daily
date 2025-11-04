// 筛选、搜索、排序和懒加载功能
document.addEventListener('DOMContentLoaded', function() {
    const statusBtns = document.querySelectorAll('.status-btn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sortBtns = document.querySelectorAll('.sort-btn');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportBtn');
    const resultsCount = document.getElementById('resultsCount');
    const papersContainer = document.getElementById('papers-container');
    const allPapers = Array.from(document.querySelectorAll('.paper-card'));
    
    let currentStatus = 'all';
    let currentCategory = 'all';
    let currentSort = 'date-desc';
    let searchTerm = '';
    let visiblePapers = [];
    
    // 懒加载相关
    let loadedCount = 0;
    const loadBatchSize = 50;
    let isLoading = false;
    
    // 发表状态筛选
    statusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            statusBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentStatus = this.dataset.status;
            filterAndSortPapers();
        });
    });
    
    // 研究领域筛选
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndSortPapers();
        });
    });
    
    // 排序按钮
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sortBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort;
            filterAndSortPapers();
        });
    });
    
    // 搜索输入
    searchInput.addEventListener('input', function() {
        searchTerm = this.value.toLowerCase();
        filterAndSortPapers();
    });
    
    // 筛选和排序论文
    function filterAndSortPapers() {
        // 筛选
        visiblePapers = allPapers.filter(paper => {
            const tags = paper.dataset.tags.split(',');
            const status = paper.dataset.status;
            const text = paper.textContent.toLowerCase();
            
            const matchStatus = currentStatus === 'all' || status === currentStatus;
            const matchCategory = currentCategory === 'all' || tags.includes(currentCategory);
            const matchSearch = searchTerm === '' || text.includes(searchTerm);
            
            return matchStatus && matchCategory && matchSearch;
        });
        
        // 排序
        visiblePapers.sort((a, b) => {
            const dateA = new Date(a.dataset.date);
            const dateB = new Date(b.dataset.date);
            
            if (currentSort === 'date-desc') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });
        
        // 更新显示
        resultsCount.textContent = `显示 ${visiblePapers.length} 篇论文`;
        
        // 重置懒加载
        loadedCount = 0;
        papersContainer.innerHTML = '';
        
        // 加载第一批
        loadMorePapers();
    }
    
    // 加载更多论文
    function loadMorePapers() {
        if (isLoading || loadedCount >= visiblePapers.length) return;
        
        isLoading = true;
        const endIndex = Math.min(loadedCount + loadBatchSize, visiblePapers.length);
        
        for (let i = loadedCount; i < endIndex; i++) {
            papersContainer.appendChild(visiblePapers[i].cloneNode(true));
        }
        
        loadedCount = endIndex;
        isLoading = false;
        
        // 如果还有更多，添加加载提示
        if (loadedCount < visiblePapers.length) {
            showLoadingIndicator();
        }
    }
    
    // 显示加载指示器
    function showLoadingIndicator() {
        let indicator = document.getElementById('loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'loading-indicator';
            indicator.className = 'loading-indicator';
            indicator.textContent = '加载更多...';
            papersContainer.appendChild(indicator);
        }
    }
    
    // 使用 Intersection Observer 实现懒加载
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMorePapers();
            }
        });
    }, {
        rootMargin: '100px'
    });
    
    // 观察加载指示器
    const checkAndObserve = () => {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            observer.observe(indicator);
        }
    };
    
    // 定期检查是否需要观察
    setInterval(checkAndObserve, 1000);
    
    // 导出功能
    exportBtn.addEventListener('click', function() {
        exportToBibTeX();
    });
    
    // 导出为 BibTeX
    function exportToBibTeX() {
        let bibtex = '';
        const displayedPapers = papersContainer.querySelectorAll('.paper-card');
        
        displayedPapers.forEach((paper, index) => {
            const title = paper.querySelector('.paper-title a').textContent.trim();
            const authors = paper.querySelector('.paper-authors').textContent.replace('👥 ', '').trim();
            const date = paper.dataset.date;
            const arxivUrl = paper.querySelector('.paper-title a').href;
            const arxivId = arxivUrl.split('/').pop();
            
            bibtex += `@article{${arxivId.replace('.', '_')},\n`;
            bibtex += `  title={${title}},\n`;
            bibtex += `  author={${authors}},\n`;
            bibtex += `  year={${date.split('-')[0]}},\n`;
            bibtex += `  journal={arXiv preprint arXiv:${arxivId}},\n`;
            bibtex += `  url={${arxivUrl}}\n`;
            bibtex += `}\n\n`;
        });
        
        downloadFile(bibtex, 'papers.bib', 'text/plain');
    }
    
    // 下载文件
    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    // 初始化
    filterAndSortPapers();
        
        // 显示无结果提示
        const container = document.getElementById('papers-container');
        let noResults = container.querySelector('.no-results');
        
        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('p');
                noResults.className = 'no-results';
                noResults.textContent = '未找到匹配的论文';
                container.appendChild(noResults);
            }
        } else {
            if (noResults) {
                noResults.remove();
            }
        }
    }
});
