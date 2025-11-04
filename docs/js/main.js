// 筛选、搜索、排序和懒加载功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded');
    
    // 加载论文数据
    const papersDataEl = document.getElementById('papers-data');
    if (!papersDataEl) {
        console.error('Papers data element not found');
        return;
    }
    
    let allPapersData;
    try {
        allPapersData = JSON.parse(papersDataEl.textContent);
        console.log(`Loaded ${allPapersData.length} papers`);
    } catch (e) {
        console.error('Failed to parse papers data:', e);
        return;
    }
    
    // 获取DOM元素
    const statusBtns = document.querySelectorAll('.status-btn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sortBtns = document.querySelectorAll('.sort-btn');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportBtn');
    const resultsCount = document.getElementById('resultsCount');
    const papersContainer = document.getElementById('papers-container');
    
    console.log('DOM elements:', {
        statusBtns: statusBtns.length,
        categoryBtns: categoryBtns.length,
        sortBtns: sortBtns.length,
        searchInput: !!searchInput,
        exportBtn: !!exportBtn,
        resultsCount: !!resultsCount,
        papersContainer: !!papersContainer
    });
    
    // 状态变量
    let currentStatus = 'all';
    let currentCategory = 'all';
    let currentSort = 'date-desc';
    let searchTerm = '';
    let filteredPapers = [];
    let loadedCount = 0;
    const loadBatchSize = 50;
    let isLoading = false;
    let observer = null;
    
    // 生成论文HTML
    function createPaperHTML(paper) {
        const tags = paper.tags ? paper.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        
        // 提取代码链接
        let codeLink = '';
        if (paper.code_link) {
            codeLink = `<a href="${paper.code_link}" target="_blank" class="code-link">📄 Code/Project</a>`;
        }
        
        // 获取会议徽章
        let venueBadge = '';
        if (paper.conference) {
            const badgeInfo = getVenueBadge(paper.conference);
            if (badgeInfo) {
                venueBadge = `<span class="venue-badge ${badgeInfo.class}">${badgeInfo.text}</span>`;
            }
        }
        
        const status = paper.conference ? 'published' : 'preprint';
        const firstCategory = paper.categories && paper.categories.length > 0 ? paper.categories[0] : '';
        
        return `
            <article class="paper-card" data-date="${paper.published}" data-status="${status}" data-tags="${paper.tags ? paper.tags.join(',') : ''}">
                <h2 class="paper-title">
                    <a href="https://arxiv.org/abs/${paper.id}" target="_blank">${paper.title}</a>
                </h2>
                <div class="paper-meta">
                    <span class="meta-item">📅 ${paper.published}</span>
                    ${venueBadge}
                    ${codeLink}
                </div>
                <div class="paper-authors">
                    👥 ${paper.authors}
                </div>
                <div class="paper-tags">
                    ${tags}
                </div>
                <div class="paper-abstract">
                    <details>
                        <summary>查看摘要</summary>
                        <p>${paper.abstract}</p>
                    </details>
                </div>
            </article>
        `;
    }
    
    // 获取会议徽章信息
    function getVenueBadge(conference) {
        if (!conference) return null;
        
        const venueMap = {
            'NeurIPS': { class: 'badge-neurips', text: 'NeurIPS' },
            'ICLR': { class: 'badge-iclr', text: 'ICLR' },
            'ICML': { class: 'badge-icml', text: 'ICML' },
            'CVPR': { class: 'badge-cvpr', text: 'CVPR' },
            'ICCV': { class: 'badge-iccv', text: 'ICCV' },
            'ECCV': { class: 'badge-eccv', text: 'ECCV' },
            'ACL': { class: 'badge-acl', text: 'ACL' },
            'EMNLP': { class: 'badge-emnlp', text: 'EMNLP' },
            'NAACL': { class: 'badge-naacl', text: 'NAACL' },
            'AAAI': { class: 'badge-aaai', text: 'AAAI' },
            'IJCAI': { class: 'badge-ijcai', text: 'IJCAI' }
        };
        
        for (const [key, value] of Object.entries(venueMap)) {
            if (conference.toUpperCase().includes(key)) {
                return value;
            }
        }
        
        return { class: 'badge-published', text: 'Published' };
    }
    
    // 筛选和排序论文
    function filterAndSortPapers() {
        console.log('Filtering papers:', { currentStatus, currentCategory, searchTerm, currentSort });
        
        // 筛选
        filteredPapers = allPapersData.filter(paper => {
            const status = paper.conference ? 'published' : 'preprint';
            const tags = paper.tags || [];
            const text = `${paper.title} ${paper.authors} ${paper.abstract}`.toLowerCase();
            
            const matchStatus = currentStatus === 'all' || status === currentStatus;
            const matchCategory = currentCategory === 'all' || tags.includes(currentCategory);
            const matchSearch = searchTerm === '' || text.includes(searchTerm);
            
            return matchStatus && matchCategory && matchSearch;
        });
        
        console.log(`Filtered to ${filteredPapers.length} papers`);
        
        // 排序
        filteredPapers.sort((a, b) => {
            const dateA = new Date(a.published);
            const dateB = new Date(b.published);
            
            if (currentSort === 'date-desc') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });
        
        // 更新显示
        if (resultsCount) {
            resultsCount.textContent = `显示 ${filteredPapers.length} 篇论文`;
        }
        
        // 重置懒加载
        loadedCount = 0;
        if (papersContainer) {
            papersContainer.innerHTML = '';
        }
        
        // 移除旧的 observer
        if (observer) {
            observer.disconnect();
        }
        
        // 加载第一批
        loadMorePapers();
    }
    
    // 加载更多论文
    function loadMorePapers() {
        if (isLoading || loadedCount >= filteredPapers.length) {
            console.log('Skip loading:', { isLoading, loadedCount, total: filteredPapers.length });
            return;
        }
        
        isLoading = true;
        console.log(`Loading papers ${loadedCount} to ${loadedCount + loadBatchSize}`);
        
        const endIndex = Math.min(loadedCount + loadBatchSize, filteredPapers.length);
        const fragment = document.createDocumentFragment();
        
        for (let i = loadedCount; i < endIndex; i++) {
            const paperHTML = createPaperHTML(filteredPapers[i]);
            const temp = document.createElement('div');
            temp.innerHTML = paperHTML;
            fragment.appendChild(temp.firstElementChild);
        }
        
        papersContainer.appendChild(fragment);
        loadedCount = endIndex;
        isLoading = false;
        
        console.log(`Loaded ${endIndex} papers`);
        
        // 如果还有更多，设置加载触发器
        if (loadedCount < filteredPapers.length) {
            setupLoadTrigger();
        }
    }
    
    // 设置加载触发器
    function setupLoadTrigger() {
        let indicator = document.getElementById('loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'loading-indicator';
            indicator.className = 'loading-indicator';
            indicator.style.height = '100px';
            indicator.style.margin = '20px 0';
            indicator.style.textAlign = 'center';
            indicator.style.color = '#666';
            indicator.textContent = '加载更多...';
            papersContainer.appendChild(indicator);
        }
        
        // 创建新的 observer
        if (observer) {
            observer.disconnect();
        }
        
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Loading more papers (intersection detected)');
                    loadMorePapers();
                }
            });
        }, {
            rootMargin: '200px'
        });
        
        observer.observe(indicator);
    }
    
    // 发表状态筛选
    statusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Status button clicked:', this.dataset.status);
            statusBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentStatus = this.dataset.status;
            filterAndSortPapers();
        });
    });
    
    // 研究领域筛选
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Category button clicked:', this.dataset.category);
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndSortPapers();
        });
    });
    
    // 排序按钮
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            console.log('Sort button clicked:', this.dataset.sort);
            e.preventDefault();
            sortBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort;
            filterAndSortPapers();
        });
    });
    
    // 搜索输入
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value.toLowerCase();
            console.log('Search term:', searchTerm);
            filterAndSortPapers();
        });
    }
    
    // 导出功能
    if (exportBtn) {
        exportBtn.addEventListener('click', function(e) {
            console.log('Export button clicked');
            e.preventDefault();
            exportToBibTeX();
        });
    }
    
    // 导出为 BibTeX
    function exportToBibTeX() {
        let bibtex = '';
        
        filteredPapers.slice(0, loadedCount).forEach((paper, index) => {
            const arxivId = paper.id;
            const year = paper.published.split('-')[0];
            
            bibtex += `@article{${arxivId.replace('.', '_')},\n`;
            bibtex += `  title={${paper.title}},\n`;
            bibtex += `  author={${paper.authors}},\n`;
            bibtex += `  year={${year}},\n`;
            bibtex += `  journal={arXiv preprint arXiv:${arxivId}}`;
            if (paper.conference) {
                bibtex += `,\n  note={${paper.conference}}`;
            }
            bibtex += `\n}\n\n`;
        });
        
        console.log(`Exporting ${filteredPapers.slice(0, loadedCount).length} papers`);
        downloadFile(bibtex, 'papers.bib', 'text/plain');
    }
    
    // 下载文件
    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('File download triggered:', filename);
    }
    
    // 初始化
    console.log('Initializing...');
    filterAndSortPapers();
});
