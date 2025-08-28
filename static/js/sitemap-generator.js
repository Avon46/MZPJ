/**
 * 網站地圖生成器
 * 動態產生 XML 和 HTML 格式的網站地圖
 */
class SitemapGenerator {
    constructor() {
        this.baseURL = window.location.origin;
        this.pages = [
            {
                url: '/',
                title: '首頁',
                titleEn: 'Home',
                priority: '1.0',
                changefreq: 'daily',
                lastmod: new Date().toISOString().split('T')[0]
            },
            {
                url: '/about',
                title: '關於麻煮',
                titleEn: 'About Mazu',
                priority: '0.8',
                changefreq: 'weekly',
                lastmod: new Date().toISOString().split('T')[0]
            },
            {
                url: '/menu',
                title: '菜單資訊',
                titleEn: 'Menu',
                priority: '0.9',
                changefreq: 'weekly',
                lastmod: new Date().toISOString().split('T')[0]
            },
            {
                url: '/news',
                title: '麻煮快訊',
                titleEn: 'News',
                priority: '0.7',
                changefreq: 'daily',
                lastmod: new Date().toISOString().split('T')[0]
            },
            {
                url: '/love',
                title: '愛心公益',
                titleEn: 'Charity',
                priority: '0.6',
                changefreq: 'monthly',
                lastmod: new Date().toISOString().split('T')[0]
            },
            {
                url: '/sitemap',
                title: '網站地圖',
                titleEn: 'Sitemap',
                priority: '0.5',
                changefreq: 'monthly',
                lastmod: new Date().toISOString().split('T')[0]
            }
        ];
        
        this.init();
    }

    /**
     * 初始化網站地圖生成器
     */
    init() {
        console.log('🌐 網站地圖生成器已初始化');
        this.setupEventListeners();
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 監聽語言切換事件
        if (window.i18nManager) {
            window.i18nManager.addEventListener('languageChanged', (event) => {
                this.updateSitemapLanguage(event.detail.language);
            });
        }
    }

    /**
     * 產生 XML 格式的網站地圖
     * @returns {string} XML 格式的網站地圖
     */
    generateXMLSitemap() {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.pages.map(page => `  <url>
    <loc>${this.baseURL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
        
        return xml;
    }

    /**
     * 產生 HTML 格式的網站地圖
     * @param {string} lang 語言 (zh/en)
     * @returns {string} HTML 格式的網站地圖
     */
    generateHTMLSitemap(lang = 'zh') {
        const isChinese = lang === 'zh';
        const title = isChinese ? '網站地圖' : 'Sitemap';
        const subtitle = isChinese ? '麻煮MINI石頭火鍋網站導覽' : 'Mazu MINI Stone Hot Pot Site Navigation';
        const lastUpdated = isChinese ? '最後更新' : 'Last Updated';
        const pageTitle = isChinese ? '頁面標題' : 'Page Title';
        const updateFrequency = isChinese ? '更新頻率' : 'Update Frequency';
        const priority = isChinese ? '優先級' : 'Priority';

        const html = `<!DOCTYPE html>
<html lang="${isChinese ? 'zh-Hant' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${isChinese ? '麻煮MINI石頭火鍋' : 'Mazu MINI Stone Hot Pot'}</title>
    <link rel="stylesheet" href="static/css/style.css">
    <link rel="stylesheet" href="static/css/i18n.css">
    <style>
        .sitemap-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .sitemap-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .sitemap-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .sitemap-table th,
        .sitemap-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .sitemap-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .sitemap-table tr:hover {
            background-color: #f9f9f9;
        }
        .sitemap-link {
            color: #007bff;
            text-decoration: none;
        }
        .sitemap-link:hover {
            text-decoration: underline;
        }
        .sitemap-actions {
            margin-top: 30px;
            text-align: center;
        }
        .sitemap-btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 0 10px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .sitemap-btn:hover {
            background-color: #0056b3;
        }
        .sitemap-btn.download {
            background-color: #28a745;
        }
        .sitemap-btn.download:hover {
            background-color: #1e7e34;
        }
        .sitemap-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .sitemap-info h3 {
            margin-top: 0;
            color: #495057;
        }
        .sitemap-info ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .sitemap-info li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="sitemap-container">
        <div class="sitemap-header">
            <h1>${title}</h1>
            <p>${subtitle}</p>
            <p><strong>${lastUpdated}:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="sitemap-info">
            <h3>${isChinese ? '網站地圖說明' : 'Sitemap Information'}</h3>
            <ul>
                <li>${isChinese ? '此網站地圖幫助搜尋引擎和訪客了解網站結構' : 'This sitemap helps search engines and visitors understand the site structure'}</li>
                <li>${isChinese ? '包含所有主要頁面的連結、更新頻率和優先級資訊' : 'Includes links, update frequency, and priority information for all main pages'}</li>
                <li>${isChinese ? '定期更新以確保搜尋引擎能正確索引網站內容' : 'Regularly updated to ensure search engines can properly index site content'}</li>
            </ul>
        </div>

        <table class="sitemap-table">
            <thead>
                <tr>
                    <th>${pageTitle}</th>
                    <th>URL</th>
                    <th>${lastUpdated}</th>
                    <th>${updateFrequency}</th>
                    <th>${priority}</th>
                </tr>
            </thead>
            <tbody>
                ${this.pages.map(page => `
                <tr>
                    <td>${isChinese ? page.title : page.titleEn}</td>
                    <td><a href="${page.url}" class="sitemap-link">${page.url}</a></td>
                    <td>${page.lastmod}</td>
                    <td>${page.changefreq}</td>
                    <td>${page.priority}</td>
                </tr>`).join('')}
            </tbody>
        </table>

        <div class="sitemap-actions">
            <a href="${this.baseURL}/" class="sitemap-btn">${isChinese ? '回到首頁' : 'Back to Home'}</a>
            <a href="#" class="sitemap-btn download" onclick="downloadXMLSitemap()">${isChinese ? '下載 XML 地圖' : 'Download XML Sitemap'}</a>
            <a href="${this.baseURL}/sitemap.xml" class="sitemap-btn" target="_blank">${isChinese ? '查看 XML 地圖' : 'View XML Sitemap'}</a>
        </div>
    </div>

    <script>
        function downloadXMLSitemap() {
            const xml = \`${this.generateXMLSitemap()}\`;
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
        
        return html;
    }

    /**
     * 更新網站地圖語言
     * @param {string} lang 語言 (zh/en)
     */
    updateSitemapLanguage(lang) {
        console.log(`🌐 更新網站地圖語言為: ${lang}`);
        // 這裡可以更新頁面上的語言相關內容
        // 如果是在網站地圖頁面上，可以重新渲染內容
    }

    /**
     * 下載 XML 網站地圖
     */
    downloadXMLSitemap() {
        const xml = this.generateXMLSitemap();
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('📥 XML 網站地圖已下載');
    }

    /**
     * 取得網站地圖狀態
     * @returns {object} 網站地圖狀態資訊
     */
    getSitemapStatus() {
        return {
            totalPages: this.pages.length,
            lastUpdated: new Date().toISOString(),
            baseURL: this.baseURL,
            pages: this.pages.map(page => ({
                url: page.url,
                title: page.title,
                priority: page.priority,
                changefreq: page.changefreq,
                lastmod: page.lastmod
            }))
        };
    }

    /**
     * 新增頁面到網站地圖
     * @param {object} page 頁面資訊
     */
    addPage(page) {
        this.pages.push({
            ...page,
            lastmod: page.lastmod || new Date().toISOString().split('T')[0]
        });
        console.log(`➕ 新增頁面到網站地圖: ${page.url}`);
    }

    /**
     * 更新頁面資訊
     * @param {string} url 頁面 URL
     * @param {object} updates 更新資訊
     */
    updatePage(url, updates) {
        const pageIndex = this.pages.findIndex(page => page.url === url);
        if (pageIndex !== -1) {
            this.pages[pageIndex] = { ...this.pages[pageIndex], ...updates };
            console.log(`✏️ 更新頁面資訊: ${url}`);
        }
    }

    /**
     * 移除頁面
     * @param {string} url 頁面 URL
     */
    removePage(url) {
        const pageIndex = this.pages.findIndex(page => page.url === url);
        if (pageIndex !== -1) {
            this.pages.splice(pageIndex, 1);
            console.log(`🗑️ 移除頁面: ${url}`);
        }
    }
}

// 全域實例
window.sitemapGenerator = new SitemapGenerator();
