/**
 * 麻煮MINI石頭火鍋 - 前端主要 JavaScript 模組
 * 處理共用交互功能：漢堡選單、回到頂部、菜單SPA
 * 
 * @author 麻煮開發團隊
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // === 使用現有的 i18n 系統 ===
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
            this.hamburger = qs('#hamburger'); // 漢堡選單按鈕
            this.mobileDrawer = qs('#mobile-drawer'); // 新的抽屜導覽
            this.backdrop = qs('#backdrop'); // 背景遮罩
            this.isOpen = false;
            this.focusableElements = null;
            this.firstFocusable = null;
            this.lastFocusable = null;
            
            this.init();
        }
        
        init() {
            if (!this.hamburger || !this.mobileDrawer) {
                console.warn('Navigation elements not found - 漢堡選單可能無法顯示');
                console.warn('hamburger element:', this.hamburger);
                console.warn('mobileDrawer element:', this.mobileDrawer);
                return;
            }
            
            console.log('✅ 新抽屜導覽系統已成功初始化');
            
            this.bindEvents();
            this.setupAccessibility();
            this.setupFocusManagement();
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
            // 移除對已刪除的 #menu-nav 的依賴
            this.menuTemplates = this.getMenuTemplates();
            this.init();
        }
        
        init() {
            if (!this.menuContent) {
                console.warn('Menu content element not found');
                return;
            }
            
            this.bindEvents();
            
            // 延遲一點載入，確保所有元素都已就緒
            setTimeout(() => {
            this.handleHashChange();
            }, 100);
            
            // 初始化愛心公益頁面側邊導覽列顯示狀態（已由 subnav-rail.js 處理）
            // this.initializeLoveSideNav();
        }
        
        getMenuTemplates() {
            return {
                'combo-packages': `
                    <section id="combo-packages" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title" data-i18n="menu.combo.title">組合套餐</h2>
                            <div class="menu-cards">
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="麻煮合餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo1.title">麻煮合餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo1.description">招牌湯底 + 精選肉品 + 新鮮蔬菜 + 特色配餐</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/雙人合餐.webp" alt="雙人合餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo2.title">雙人合餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo2.description">雙倍份量，適合兩人共享的美味體驗</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="招牌套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo3.title">招牌套餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo3.description">麻煮最受歡迎的經典組合，必點推薦</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="情侶合餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo4.title">情侶合餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo4.description">浪漫雙人套餐，甜蜜共享時光</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="大海陸套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo5.title">大海陸套餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo5.description">海鮮 + 肉品雙重享受，豪華美味</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="海鮮套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo6.title">海鮮套餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo6.description">新鮮海鮮精選，海洋的鮮美滋味</p>
                                    </div>
                                </div>
                                <div class="menu-card">
                                    <div class="menu-card__image">
                                        <img src="/static/img/logo/圖片待補.webp" alt="蔬食套餐" loading="lazy">
                                    </div>
                                    <div class="menu-card__content">
                                        <h3 class="menu-card__title" data-i18n="menu.combo.cards.combo7.title">蔬食套餐</h3>
                                        <p class="menu-card__description" data-i18n="menu.combo.cards.combo7.description">新鮮蔬菜 + 菇類，健康美味選擇</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title" data-i18n="menu.combo.notice.title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li data-i18n="menu.combo.notice.items.0">菜單略有差異，依現場為準</li>
                                <li data-i18n="menu.combo.notice.items.1">圖片僅供參考</li>
                                <li data-i18n="menu.combo.notice.items.2">菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `,
                'small-pots': `
                    <section id="small-pots" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title" data-i18n="menu.small.title">小鍋系列</h2>
                            <div class="pot-series">
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/麻辣牛奶.webp" alt="獨門麻辣牛奶小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title" data-i18n="menu.small.pots.milk.title">獨門麻辣牛奶小鍋</h3>
                                        <div class="pot-options">
                                            <span class="pot-option" data-i18n="menu.small.meat_options.snowflake_beef">雪花牛肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.lamb_shoulder">小羔羊肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.pork_collar">梅花豬肉</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/紅油麻辣.webp" alt="招牌紅油麻辣小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title" data-i18n="menu.small.pots.spicy.title">招牌紅油麻辣小鍋</h3>
                                        <div class="pot-options">
                                            <span class="pot-option" data-i18n="menu.small.meat_options.snowflake_beef">雪花牛肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.lamb_shoulder">小羔羊肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.pork_collar">梅花豬肉</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/石頭鍋.webp" alt="台式爆香石頭小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title" data-i18n="menu.small.pots.stone.title">台式爆香石頭小鍋</h3>
                                        <div class="pot-options">
                                            <span class="pot-option" data-i18n="menu.small.meat_options.snowflake_beef">雪花牛肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.lamb_shoulder">小羔羊肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.pork_collar">梅花豬肉</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/香濃起士牛奶鍋.webp" alt="香濃起士牛奶小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title" data-i18n="menu.small.pots.cheese.title">香濃起士牛奶小鍋</h3>
                                        <div class="pot-options">
                                            <span class="pot-option" data-i18n="menu.small.meat_options.snowflake_beef">雪花牛肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.pork_collar">梅花豬肉</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pot-item">
                                    <div class="pot-item__image">
                                        <img src="/static/img/logo/菜單大圖.jpg" alt="平日限定小鍋" loading="lazy">
                                    </div>
                                    <div class="pot-item__content">
                                        <h3 class="pot-title" data-i18n="menu.small.pots.weekday.title">平日限定小鍋</h3>
                                        <div class="pot-options">
                                            <span class="pot-option" data-i18n="menu.small.meat_options.snowflake_beef">雪花牛肉</span>
                                            <span class="pot-option" data-i18n="menu.small.meat_options.lamb_shoulder">小羔羊肉</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title" data-i18n="menu.combo.notice.title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li data-i18n="menu.combo.notice.items.0">菜單略有差異，依現場為準</li>
                                <li data-i18n="menu.combo.notice.items.1">圖片僅供參考</li>
                                <li data-i18n="menu.combo.notice.items.2">菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `,
                'mini-series': `
                    <section id="mini-series" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title" data-i18n="menu.mini.title">Mini麻辣燙</h2>
                            <div class="mini-cards">
                                <div class="mini-card">
                                    <div class="mini-card__image">
                                        <img src="/static/img/logo/麻辣五更綜合煲.webp" alt="麻辣五更綜合煲" loading="lazy">
                                    </div>
                                    <div class="mini-card__content">
                                        <h3 class="mini-card__title" data-i18n="menu.mini.items.combo.title">麻辣五更綜合煲</h3>
                                        <p class="mini-card__description" data-i18n="menu.mini.items.combo.description">含：魯肉飯、酸辣粉、烏龍麵、王子麵、寬冬粉、白飯</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title" data-i18n="menu.combo.notice.title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li data-i18n="menu.combo.notice.items.0">菜單略有差異，依現場為準</li>
                                <li data-i18n="menu.combo.notice.items.1">圖片僅供參考</li>
                                <li data-i18n="menu.combo.notice.items.2">菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `,
                'mz-exclusive': `
                    <section id="mz-exclusive" class="menu-section">
                        <div class="menu-section__container">
                            <h2 class="menu-section__title" data-i18n="menu.exclusive.title">麻煮限定</h2>
                            <div class="exclusive-grid">
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷三媽.webp" alt="辣滷三媽（大、小）" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.spicy_mama">辣滷三媽（大、小）</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷肥腸旺.webp" alt="辣滷肥腸旺" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.intestine">辣滷肥腸旺</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷雙怪.webp" alt="辣滷雙怪" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.double_monster">辣滷雙怪</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷嫩鴨血.webp" alt="辣滷嫩鴨血" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.duck_blood">辣滷嫩鴨血</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/辣滷臭豆腐.webp" alt="辣滷臭豆腐" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.stinky_tofu">辣滷臭豆腐</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/黑麻麵.webp" alt="黑麻麵" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.black_noodle">黑麻麵</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/麻小麵.webp" alt="麻小麵" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.small_noodle">麻小麵</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/脆皮臭豆腐.webp" alt="脆皮臭豆腐" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.crispy_tofu">脆皮臭豆腐</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/脆皮炸雞翅.webp" alt="脆皮炸雞翅" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.crispy_wings">脆皮炸雞翅</h3>
                                    </div>
                                </div>
                                <div class="exclusive-item">
                                    <div class="exclusive-item__image">
                                        <img src="/static/img/logo/酸溜土豆絲.webp" alt="酸溜土豆絲" loading="lazy">
                                    </div>
                                    <div class="exclusive-item__content">
                                        <h3 class="exclusive-title" data-i18n="menu.exclusive.items.potato_strips">酸溜土豆絲</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="menu-notice">
                        <div class="menu-notice__container">
                            <h2 class="menu-notice__title" data-i18n="menu.combo.notice.title">注意事項</h2>
                            <ul class="menu-notice__list">
                                <li data-i18n="menu.combo.notice.items.0">菜單略有差異，依現場為準</li>
                                <li data-i18n="menu.combo.notice.items.1">圖片僅供參考</li>
                                <li data-i18n="menu.combo.notice.items.2">菜單內容可能因季節調整，請以現場公告為準</li>
                            </ul>
                        </div>
                    </section>
                `
            };
        }
        
        bindEvents() {
            // 桌面版垂直導覽點擊事件（已由 subnav-rail.js 處理）
         // const sideNav = qs('#menu-side-nav');
         // if (sideNav) {
         //   sideNav.addEventListener('click', (e) => this.handleSideNavClick(e));
         // }
         
         // 愛心公益頁面側邊導覽點擊事件（已由 subnav-rail.js 處理）
         // const loveSideNav = qs('#love-side-nav');
         // if (loveSideNav) {
         //   loveSideNav.addEventListener('click', (e) => this.handleLoveSideNavClick(e));
         // }
       
       // 手機版水平導航點擊事件
             // this.menuNav.addEventListener('click', (e) => this.handleNavClick(e)); // This line was removed
            
            // Hero 區 CTA 按鈕點擊事件
            const heroCta = qs('.menu-hero__cta');
            if (heroCta) {
                heroCta.addEventListener('click', (e) => this.handleHeroClick(e));
            }
            
            // 監聽 hash 變化
            window.addEventListener('hashchange', () => this.handleHashChange());
      
                       // 監聽滾動事件，更新側邊導覽高亮和顯示狀態（已由 subnav-rail.js 處理）
            // window.addEventListener('scroll', throttle(() => {
            //   this.updateSideNavHighlight();
            //   this.handleSideNavVisibility();
            //   // 愛心公益頁面側邊導覽顯示/隱藏和高亮更新
            //   this.handleLoveSideNavVisibility();
            //   this.updateLoveSideNavHighlight();
            // }, 100));
        }
        
        loadMenuContent(sectionId) {
       console.log('載入菜單內容:', sectionId);
       
       if (!this.menuTemplates[sectionId]) {
         console.error('找不到菜單模板:', sectionId);
         return;
       }
       
       // 載入菜單內容
       this.menuContent.innerHTML = this.menuTemplates[sectionId];
       console.log('菜單內容已載入到 DOM');
       
       // 觸發 i18n 更新（使用全域的 i18nManager 實例）
       this.updateMenuI18n();
                
                // 更新頁面標題
                const sectionTitle = this.getSectionTitle(sectionId);
                if (sectionTitle) {
                    document.title = `${sectionTitle}｜麻煮MINI石頭火鍋`;
                }
       
       // 同步更新次導覽的激活狀態和重新初始化
       setTimeout(() => {
         if (window.subnavRailManagers) {
           Object.values(window.subnavRailManagers).forEach(manager => {
             if (manager && typeof manager.collectSections === 'function') {
               manager.collectSections(); // 重新收集區塊
               console.log('次導覽管理器已重新收集區塊');
             }
           });
         }
       }, 50);
       
       console.log('菜單內容載入完成:', sectionId);
     }
        
        /**
         * 更新菜單 i18n 翻譯
         */
        updateMenuI18n() {
            // 嘗試直接調用
            if (typeof i18nManager !== 'undefined' && typeof i18nManager.updateDynamicMenuContent === 'function') {
                setTimeout(() => {
                    i18nManager.updateDynamicMenuContent();
                }, 50);
                return;
            }
            
            // 如果直接調用失敗，等待 i18n 系統初始化
            let attempts = 0;
            const maxAttempts = 10;
            const checkI18n = () => {
                attempts++;
                if (typeof i18nManager !== 'undefined' && typeof i18nManager.updateDynamicMenuContent === 'function') {
                    setTimeout(() => {
                        i18nManager.updateDynamicMenuContent();
                    }, 50);
                    console.log('✅ i18n 系統已就緒，菜單翻譯更新完成');
                } else if (attempts < maxAttempts) {
                    setTimeout(checkI18n, 100);
                } else {
                    console.warn('⚠️ i18n 系統初始化超時，菜單翻譯可能無法更新');
                }
            };
            
            checkI18n();
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
                     
                     // 同步更新 Slim Rail 的激活狀態
                     if (window.subnavRailManagers && window.subnavRailManagers['subnav']) {
                         window.subnavRailManagers['subnav'].updateActiveState(sectionId);
                     }
                }
            }
        }
        
        handleHeroClick(e) {
             const link = e.target.closest('.menu-hero__cta');
            if (link) {
                e.preventDefault();
                 // 點擊 Hero CTA 按鈕時，滾動到菜單內容區域
                 const menuContent = qs('#menu-content');
                 if (menuContent) {
                     menuContent.scrollIntoView({ behavior: 'smooth' });
                     // 載入預設的組合套餐內容
                     this.loadMenuContent('combo-packages');
                 }
             }
         }
    
         /**
      * 更新側邊導覽的高亮狀態（已由 subnav-rail.js 處理）
      */
     // updateSideNavHighlight() {
     //   const sideNavLinks = qsa('.menu-side-nav__link');
     //   if (sideNavLinks.length === 0) return;
     //   
     //   // 移除所有高亮
     //   sideNavLinks.forEach(link => link.classList.remove('is-active'));
     //   
     //   // 找到當前滾動位置對應的區塊
     //   const sections = ['combo-packages', 'small-pots', 'mini-series', 'mz-exclusive'];
     //   const scrollTop = window.pageYOffset;
     //   const windowHeight = window.innerHeight;
     //   
     //   let activeSection = sections[0]; // 預設第一個
     //   
     //   for (let i = sections.length - 1; i >= 0; i >= 0; i--) {
     //     const section = qs(`#${sections[i]}`);
     //     if (section) {
     //       const rect = section.getBoundingClientRect();
     //       // 如果區塊頂部在視窗中間以上，就認為是當前區塊
     //       if (rect.top <= windowHeight / 2) {
     //         activeSection = sections[i];
     //         break;
     //       }
     //     }
     //   }
     //   
     //   // 高亮對應的導覽連結
     //   const activeLink = qs(`.menu-side-nav__link[data-section="${activeSection}"]`);
     //   if (activeLink) {
     //       activeLink.classList.add('is-active');
     //   }
     // }

     /**
      * 更新愛心公益頁面側邊導覽的高亮狀態（已由 subnav-rail.js 處理）
      */
     // updateLoveSideNavHighlight() {
     //   const loveSideNavLinks = qsa('.love-side-nav__link');
     //   if (loveSideNavLinks.length === 0) return;
     //   
     //   // 移除所有高亮
     //   loveSideNavLinks.forEach(link => link.classList.remove('is-active'));
     //   
     //   // 找到當前滾動位置對應的區塊
     //   const sections = ['origin', 'programs', 'guidelines', 'milestones', 'faq'];
     //   const scrollTop = window.pageYOffset;
     //   const windowHeight = window.innerHeight;
     //   
     //   let activeSection = sections[0]; // 預設第一個
     //   
     //   for (let i = sections.length - 1; i >= 0; i--) {
     //     const section = qs(`#${sections[i]}`);
     //     if (section) {
     //       const rect = section.getBoundingClientRect();
     //       // 如果區塊頂部在視窗中間以上，就認為是當前區塊
     //       if (rect.top <= windowHeight / 2) {
     //         activeSection = sections[i];
     //         break;
     //       }
     //     }
     //   }
     //   
     //   // 高亮對應的導覽連結
     //   const activeLink = qs(`.love-side-nav__link[data-section="${activeSection}"]`);
     //   if (activeLink) {
     //     activeLink.classList.add('is-active');
     //   }
     // }
    
         /**
      * 處理側邊導覽的顯示/隱藏（已由 subnav-rail.js 處理）
      */
     // handleSideNavVisibility() {
     //   const sideNav = qs('#menu-side-nav');
     //   if (!sideNav) return;
     //   
     //   // 獲取 Hero 區塊的高度作為觸發點
     //   const heroSection = qs('.menu-hero');
     //   if (!heroSection) return;
     //   
     //   const heroHeight = heroSection.offsetHeight;
     //   const scrollTop = window.pageYOffset;
     //   
     //   // 當滾動超過 Hero 區塊高度的 80% 時顯示導覽列
     //   if (scrollTop > heroHeight * 0.8) {
     //     sideNav.classList.add('is-visible');
     //   } else {
     //     sideNav.classList.remove('is-visible');
     //   }
     // }

     /**
      * 初始化愛心公益頁面側邊導覽列（已由 subnav-rail.js 處理）
      */
     // initializeLoveSideNav() {
     //   const loveSideNav = qs('#love-side-nav');
     //   console.log('愛心公益側邊導覽列元素:', loveSideNav);
     //   
     //   if (loveSideNav) {
     //     // 頁面載入時立即顯示側邊導覽列
     //     loveSideNav.classList.add('is-visible');
     //     console.log('愛心公益側邊導覽列已設為可見');
     //     
     //     // 強制顯示（以防 CSS 覆蓋）
     //     loveSideNav.style.opacity = '1';
     //     loveSideNav.style.visibility = 'visible';
     //     console.log('愛心公益側邊導覽列樣式已強制設定');
     //     
     //     // 初始化高亮狀態
     //     this.updateLoveSideNavHighlight();
     //   } else {
     //     console.warn('找不到愛心公益側邊導覽列元素');
     //   }
     // }

     /**
      * 處理愛心公益頁面側邊導覽的顯示/隱藏（已由 subnav-rail.js 處理）
      */
     // handleLoveSideNavVisibility() {
     //   const loveSideNav = qs('#love-side-nav');
     //   if (!loveSideNav) {
     //     return;
     //   }
     //   
     //   // 獲取 Hero 區塊的高度作為觸發點
     //   const heroSection = qs('.love-hero');
     //   if (!heroSection) return;
     //   
     //   const heroHeight = heroSection.offsetHeight;
     //   const scrollTop = window.pageYOffset;
     //   
     //   // 當滾動超過 Hero 區塊高度的 80% 時顯示導覽列
     //   if (scrollTop > heroHeight * 0.8) {
     //     loveSideNav.classList.add('is-visible');
     //   } else {
     //     loveSideNav.classList.remove('is-visible');
     //   }
     // }
        
        handleHashChange() {
            const hash = window.location.hash.substring(1);
            console.log('URL Hash 變化:', hash);
            
            if (hash && this.menuTemplates[hash]) {
                this.loadMenuContent(hash);
            } else {
                // 預設載入組合套餐
                console.log('載入預設菜單內容: combo-packages');
                this.loadMenuContent('combo-packages');
            }
      
             // 更新側邊導覽顯示狀態（已由 subnav-rail.js 處理）
       // setTimeout(() => {
       //   this.handleSideNavVisibility();
       // }, 100);
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
                // 只在沒有新導覽結構時才使用舊的 NavigationManager
                if (!qs('#mobile-drawer')) {
                this.navigationManager = new NavigationManager();
                }
                
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
         
         // 暴露 MenuSPAManager 實例給全域使用
         if (app.menuSPAManager) {
             window.menuSPAManager = app.menuSPAManager;
         }
         
         // 初始化 Header 滾動效果
         HeaderScrollEffect.init();
    });
    
    // === Header 滾動陰影效果 ===
    
    /**
     * Header 滾動陰影效果管理器
     * 滾動 8px 後為 Header 添加陰影效果
     */
    const HeaderScrollEffect = {
        
        /**
         * 初始化滾動效果
         */
        init() {
            this.header = qs('#header');
            if (!this.header) return;
            
            this.scrollThreshold = 8; // 滾動閾值 8px
            this.setupScrollListener();
        },
        
        /**
         * 設置滾動監聽
         */
        setupScrollListener() {
            let ticking = false;
            
            const updateHeaderShadow = () => {
                const scrollY = window.scrollY || window.pageYOffset;
                
                if (scrollY > this.scrollThreshold) {
                    this.header.classList.add('scrolled');
                } else {
                    this.header.classList.remove('scrolled');
                }
                
                ticking = false;
            };
            
            // 使用 requestAnimationFrame 優化性能
            const onScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(updateHeaderShadow);
                    ticking = true;
                }
            };
            
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    };
    
    // === 新抽屜導覽管理器 ===
    
    /**
     * 新三狀態響應式導覽管理器
     * 支援桌機/平板/手機三種模式，手機版使用抽屜導覽
     */
    class NewNavigationManager {
        constructor() {
            this.hamburger = qs('#hamburger');
            this.mobileDrawer = qs('#mobile-drawer');
            this.backdrop = qs('#backdrop');
            this.isOpen = false;
            this.focusableElements = null;
            this.firstFocusable = null;
            this.lastFocusable = null;
            
            this.init();
        }
        
        init() {
            if (!this.hamburger || !this.mobileDrawer) {
                console.warn('New navigation elements not found');
                return;
            }
            
            console.log('✅ 新抽屜導覽系統已成功初始化');
            
            this.bindEvents();
            this.setupAccessibility();
            this.setupFocusManagement();
        }
        
        bindEvents() {
            // 漢堡選單點擊
            this.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
            
            // 關閉按鈕點擊
            const drawerClose = qs('#drawer-close');
            if (drawerClose) {
                drawerClose.addEventListener('click', () => this.close());
            }
            
            // 背景遮罩點擊關閉
            if (this.backdrop) {
                this.backdrop.addEventListener('click', () => this.close());
            }
            
            // 導航連結點擊自動關閉
            qsa('.nav--mobile .header__nav-link').forEach(link => {
                link.addEventListener('click', () => this.close());
            });
            
            // 語言切換 - 抽屜內的按鈕
            const drawerLangButtons = document.querySelectorAll('#mobile-drawer .lang-option');
            console.log('Found drawer language buttons:', drawerLangButtons.length);
            
            drawerLangButtons.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // 防止事件冒泡
                    const targetLang = e.target.dataset.lang;
                    
                    console.log('Drawer language button clicked:', targetLang);
                    
                    // 使用現有的全域 i18n 系統，添加重試機制
                    const attemptLanguageChange = () => {
                        if (window.i18nManager && window.i18nManager.changeLanguage) {
                            window.i18nManager.changeLanguage(targetLang);
                            console.log('Language change initiated via drawer');
                            return true;
                        }
                        return false;
                    };
                    
                    // 立即嘗試
                    if (!attemptLanguageChange()) {
                        console.log('i18nManager not ready, waiting...');
                        // 如果不可用，等待一下再試
                        setTimeout(() => {
                            if (!attemptLanguageChange()) {
                                console.error('i18nManager still not available after retry');
                            }
                        }, 100);
                    }
                });
            });
            
            // 深色模式切換
            const themeToggle = qs('.drawer-theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    themeToggle.classList.toggle('dark');
                    // 這裡可以添加深色模式邏輯
                    console.log('Theme toggled');
                });
            }
            
            // ESC 鍵關閉
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                    this.hamburger.focus();
                }
            });
            
            // 響應式處理
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= 1400 && this.isOpen) {
                    this.close();
                }
            }, 250));
            
            // 鍵盤 Tab 循環焦點管理
            this.mobileDrawer.addEventListener('keydown', (e) => {
                this.handleFocusTrap(e);
            });
        }
        
        setupAccessibility() {
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.hamburger.setAttribute('aria-controls', 'mobile-drawer');
            this.mobileDrawer.setAttribute('aria-hidden', 'true');
        }
        
        setupFocusManagement() {
            this.focusableElements = qsa('.nav--mobile a[href], .nav--mobile button:not([disabled])');
            if (this.focusableElements.length > 0) {
                this.firstFocusable = this.focusableElements[0];
                this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
            }
        }
        
        handleFocusTrap(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === this.firstFocusable) {
                        e.preventDefault();
                        this.lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === this.lastFocusable) {
                        e.preventDefault();
                        this.firstFocusable.focus();
                    }
                }
            }
        }
        
        open() {
            this.isOpen = true;
            document.body.classList.add('drawer-open');
            this.mobileDrawer.classList.add('is-open');
            if (this.backdrop) {
                this.backdrop.classList.add('is-open');
            }
            
            // 無障礙屬性更新
            this.hamburger.setAttribute('aria-expanded', 'true');
            this.mobileDrawer.setAttribute('aria-hidden', 'false');
            
            // 焦點移到第一個導航連結
            setTimeout(() => {
                const firstNavLink = qs('.nav--mobile .header__nav-link');
                if (firstNavLink) {
                    firstNavLink.focus();
                } else if (this.firstFocusable) {
                    this.firstFocusable.focus();
                }
            }, 200); // 等待動畫完成
        }
        
        close() {
            this.isOpen = false;
            document.body.classList.remove('drawer-open');
            this.mobileDrawer.classList.remove('is-open');
            if (this.backdrop) {
                this.backdrop.classList.remove('is-open');
            }
            
            // 無障礙屬性更新
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.mobileDrawer.setAttribute('aria-hidden', 'true');
        }
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    }
    
    // 初始化新導覽管理器
    domReady(() => {
        // 檢查是否有新的導覽結構
        if (qs('#mobile-drawer')) {
            window.newNavigationManager = new NewNavigationManager();
        }
    });
    
})();


