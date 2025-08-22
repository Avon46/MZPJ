/**
 * 麻煮MINI石頭火鍋 - 前端主要 JavaScript 模組
 * 處理共用交互功能：漢堡選單、回到頂部、菜單SPA
 * 
 * @author 麻煮開發團隊
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // === 工具函數 ===
    
    /**
     * 簡化的 querySelector
     * @param {string} selector CSS 選擇器
     * @returns {Element|null} 找到的元素
     */
    function qs(selector) {
        return document.querySelector(selector);
    }
    
    /**
     * 簡化的 querySelectorAll，回傳陣列
     * @param {string} selector CSS 選擇器
     * @returns {Element[]} 找到的元素陣列
     */
    function qsa(selector) {
        return Array.from(document.querySelectorAll(selector));
    }
    
    /**
     * 防抖動函數
     * @param {Function} func 要執行的函數
     * @param {number} delay 延遲時間(ms)
     * @returns {Function} 防抖動後的函數
     */
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * 節流函數
     * @param {Function} func 要執行的函數
     * @param {number} delay 節流間隔(ms)
     * @returns {Function} 節流後的函數
     */
    function throttle(func, delay) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                func.apply(this, args);
            }
        };
    }

    // === 導航管理器 ===
    
    class NavigationManager {
        constructor() {
            this.hamburger = qs('#hamburger');
            this.mobileNav = qs('#mobile-nav');
            this.mobileNavClose = qs('#mobile-nav-close');
            this.isOpen = false;
            
            this.init();
        }
        
        init() {
            if (!this.hamburger || !this.mobileNav) {
                console.warn('Navigation elements not found');
                return;
            }
            
            this.bindEvents();
            this.setupAccessibility();
        }
        
        bindEvents() {
            // 漢堡選單點擊
            this.hamburger.addEventListener('click', () => this.toggle());
            
            // 關閉按鈕點擊
            if (this.mobileNavClose) {
                this.mobileNavClose.addEventListener('click', () => this.close());
            }
            
            // 導航連結點擊
            qsa('.mobile-nav__link').forEach(link => {
                link.addEventListener('click', () => this.close());
            });
            
            // 點擊遮罩關閉
            this.mobileNav.addEventListener('click', (e) => {
                if (e.target === this.mobileNav) this.close();
            });
            
            // ESC 鍵關閉
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            });
            
            // 響應式處理
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= 769 && this.isOpen) {
                    this.close();
                }
            }, 250));
        }
        
        setupAccessibility() {
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.hamburger.setAttribute('aria-controls', 'mobile-nav');
            this.mobileNav.setAttribute('aria-hidden', 'true');
        }
        
        open() {
            this.isOpen = true;
            this.hamburger.classList.add('active');
            this.mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 無障礙屬性更新
            this.hamburger.setAttribute('aria-expanded', 'true');
            this.mobileNav.setAttribute('aria-hidden', 'false');
        }
        
        close() {
            this.isOpen = false;
            this.hamburger.classList.remove('active');
            this.mobileNav.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // 無障礙屬性更新
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.mobileNav.setAttribute('aria-hidden', 'true');
        }
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    }

    // === 回到頂部管理器 ===
    
    class BackToTopManager {
        constructor() {
            this.button = qs('#back-to-top');
            this.init();
        }
        
        init() {
            if (!this.button) {
                console.warn('Back to top button not found');
                return;
            }
            
            this.bindEvents();
        }
        
        bindEvents() {
            // 滾動事件
            window.addEventListener('scroll', throttle(() => {
                if (window.pageYOffset > 300) {
                    this.button.classList.add('show');
                } else {
                    this.button.classList.remove('show');
                }
            }, 100));
            
            // 點擊事件
            this.button.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // === 菜單 SPA 管理器 ===
    
    class MenuSPAManager {
        constructor() {
            this.menuContent = qs('#menu-content');
            this.menuNav = qs('#menu-nav');
            this.menuTemplates = this.getMenuTemplates();
            this.init();
        }
        
        init() {
            if (!this.menuContent || !this.menuNav) {
                console.warn('Menu SPA elements not found');
                return;
            }
            
            this.bindEvents();
            this.handleHashChange();
        }
        
        getMenuTemplates() {
            return {
                'combo-packages': `
                    <section id="combo-packages" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title">組合套餐</h2>
                            <div class="menu-cards">
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="麻煮合餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">麻煮合餐</h3>
                                        <p class="menu-card__description">招牌湯底 + 精選肉品 + 新鮮蔬菜 + 特色配餐</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/雙人合餐.webp" alt="雙人合餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">雙人合餐</h3>
                                        <p class="menu-card__description">雙倍份量，適合兩人共享的美味體驗</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="招牌套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">招牌套餐</h3>
                                        <p class="menu-card__description">麻煮最受歡迎的經典組合，必點推薦</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="情侶合餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">情侶合餐</h3>
                                        <p class="menu-card__description">浪漫雙人套餐，甜蜜共享時光</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="大海陸套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">大海陸套餐</h3>
                                        <p class="menu-card__description">海鮮 + 肉品雙重享受，豪華美味</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="海鮮套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">海鮮套餐</h3>
                                        <p class="menu-card__description">新鮮海鮮精選，海洋的鮮美滋味</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="蔬食套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title">蔬食套餐</h3>
                                        <p class="menu-card__description">新鮮蔬菜 + 菇類，健康美味選擇</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li>菜單略有差異，依現場為準</li>
                                <li>圖片僅供參考</li>
                                <li>菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `,
                'small-pots': `
                    <section id="small-pots" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title">小鍋系列</h2>
                            <div class="pot-series">
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/麻辣牛奶.webp" alt="獨門麻辣牛奶小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title">獨門麻辣牛奶小鍋</h3>
                                        <div class="pot-options"><span class="pot-option">雪花牛肉</span><span class="pot-option">小羔羊肉</span><span class="pot-option">梅花豬肉</span></div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/紅油麻辣.webp" alt="招牌紅油麻辣小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title">招牌紅油麻辣小鍋</h3>
                                        <div class="pot-options"><span class="pot-option">雪花牛肉</span><span class="pot-option">小羔羊肉</span><span class="pot-option">梅花豬肉</span></div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/石頭鍋.webp" alt="台式爆香石頭小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title">台式爆香石頭小鍋</h3>
                                        <div class="pot-options"><span class="pot-option">雪花牛肉</span><span class="pot-option">小羔羊肉</span><span class="pot-option">梅花豬肉</span></div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/香濃起士牛奶鍋.webp" alt="香濃起士牛奶小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title">香濃起士牛奶小鍋</h3>
                                        <div class="pot-options"><span class="pot-option">雪花牛肉</span><span class="pot-option">小羔羊肉</span><span class="pot-option">梅花豬肉</span></div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/菜單大圖.jpg" alt="平日限定小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title">平日限定小鍋</h3>
                                        <div class="pot-options"><span class="pot-option">雪花牛肉</span><span class="pot-option">小羔羊肉</span><span class="pot-option">梅花豬肉</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li>菜單略有差異，依現場為準</li>
                                <li>圖片僅供參考</li>
                                <li>菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `,
                'mini-series': `
                    <section id="mini-series" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title">Mini麻辣燙</h2>
                            <div class="mini-cards">
                                <div class="mini-card">
                                    <div class="mini-card__image">
                                        <img src="/static/img/logo/麻辣五更綜合煲.webp" alt="麻辣五更綜合煲" loading="lazy">
                                    </div>
                                    <div class="mini-card__content">
                                        <h3 class="mini-card__title">麻辣五更綜合煲</h3>
                                        <p class="mini-card__description">含：魯肉飯、酸辣粉、烏龍麵、王子麵、寬冬粉、白飯</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li>菜單略有差異，依現場為準</li>
                                <li>圖片僅供參考</li>
                                <li>菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `,
                'mz-exclusive': `
                    <section id="mz-exclusive" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title">麻煮限定</h2>
                            <div class="exclusive-grid">
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷三媽.webp" alt="辣滷三媽（大、小）" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">辣滷三媽（大、小）</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷肥腸旺.webp" alt="辣滷肥腸旺" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">辣滷肥腸旺</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷雙怪.webp" alt="辣滷雙怪" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">辣滷雙怪</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷嫩鴨血.webp" alt="辣滷嫩鴨血" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">辣滷嫩鴨血</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷臭豆腐.webp" alt="辣滷臭豆腐" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">辣滷臭豆腐</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/黑麻麵.webp" alt="黑麻麵" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">黑麻麵</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/麻小麵.webp" alt="麻小麵" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">麻小麵</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/脆皮臭豆腐.webp" alt="脆皮臭豆腐" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">脆皮臭豆腐</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/脆皮炸雞翅.webp" alt="脆皮炸雞翅" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">脆皮炸雞翅</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/酸溜土豆絲.webp" alt="酸溜土豆絲" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title">酸溜土豆絲</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li>菜單略有差異，依現場為準</li>
                                <li>圖片僅供參考</li>
                                <li>菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `
            };
        }
        
        bindEvents() {
            // 導航點擊事件
            this.menuNav.addEventListener('click', (e) => this.handleNavClick(e));
            
            // Hero 區 CTA 按鈕點擊事件
            const heroCta = qs('.menu-hero__cta');
            if (heroCta) {
                heroCta.addEventListener('click', (e) => this.handleHeroClick(e));
            }
            
            // 監聽 hash 變化
            window.addEventListener('hashchange', () => this.handleHashChange());
        }
        
        loadMenuContent(sectionId) {
            if (this.menuTemplates[sectionId]) {
                // 添加淡入效果
                this.menuContent.style.opacity = '0';
                this.menuContent.style.transition = 'opacity 0.3s ease';
                
                this.menuContent.innerHTML = this.menuTemplates[sectionId];
                
                // 更新導航狀態
                qsa('.menu-nav__link').forEach(link => {
                    link.classList.remove('is-active');
                });
                
                const activeLink = qs(`[data-section="${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('is-active');
                }
                
                // 淡入效果
                setTimeout(() => {
                    this.menuContent.style.opacity = '1';
                }, 50);
                
                // 平滑滾動到內容頂部
                this.menuContent.scrollIntoView({ behavior: 'smooth' });
                
                // 更新頁面標題
                const sectionTitle = this.getSectionTitle(sectionId);
                if (sectionTitle) {
                    document.title = `${sectionTitle}｜麻煮MINI石頭火鍋`;
                }
            }
        }
        
        getSectionTitle(sectionId) {
            const titles = {
                'combo-packages': '組合套餐',
                'small-pots': '小鍋系列',
                'mini-series': 'Mini / 麻辣燙',
                'mz-exclusive': '麻煮限定'
            };
            return titles[sectionId] || '';
        }
        
        handleNavClick(e) {
            e.preventDefault();
            const link = e.target.closest('.menu-nav__link');
            if (link) {
                const sectionId = link.getAttribute('data-section');
                if (sectionId) {
                    window.location.hash = sectionId;
                    this.loadMenuContent(sectionId);
                }
            }
        }
        
        handleHeroClick(e) {
            const link = e.target.closest('.menu-hero__cta-btn');
            if (link) {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                if (sectionId) {
                    window.location.hash = sectionId;
                    this.loadMenuContent(sectionId);
                }
            }
        }
        
        handleHashChange() {
            const hash = window.location.hash.substring(1);
            if (hash && this.menuTemplates[hash]) {
                this.loadMenuContent(hash);
            } else {
                // 預設載入組合套餐
                this.loadMenuContent('combo-packages');
            }
        }
    }

    // === 應用程式初始化 ===
    
    class App {
        constructor() {
            this.navigationManager = null;
            this.backToTopManager = null;
            this.menuSPAManager = null;
        }
        
        init() {
            try {
                this.navigationManager = new NavigationManager();
                this.backToTopManager = new BackToTopManager();
                this.menuSPAManager = new MenuSPAManager();
                
                console.log('麻煮MINI石頭火鍋前端應用程式初始化完成');
            } catch (error) {
                console.error('應用程式初始化失敗:', error);
            }
        }
    }
    
    // === DOM 載入完成後初始化 ===
    
    function domReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    // 初始化應用程式
    domReady(() => {
        const app = new App();
        app.init();
    });
    
})();


