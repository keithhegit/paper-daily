/**
 * 自定义分类管理器
 * 支持为自定义分类配置关键词，实现前端动态分类
 */

// 扩展自定义分类数据结构，支持关键词
const CUSTOM_CATEGORIES_WITH_KEYWORDS_KEY = 'dailypaper_custom_categories_keywords';

/**
 * 加载自定义分类（带关键词）
 */
function loadCustomCategoriesWithKeywords() {
    try {
        const stored = localStorage.getItem(CUSTOM_CATEGORIES_WITH_KEYWORDS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // 兼容旧格式（只有名称的数组）
        const oldStored = localStorage.getItem('dailypaper_custom_categories');
        if (oldStored) {
            const oldCategories = JSON.parse(oldStored);
            // 转换为新格式
            const newFormat = oldCategories.map(name => ({
                name: name,
                keywords: []
            }));
            saveCustomCategoriesWithKeywords(newFormat);
            return newFormat;
        }
        return [];
    } catch (e) {
        console.error('Failed to load custom categories:', e);
        return [];
    }
}

/**
 * 保存自定义分类（带关键词）
 */
function saveCustomCategoriesWithKeywords(categories) {
    try {
        localStorage.setItem(CUSTOM_CATEGORIES_WITH_KEYWORDS_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save custom categories:', e);
    }
}

/**
 * 基于自定义分类的关键词动态分类论文
 */
function applyCustomCategoryTags(papers) {
    const customCategories = loadCustomCategoriesWithKeywords();
    
    if (customCategories.length === 0) {
        return papers;
    }
    
    return papers.map(paper => {
        const text = `${paper.title} ${paper.abstract}`.toLowerCase();
        const tags = new Set(paper.tags || []);
        
        // 检查每个自定义分类
        customCategories.forEach(category => {
            if (category.keywords && category.keywords.length > 0) {
                const hasKeyword = category.keywords.some(keyword => 
                    text.includes(keyword.toLowerCase())
                );
                if (hasKeyword) {
                    tags.add(category.name);
                }
            }
        });
        
        return {
            ...paper,
            tags: Array.from(tags)
        };
    });
}

/**
 * 导出供其他文件使用
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadCustomCategoriesWithKeywords,
        saveCustomCategoriesWithKeywords,
        applyCustomCategoryTags
    };
}

