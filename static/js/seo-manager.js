/**
 * 麻煮MINI石頭火鍋 - SEO 管理系統
 * Search Engine Optimization Manager
 * 
 * Author: 麻煮開發團隊
 * Version: 1.0.0
 */

class SEOManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.seoData = {};
        this.isInitialized = false;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化 SEO 系統
     */
    async init() {
        try {
            // 載入 SEO 資料
            await this.loadSEOData();
            
            // 應用當前頁面的 SEO 設定
            this.applySEO();
            
            // 監聽語言變更事件
            this.setupLanguageListener();
            
            this.isInitialized = true;
            console.log('🔍 SEO 系統初始化完成');
        } catch (error) {
            console.error('❌ SEO 系統初始化失敗:', error);
        }
    }
    
    /**
     * 載入 SEO 資料
     */
    async loadSEOData() {
        try {
            // 載入中文 SEO 資料
            const zhResponse = await fetch('/static/langs/zh.json');
            const zhData = await zhResponse.json();
            
            // 載入英文 SEO 資料
            const enResponse = await fetch('/static/langs/en.json');
            const enData = await enResponse.json();
            
            this.seoData = {
                zh: zhData,
                en: enData
            };
            
            console.log('✅ SEO 資料載入完成');
        } catch (error) {
            console.error('❌ SEO 資料載入失敗:', error);
            throw error;
        }
    }
    
    /**
     * 獲取當前頁面類型
     */
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('home.html') || path === '/' || path === '') return 'home';
        if (path.includes('about.html')) return 'about';
        if (path.includes('menu.html')) return 'menu';
        if (path.includes('news.html')) return 'news';
        if (path.includes('love.html')) return 'love';
        return 'home';
    }
    
    /**
     * 設定語言變更監聽器
     */
    setupLanguageListener() {
        // 監聽多語系統的語言變更
        if (window.i18nManager) {
            window.i18nManager.addEventListener = window.i18nManager.addEventListener || function() {};
            window.i18nManager.addEventListener('languageChanged', (newLang) => {
                this.updateSEOForLanguage(newLang);
            });
        }
    }
    
    /**
     * 應用 SEO 設定
     */
    applySEO() {
        const currentLang = this.getCurrentLanguage();
        this.updateSEOForLanguage(currentLang);
    }
    
    /**
     * 根據語言更新 SEO
     */
    updateSEOForLanguage(lang) {
        if (!this.seoData[lang]) return;
        
        const data = this.seoData[lang];
        const pageData = this.getPageSEOData(data);
        
        // 更新 meta 標籤
        this.updateMetaTags(pageData);
        
        // 更新 Open Graph 標籤
        this.updateOpenGraph(pageData);
        
        // 更新 Twitter Card 標籤
        this.updateTwitterCard(pageData);
        
        // 更新結構化資料
        this.updateStructuredData(pageData, lang);
        
        // 更新頁面標題
        this.updatePageTitle(pageData.title);
        
        // 更新 canonical URL
        this.updateCanonicalURL();
        
        console.log(`🔍 SEO 已更新為 ${lang} 語言`);
    }
    
    /**
     * 獲取當前語言
     */
    getCurrentLanguage() {
        if (window.i18nManager) {
            return window.i18nManager.getCurrentLanguage();
        }
        return 'zh'; // 預設中文
    }
    
    /**
     * 獲取頁面 SEO 資料
     */
    getPageSEOData(data) {
        const page = this.currentPage;
        
        switch (page) {
            case 'home':
                return {
                    title: data.meta.title,
                    description: data.meta.description,
                    keywords: data.meta.keywords,
                    image: '/static/img/logo/首頁大圖.jpg',
                    url: window.location.origin,
                    type: 'website'
                };
            case 'about':
                return {
                    title: `${data.about.hero.title} - ${data.meta.title}`,
                    description: data.about.hero.subtitle,
                    keywords: `${data.meta.keywords}, 品牌故事, 媽祖文化, 石頭火鍋`,
                    image: '/static/img/logo/MAZU.jpg',
                    url: `${window.location.origin}/about`,
                    type: 'article'
                };
            case 'menu':
                return {
                    title: `${data.menu.title} - ${data.meta.title}`,
                    description: data.menu.subtitle,
                    keywords: `${data.meta.keywords}, 菜單, 麻辣鍋, 石頭鍋, 火鍋`,
                    image: '/static/img/logo/菜單大圖.jpg',
                    url: `${window.location.origin}/menu`,
                    type: 'article'
                };
            case 'news':
                return {
                    title: `${data.news.title} - ${data.meta.title}`,
                    description: data.news.subtitle,
                    keywords: `${data.meta.keywords}, 最新消息, 活動資訊, 優惠`,
                    image: '/static/img/logo/新聞大圖.jpg',
                    url: `${window.location.origin}/news`,
                    type: 'article'
                };
            case 'love':
                return {
                    title: `${data.love.title} - ${data.meta.title}`,
                    description: data.love.description,
                    keywords: `${data.meta.keywords}, 愛心公益, 社會責任, 慈善`,
                    image: '/static/img/logo/愛心大圖.jpg',
                    url: `${window.location.origin}/love`,
                    type: 'article'
                };
            default:
                return {
                    title: data.meta.title,
                    description: data.meta.description,
                    keywords: data.meta.keywords,
                    image: '/static/img/logo/首頁大圖.jpg',
                    url: window.location.origin,
                    type: 'website'
                };
        }
    }
    
    /**
     * 更新 Meta 標籤
     */
    updateMetaTags(data) {
        // 更新 title
        this.updateMetaTag('title', data.title);
        
        // 更新 description
        this.updateMetaTag('description', data.description);
        
        // 更新 keywords
        this.updateMetaTag('keywords', data.keywords);
        
        // 更新 author
        this.updateMetaTag('author', '麻煮MINI石頭火鍋');
        
        // 更新 robots
        this.updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        
        // 更新 viewport
        this.updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        
        // 更新 charset
        this.updateMetaTag('charset', 'UTF-8');
    }
    
    /**
     * 更新單個 Meta 標籤
     */
    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }
    
    /**
     * 更新 Open Graph 標籤
     */
    updateOpenGraph(data) {
        // 更新 og:title
        this.updateOGTag('og:title', data.title);
        
        // 更新 og:description
        this.updateOGTag('og:description', data.description);
        
        // 更新 og:image
        this.updateOGTag('og:image', data.image);
        
        // 更新 og:url
        this.updateOGTag('og:url', data.url);
        
        // 更新 og:type
        this.updateOGTag('og:type', data.type);
        
        // 更新 og:site_name
        this.updateOGTag('og:site_name', '麻煮MINI石頭火鍋');
        
        // 更新 og:locale
        const locale = this.getCurrentLanguage() === 'zh' ? 'zh_TW' : 'en_US';
        this.updateOGTag('og:locale', locale);
        
        // 更新 og:image:width 和 og:image:height
        this.updateOGTag('og:image:width', '1200');
        this.updateOGTag('og:image:height', '630');
    }
    
    /**
     * 更新單個 Open Graph 標籤
     */
    updateOGTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }
    
    /**
     * 更新 Twitter Card 標籤
     */
    updateTwitterCard(data) {
        // 更新 twitter:card
        this.updateTwitterTag('twitter:card', 'summary_large_image');
        
        // 更新 twitter:title
        this.updateTwitterTag('twitter:title', data.title);
        
        // 更新 twitter:description
        this.updateTwitterTag('twitter:description', data.description);
        
        // 更新 twitter:image
        this.updateTwitterTag('twitter:image', data.image);
        
        // 更新 twitter:site
        this.updateTwitterTag('twitter:site', '@mazu_hotpot');
        
        // 更新 twitter:creator
        this.updateTwitterTag('twitter:creator', '@mazu_hotpot');
    }
    
    /**
     * 更新單個 Twitter Card 標籤
     */
    updateTwitterTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }
    
    /**
     * 更新結構化資料
     */
    updateStructuredData(data, lang) {
        const structuredData = this.generateStructuredData(data, lang);
        
        // 移除舊的結構化資料
        const oldScript = document.querySelector('script[type="application/ld+json"]');
        if (oldScript) {
            oldScript.remove();
        }
        
        // 添加新的結構化資料
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
    }
    
    /**
     * 生成結構化資料
     */
    generateStructuredData(data, lang) {
        const baseData = {
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": lang === 'zh' ? "麻煮MINI石頭火鍋" : "Mazu MINI Stone Hot Pot",
            "description": data.description,
            "url": data.url,
            "telephone": "+886-2-2345-6789",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "汀州路三段 273 號",
                "addressLocality": "台北市",
                "addressRegion": "中正區",
                "postalCode": "100",
                "addressCountry": "TW"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 25.0120,
                "longitude": 121.5340
            },
            "openingHours": "Mo-Su 11:00-22:00",
            "priceRange": "$$",
            "servesCuisine": ["火鍋", "麻辣鍋", "石頭鍋"],
            "menu": `${window.location.origin}/menu`,
            "acceptsReservations": true,
            "deliveryService": true,
            "takeout": true,
            "image": [
                data.image,
                "/static/img/logo/MAZU.webp",
                "/static/img/logo/首頁大圖.jpg"
            ],
            "logo": "/static/img/logo/MAZU.webp",
            "sameAs": [
                "https://www.facebook.com/mazu.hotpot",
                "https://www.instagram.com/mazu_hotpot"
            ]
        };
        
        // 根據頁面類型添加特定資料
        if (this.currentPage === 'home') {
            baseData["@type"] = "WebSite";
            baseData["potentialAction"] = {
                "@type": "SearchAction",
                "target": `${window.location.origin}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            };
        }
        
        return baseData;
    }
    
    /**
     * 更新頁面標題
     */
    updatePageTitle(title) {
        if (title) {
            document.title = title;
        }
    }
    
    /**
     * 更新 Canonical URL
     */
    updateCanonicalURL() {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        
        canonical.href = window.location.href.split('?')[0]; // 移除查詢參數
    }
    
    /**
     * 添加麵包屑導航結構化資料
     */
    addBreadcrumbStructuredData() {
        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": this.generateBreadcrumbItems()
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(breadcrumbData, null, 2);
        document.head.appendChild(script);
    }
    
    /**
     * 生成麵包屑項目
     */
    generateBreadcrumbItems() {
        const items = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "首頁",
                "item": window.location.origin
            }
        ];
        
        const page = this.currentPage;
        if (page !== 'home') {
            const pageNames = {
                'about': '關於麻煮',
                'menu': '菜單資訊',
                'news': '麻煮快訊',
                'love': '愛心公益'
            };
            
            items.push({
                "@type": "ListItem",
                "position": 2,
                "name": pageNames[page] || '頁面',
                "item": `${window.location.origin}/${page}`
            });
        }
        
        return items;
    }
    
    /**
     * 添加 FAQ 結構化資料
     */
    addFAQStructuredData() {
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "麻煮的特色是什麼？",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "麻煮以個人石頭鍋為特色，結合多元麻香，傳承媽祖精神，提供台式熱騰騰的幸福滋味。"
                    }
                },
                {
                    "@type": "Question",
                    "name": "營業時間是？",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "營業時間為每日 11:00-22:00"
                    }
                },
                {
                    "@type": "Question",
                    "name": "有外送服務嗎？",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "是的，我們提供外送和外帶服務"
                    }
                }
            ]
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(faqData, null, 2);
        document.head.appendChild(script);
    }
    
    /**
     * 添加組織結構化資料
     */
    addOrganizationStructuredData() {
        const orgData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "麻煮MINI石頭火鍋",
            "url": window.location.origin,
            "logo": "/static/img/logo/MAZU.webp",
            "description": "源自台灣信仰媽祖為靈感，傳統石頭小火鍋結合多元麻香，帶來台式熱騰騰的幸福滋味。",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "汀州路三段 273 號",
                "addressLocality": "台北市",
                "addressRegion": "中正區",
                "postalCode": "100",
                "addressCountry": "TW"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+886-2-2345-6789",
                "contactType": "customer service",
                "availableLanguage": ["Chinese", "English"]
            },
            "sameAs": [
                "https://www.facebook.com/mazu.hotpot",
                "https://www.instagram.com/mazu_hotpot"
            ]
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(orgData, null, 2);
        document.head.appendChild(script);
    }
    
    /**
     * 更新所有 SEO 元素
     */
    updateAllSEO() {
        if (!this.isInitialized) return;
        
        const currentLang = this.getCurrentLanguage();
        this.updateSEOForLanguage(currentLang);
        
        // 添加額外的結構化資料
        this.addBreadcrumbStructuredData();
        this.addFAQStructuredData();
        this.addOrganizationStructuredData();
    }
    
    /**
     * 獲取 SEO 狀態
     */
    getSEOStatus() {
        return {
            isInitialized: this.isInitialized,
            currentPage: this.currentPage,
            currentLanguage: this.getCurrentLanguage(),
            metaTags: this.getMetaTagsStatus(),
            openGraph: this.getOpenGraphStatus(),
            structuredData: this.getStructuredDataStatus()
        };
    }
    
    /**
     * 獲取 Meta 標籤狀態
     */
    getMetaTagsStatus() {
        const required = ['title', 'description', 'keywords', 'author', 'robots'];
        const status = {};
        
        required.forEach(tag => {
            const meta = document.querySelector(`meta[name="${tag}"]`);
            status[tag] = {
                exists: !!meta,
                content: meta ? meta.getAttribute('content') : null
            };
        });
        
        return status;
    }
    
    /**
     * 獲取 Open Graph 狀態
     */
    getOpenGraphStatus() {
        const required = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
        const status = {};
        
        required.forEach(tag => {
            const meta = document.querySelector(`meta[property="${tag}"]`);
            status[tag] = {
                exists: !!meta,
                content: meta ? meta.getAttribute('content') : null
            };
        });
        
        return status;
    }
    
    /**
     * 獲取結構化資料狀態
     */
    getStructuredDataStatus() {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        return {
            count: scripts.length,
            exists: scripts.length > 0
        };
    }
}

// 全域 SEO 管理器實例
window.seoManager = new SEOManager();

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOManager;
}
