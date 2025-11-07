// 筛选、搜索、排序和懒加载功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded');
    
    // 获取DOM元素
    const monthBtns = document.querySelectorAll('.month-btn');
    const statusBtns = document.querySelectorAll('.status-btn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sortBtns = document.querySelectorAll('.sort-btn');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const selectedCount = document.getElementById('selectedCount');
    const resultsCount = document.getElementById('resultsCount');
    const papersContainer = document.getElementById('papers-container');
    
    console.log('DOM elements:', {
        monthBtns: monthBtns.length,
        statusBtns: statusBtns.length,
        categoryBtns: categoryBtns.length,
        sortBtns: sortBtns.length,
        searchInput: !!searchInput,
        exportBtn: !!exportBtn,
        selectAllBtn: !!selectAllBtn,
        clearAllBtn: !!clearAllBtn,
        resultsCount: !!resultsCount,
        papersContainer: !!papersContainer
    });
    
    // 状态变量
    let allPapersData = [];  // 所有论文数据
    let currentMonth = 'all';  // 当前选中的月份
    let currentStatus = 'all';
    let currentCategory = 'all';
    let currentSort = 'date-desc';
    let searchTerm = '';
    let filteredPapers = [];
    let loadedCount = 0;
    const initialBatchSize = 20;  // 第一次加载20个
    const subsequentBatchSize = 10;  // 后续每次加载10个
    let isLoading = false;
    let observer = null;
    let monthsCache = {};  // 缓存已加载的月份数据
    
    // 自定义分类管理（支持关键词）
    const CUSTOM_CATEGORIES_KEY = 'dailypaper_custom_categories';
    let customCategories = loadCustomCategories();
    
    // 加载自定义分类（兼容旧格式）
    function loadCustomCategories() {
        try {
            const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
            if (!stored) return [];
            
            const parsed = JSON.parse(stored);
            
            // 兼容旧格式（字符串数组）
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (typeof parsed[0] === 'string') {
                    // 旧格式：转换为新格式
                    const newFormat = parsed.map(name => ({
                        name: name,
                        keywords: []
                    }));
                    saveCustomCategories(newFormat);
                    return newFormat;
                }
            }
            
            return parsed;
        } catch (e) {
            console.error('Failed to load custom categories:', e);
            return [];
        }
    }
    
    // 保存自定义分类
    function saveCustomCategories() {
        try {
            localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
        } catch (e) {
            console.error('Failed to save custom categories:', e);
        }
    }
    
    // 添加自定义分类
    function addCustomCategory(categoryName, keywords = []) {
        if (!categoryName || categoryName.trim() === '') return false;
        
        const trimmed = categoryName.trim();
        
        // 检查是否已存在
        if (customCategories.some(cat => cat.name === trimmed)) {
            alert('该分类已存在！');
            return false;
        }
        
        // 检查是否是默认分类
        const defaultCategories = [
            'Computer Vision',
            'Natural Language Processing',
            'Machine Learning',
            'Robotics',
            'Multimodal'
        ];
        if (defaultCategories.includes(trimmed)) {
            alert('该分类是默认分类，无需添加！');
            return false;
        }
        
        customCategories.push({
            name: trimmed,
            keywords: Array.isArray(keywords) ? keywords : []
        });
        saveCustomCategories();
        updateCategoryButtons();
        renderCustomCategoriesList();
        
        // 重新应用动态分类
        if (allPapersData.length > 0) {
            allPapersData = applyCustomCategoryTags(allPapersData);
            filterAndSortPapers();
        }
        
        return true;
    }
    
    // 更新自定义分类的关键词
    function updateCustomCategoryKeywords(categoryName, keywords) {
        const category = customCategories.find(cat => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            return catName === categoryName;
        });
        
        if (category) {
            if (typeof category === 'string') {
                // 旧格式，转换为新格式
                const index = customCategories.indexOf(category);
                customCategories[index] = {
                    name: categoryName,
                    keywords: Array.isArray(keywords) ? keywords : []
                };
            } else {
                category.keywords = Array.isArray(keywords) ? keywords : [];
            }
            saveCustomCategories();
            renderCustomCategoriesList();
            
            console.log(`Updated keywords for "${categoryName}":`, keywords);
            
            // 重新应用动态分类
            if (allPapersData.length > 0) {
                allPapersData = applyCustomCategoryTags(allPapersData);
                filterAndSortPapers();
            }
        } else {
            console.warn(`Category "${categoryName}" not found`);
        }
    }
    
    // 删除自定义分类
    function removeCustomCategory(categoryName) {
        customCategories = customCategories.filter(cat => cat.name !== categoryName);
        saveCustomCategories();
        updateCategoryButtons();
        renderCustomCategoriesList();
        
        // 重新应用动态分类（移除该分类的标签）
        if (allPapersData.length > 0) {
            allPapersData = allPapersData.map(paper => ({
                ...paper,
                tags: (paper.tags || []).filter(tag => tag !== categoryName)
            }));
            filterAndSortPapers();
        }
        
        // 如果删除的是当前选中的分类，切换到"全部"
        if (currentCategory === categoryName) {
            currentCategory = 'all';
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') {
                    btn.classList.add('active');
                }
            });
            filterAndSortPapers();
        }
    }
    
    // 基于自定义分类的关键词动态分类论文
    function applyCustomCategoryTags(papers) {
        if (customCategories.length === 0) {
            return papers;
        }
        
        console.log('Applying custom category tags...', customCategories);
        
        let matchedCount = 0;
        const result = papers.map(paper => {
            const text = `${paper.title} ${paper.abstract}`.toLowerCase();
            const tags = new Set(paper.tags || []);
            
            // 检查每个自定义分类
            customCategories.forEach(category => {
                const categoryName = typeof category === 'string' ? category : category.name;
                const keywords = typeof category === 'object' ? (category.keywords || []) : [];
                
                // 如果没有关键词，跳过
                if (keywords.length === 0) {
                    return;
                }
                
                // 检查是否匹配关键词
                const hasKeyword = keywords.some(keyword => {
                    const keywordLower = keyword.toLowerCase().trim();
                    if (!keywordLower) return false;
                    return text.includes(keywordLower);
                });
                
                if (hasKeyword) {
                    tags.add(categoryName);
                    matchedCount++;
                    console.log(`Matched paper "${paper.title.substring(0, 50)}..." to category "${categoryName}"`);
                }
            });
            
            return {
                ...paper,
                tags: Array.from(tags)
            };
        });
        
        console.log(`Applied custom tags: ${matchedCount} matches found`);
        return result;
    }
    
    // 渲染自定义分类列表
    function renderCustomCategoriesList() {
        const listContainer = document.getElementById('customCategoriesList');
        if (!listContainer) return;
        
        if (customCategories.length === 0) {
            listContainer.innerHTML = '<p class="empty-message">暂无自定义分类</p>';
            return;
        }
        
        listContainer.innerHTML = customCategories.map((category, index) => {
            const categoryName = typeof category === 'string' ? category : category.name;
            const keywords = typeof category === 'object' ? (category.keywords || []) : [];
            const keywordsStr = keywords.join(', ');
            
            return `
                <div class="custom-category-item" data-index="${index}">
                    <div class="category-info">
                        <div class="category-name-row">
                            <strong>${categoryName}</strong>
                            <button class="delete-category-btn" data-category="${categoryName}">删除</button>
                        </div>
                        <div class="category-keywords">
                            <label>关键词：</label>
                            <input type="text" 
                                   class="keywords-input" 
                                   data-category="${categoryName}"
                                   value="${keywordsStr}"
                                   placeholder="用逗号分隔，如: reinforcement learning, RL, Q-learning">
                            <button class="save-keywords-btn" data-category="${categoryName}">保存</button>
                        </div>
                        <div class="keywords-hint">
                            <small>💡 提示：关键词用于匹配论文标题和摘要，用逗号分隔多个关键词。例如：reinforcement learning, RL, Q-learning</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加删除按钮事件
        listContainer.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryName = this.dataset.category;
                if (confirm(`确定要删除分类 "${categoryName}" 吗？`)) {
                    removeCustomCategory(categoryName);
                }
            });
        });
        
        // 添加保存关键词按钮事件
        listContainer.querySelectorAll('.save-keywords-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryName = this.dataset.category;
                const input = listContainer.querySelector(`.keywords-input[data-category="${categoryName}"]`);
                if (input) {
                    const keywordsStr = input.value.trim();
                    const keywords = keywordsStr 
                        ? keywordsStr.split(',').map(k => k.trim()).filter(k => k)
                        : [];
                    
                    console.log(`Saving keywords for "${categoryName}":`, keywords);
                    
                    if (keywords.length === 0) {
                        alert('⚠️ 请至少输入一个关键词！关键词用于匹配论文标题和摘要。');
                        return;
                    }
                    
                    updateCustomCategoryKeywords(categoryName, keywords);
                    
                    // 显示保存成功提示
                    const btnText = this.textContent;
                    this.textContent = '✓ 已保存';
                    this.style.background = '#28a745';
                    setTimeout(() => {
                        this.textContent = btnText;
                        this.style.background = '';
                    }, 1500);
                }
            });
        });
        
        // 关键词输入框支持 Enter 键保存
        listContainer.querySelectorAll('.keywords-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const categoryName = this.dataset.category;
                    const saveBtn = listContainer.querySelector(`.save-keywords-btn[data-category="${categoryName}"]`);
                    if (saveBtn) {
                        saveBtn.click();
                    }
                }
            });
        });
    }
    
    // 更新分类按钮（包含自定义分类）
    function updateCategoryButtons() {
        const categoryFilters = document.getElementById('categoryFilters');
        if (!categoryFilters) return;
        
        // 获取所有分类（默认 + 自定义）
        const customCategoryNames = customCategories.map(cat => 
            typeof cat === 'string' ? cat : cat.name
        );
        const allCategories = new Set([
            'Computer Vision',
            'Natural Language Processing',
            'Machine Learning',
            'Robotics',
            'Multimodal',
            ...customCategoryNames
        ]);
        
        // 先筛选出符合当前状态的论文
        const statusFilteredPapers = allPapersData.filter(paper => {
            const status = paper.conference ? 'published' : 'preprint';
            return currentStatus === 'all' || status === currentStatus;
        });
        
        // 计算各个领域的数量
        const categoryCounts = {
            'all': statusFilteredPapers.length
        };
        
        // 初始化所有分类的计数
        allCategories.forEach(cat => {
            categoryCounts[cat] = 0;
        });
        
        // 统计每个分类的论文数
        statusFilteredPapers.forEach(paper => {
            const tags = paper.tags || [];
            tags.forEach(tag => {
                if (categoryCounts.hasOwnProperty(tag)) {
                    categoryCounts[tag]++;
                }
            });
        });
        
        // 移除"全部"按钮外的所有分类按钮
        const existingBtns = categoryFilters.querySelectorAll('.category-btn:not([data-category="all"])');
        existingBtns.forEach(btn => btn.remove());
        
        // 更新"全部"按钮
        const allBtn = categoryFilters.querySelector('[data-category="all"]');
        if (allBtn) {
            allBtn.textContent = `全部 (${categoryCounts['all']})`;
        }
        
        // 添加默认分类按钮
        const defaultCategories = [
            { name: 'Computer Vision', display: 'Computer Vision' },
            { name: 'Natural Language Processing', display: 'NLP' },
            { name: 'Machine Learning', display: 'Machine Learning' },
            { name: 'Robotics', display: 'Robotics' },
            { name: 'Multimodal', display: 'Multimodal' }
        ];
        
        defaultCategories.forEach(cat => {
            if (categoryCounts[cat.name] > 0 || allCategories.has(cat.name)) {
                const btn = document.createElement('button');
                btn.className = 'filter-btn category-btn';
                btn.dataset.category = cat.name;
                btn.textContent = `${cat.display} (${categoryCounts[cat.name] || 0})`;
                categoryFilters.appendChild(btn);
                
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentCategory = this.dataset.category;
                    filterAndSortPapers();
                });
            }
        });
        
        // 添加自定义分类按钮
        customCategories.forEach(cat => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            if (categoryCounts[catName] > 0 || allCategories.has(catName)) {
                const btn = document.createElement('button');
                btn.className = 'filter-btn category-btn custom-category-btn';
                btn.dataset.category = catName;
                btn.textContent = `${catName} (${categoryCounts[catName] || 0})`;
                categoryFilters.appendChild(btn);
                
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentCategory = this.dataset.category;
                    filterAndSortPapers();
                });
            }
        });
    }
    
    // 加载月份索引
    async function loadMonthsIndex() {
        try {
            const response = await fetch('/api/months-index');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const monthsIndex = await response.json();
            console.log('Months index loaded:', monthsIndex);
            
            // 更新月份按钮
            updateMonthButtons(monthsIndex);
            
            // 默认加载最新月份的数据
            if (monthsIndex.length > 0) {
                await loadMonthData('all');
            }
        } catch (e) {
            console.error('Failed to load months index:', e);
            // 如果 API 失败，尝试直接加载所有数据
            await loadMonthData('all');
        }
    }
    
    // 更新月份按钮
    function updateMonthButtons(monthsIndex) {
        const monthFilters = document.querySelector('.month-filters');
        if (!monthFilters) return;
        
        // 计算总数
        const totalCount = monthsIndex.reduce((sum, m) => sum + m.count, 0);
        
        // 更新"全部"按钮
        const allBtn = monthFilters.querySelector('[data-month="all"]');
        if (allBtn) {
            allBtn.textContent = `全部 (${totalCount})`;
        }
        
        // 移除旧的月份按钮（保留"全部"按钮）
        const existingBtns = monthFilters.querySelectorAll('.month-btn:not([data-month="all"])');
        existingBtns.forEach(btn => btn.remove());
        
        // 添加新的月份按钮
        monthsIndex.forEach(monthInfo => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn month-btn';
            btn.dataset.month = monthInfo.month;
            btn.textContent = `${monthInfo.month} (${monthInfo.count})`;
            monthFilters.appendChild(btn);
            
            // 添加事件监听
            btn.addEventListener('click', async function() {
                monthBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentMonth = this.dataset.month;
                
                if (resultsCount) {
                    resultsCount.textContent = '加载中...';
                }
                if (papersContainer) {
                    papersContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">加载中...</div>';
                }
                
                await loadMonthData(currentMonth);
            });
        });
        
        // 重新获取月份按钮列表
        const newMonthBtns = document.querySelectorAll('.month-btn');
        // 注意：这里不能直接赋值给 monthBtns，因为它是 NodeList
        // 但事件监听已经通过上面的代码添加了
    }
    
    // 加载指定月份的数据
    async function loadMonthData(month) {
        try {
            const url = month === 'all' 
                ? '/api/fetch-papers' 
                : `/api/fetch-papers?month=${month}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let papers = await response.json();
            console.log(`Fetched ${papers.length} papers from API`);
            
            // 应用自定义分类标签
            papers = applyCustomCategoryTags(papers);
            
            if (month === 'all') {
                allPapersData = papers;
                console.log(`Loaded all papers, total ${allPapersData.length} papers`);
            } else {
                // 缓存单月数据
                monthsCache[month] = papers;
                allPapersData = papers;
                console.log(`Loaded month ${month}, ${allPapersData.length} papers`);
            }
            
            // 数据加载完成后，触发筛选
            filterAndSortPapers();
        } catch (e) {
            console.error(`Failed to load month data for ${month}:`, e);
            if (resultsCount) {
                resultsCount.textContent = '加载失败，请刷新页面重试';
            }
            if (papersContainer) {
                papersContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">加载失败，请刷新页面重试</div>';
            }
        }
    }
    
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
            <article class="paper-card" data-date="${paper.published}" data-status="${status}" data-tags="${paper.tags ? paper.tags.join(',') : ''}" data-paper-id="${paper.id}">
                <div class="paper-select">
                    <input type="checkbox" class="paper-checkbox" id="check-${paper.id}" data-paper-id="${paper.id}">
                    <label for="check-${paper.id}"></label>
                </div>
                <div class="paper-content">
                    <h2 class="paper-title">
                        <a href="https://arxiv.org/abs/${paper.id}" target="_blank">${paper.title}</a>
                    </h2>
                    <div class="paper-meta">
                        <span class="meta-item">📅 ${paper.published}</span>
                        ${venueBadge}
                        ${codeLink}
                    </div>
                    <div class="paper-authors">
                        👥 ${Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
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
                </div>
            </article>
        `;
    }
    
    // 获取会议徽章信息
    function getVenueBadge(conference) {
        if (!conference) return null;
        
        // 根据会议名称中包含的关键词决定徽章样式
        const conferenceUpper = conference.toUpperCase();
        let badgeClass = 'badge-published';  // 默认样式
        
        // 顶级会议匹配
        if (conferenceUpper.includes('NEURIPS')) {
            badgeClass = 'badge-neurips';
        } else if (conferenceUpper.includes('ICLR')) {
            badgeClass = 'badge-iclr';
        } else if (conferenceUpper.includes('ICML')) {
            badgeClass = 'badge-icml';
        } else if (conferenceUpper.includes('CVPR')) {
            badgeClass = 'badge-cvpr';
        } else if (conferenceUpper.includes('ICCV')) {
            badgeClass = 'badge-iccv';
        } else if (conferenceUpper.includes('ECCV')) {
            badgeClass = 'badge-eccv';
        } else if (conferenceUpper.includes('ACL')) {
            badgeClass = 'badge-acl';
        } else if (conferenceUpper.includes('EMNLP')) {
            badgeClass = 'badge-emnlp';
        } else if (conferenceUpper.includes('NAACL')) {
            badgeClass = 'badge-naacl';
        } else if (conferenceUpper.includes('AAAI')) {
            badgeClass = 'badge-aaai';
        } else if (conferenceUpper.includes('IJCAI')) {
            badgeClass = 'badge-ijcai';
        }
        
        // 直接使用从 ArXiv comments 提取的完整会议名称
        return { class: badgeClass, text: conference };
    }
    
    // 更新研究领域按钮的数量（已由 updateCategoryButtons 替代）
    function updateCategoryButtonCounts() {
        updateCategoryButtons();
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
        
        // 更新研究领域按钮的数量
        updateCategoryButtons();
        
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
        
        // 第一次加载50个，后续每次10个
        const batchSize = loadedCount === 0 ? initialBatchSize : subsequentBatchSize;
        console.log(`Loading papers ${loadedCount} to ${loadedCount + batchSize} (batch size: ${batchSize})`);
        
        const endIndex = Math.min(loadedCount + batchSize, filteredPapers.length);
        const fragment = document.createDocumentFragment();
        
        for (let i = loadedCount; i < endIndex; i++) {
            const paperHTML = createPaperHTML(filteredPapers[i]);
            const temp = document.createElement('div');
            temp.innerHTML = paperHTML;
            fragment.appendChild(temp.firstElementChild);
        }
        
        // 移除旧的加载指示器
        const oldIndicator = document.getElementById('loading-indicator');
        if (oldIndicator) {
            oldIndicator.remove();
        }
        
        papersContainer.appendChild(fragment);
        loadedCount = endIndex;
        isLoading = false;
        
        console.log(`Loaded ${endIndex} papers total`);
        
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
    
    // 月份筛选（事件监听在 updateMonthButtons 中动态添加）
    // 这里保留对初始月份按钮的监听（如果存在）
    document.querySelectorAll('.month-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            console.log('Month button clicked:', this.dataset.month);
            document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMonth = this.dataset.month;
            
            // 显示加载提示
            if (resultsCount) {
                resultsCount.textContent = '加载中...';
            }
            if (papersContainer) {
                papersContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">加载中...</div>';
            }
            
            // 加载月份数据
            await loadMonthData(currentMonth);
        });
    });
    
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
    
    // 研究领域筛选（事件监听在 updateCategoryButtons 中动态添加）
    // 这里保留对初始分类按钮的监听
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Category button clicked:', this.dataset.category);
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndSortPapers();
        });
    });
    
    // 自定义分类管理模态框
    const categoryModal = document.getElementById('categoryModal');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const closeModal = document.getElementById('closeModal');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newCategoryInput = document.getElementById('newCategoryInput');
    
    if (manageCategoriesBtn) {
        manageCategoriesBtn.addEventListener('click', function() {
            renderCustomCategoriesList();
            categoryModal.classList.add('show');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            categoryModal.classList.remove('show');
        });
    }
    
    // 点击模态框外部关闭
    if (categoryModal) {
        categoryModal.addEventListener('click', function(e) {
            if (e.target === categoryModal) {
                categoryModal.classList.remove('show');
            }
        });
    }
    
    // 添加自定义分类
    if (addCategoryBtn && newCategoryInput) {
        addCategoryBtn.addEventListener('click', function() {
            const categoryName = newCategoryInput.value.trim();
            if (categoryName) {
                // 添加分类时，关键词为空，用户可以在管理界面中配置
                if (addCustomCategory(categoryName, [])) {
                    newCategoryInput.value = '';
                }
            }
        });
        
        // 按 Enter 键添加
        newCategoryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCategoryBtn.click();
            }
        });
    }
    
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
    
    // 更新选中数量
    function updateSelectedCount() {
        const count = document.querySelectorAll('.paper-checkbox:checked').length;
        if (selectedCount) {
            selectedCount.textContent = count;
        }
    }
    
    // 监听复选框变化（使用事件委托）
    if (papersContainer) {
        papersContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('paper-checkbox')) {
                updateSelectedCount();
            }
        });
    }
    
    // 全选功能
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.paper-checkbox');
            checkboxes.forEach(cb => cb.checked = true);
            updateSelectedCount();
            console.log('All papers selected');
        });
    }
    
    // 清空选择
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.paper-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            updateSelectedCount();
            console.log('All selections cleared');
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
        // 获取所有选中的复选框
        const checkboxes = document.querySelectorAll('.paper-checkbox:checked');
        
        if (checkboxes.length === 0) {
            alert('请至少选择一篇论文导出！');
            return;
        }
        
        // 获取选中的论文ID
        const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.paperId);
        
        // 从所有论文数据中找到对应的论文
        const selectedPapers = allPapersData.filter(paper => selectedIds.includes(paper.id));
        
        let bibtex = '';
        selectedPapers.forEach((paper, index) => {
            const arxivId = paper.id;
            const year = paper.published.split('-')[0];
            
            // 处理作者列表（BibTeX 格式要求用 "and" 连接）
            const authors = Array.isArray(paper.authors) 
                ? paper.authors.join(' and ')
                : paper.authors;
            
            // 处理标题中的特殊字符（BibTeX 需要转义）
            const title = paper.title
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}')
                .replace(/\&/g, '\\&');
            
            // 生成唯一的引用键
            const citeKey = arxivId.replace(/\./g, '_').replace(/:/g, '_');
            
            bibtex += `@article{${citeKey},\n`;
            bibtex += `  title={${title}},\n`;
            bibtex += `  author={${authors}},\n`;
            bibtex += `  year={${year}},\n`;
            bibtex += `  journal={arXiv preprint arXiv:${arxivId}}`;
            if (paper.conference) {
                bibtex += `,\n  note={${paper.conference}}`;
            }
            bibtex += `,\n  url={${paper.arxiv_url}}`;
            bibtex += `\n}\n\n`;
        });
        
        console.log(`Exporting ${selectedPapers.length} selected papers`);
        
        // 添加文件头注释
        const header = `% BibTeX export from DailyPaper\n% Generated: ${new Date().toLocaleString('zh-CN')}\n% Total papers: ${selectedPapers.length}\n\n`;
        downloadFile(header + bibtex, 'papers.bib', 'text/plain');
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
    
    // 初始化 - 加载数据
    console.log('Initializing...');
    
    // 初始化自定义分类列表
    renderCustomCategoriesList();
    
    loadMonthsIndex();
});
