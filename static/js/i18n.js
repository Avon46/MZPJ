/**
 * 麻煮MINI石頭火鍋 - 全域 i18n 系統
 * Global Internationalization (i18n) System
 * 
 * 功能特色：
 * - 支援中文/英文雙語切換
 * - 語言狀態自動保存到 localStorage
 * - 統一的 Hero slogan 與標語 key
 * - 無閃爍的語言切換體驗
 * - 完整的錯誤處理和日誌記錄
 * - 支援 data-i18n 和 data-i18n-attr 屬性
 */

class I18nManager {
    constructor() {
        // 核心屬性
        this.currentLang = 'zh'; // 預設語言
        this.translations = {}; // 語言檔案內容
        this.isLoaded = false; // 是否已載入語言檔案
        this.isInitialized = false; // 是否已初始化
        
        // DOM 元素引用
        this.dropdown = null;
        this.toggle = null;
        this.menu = null;
        this.currentText = null;
        
        // 狀態管理
        this.isOpen = false;
        this.isLoading = false;
        
        // 語言切換防抖
        this.changeLanguageTimeout = null;
        
        console.log('🚀 I18nManager 全域架構初始化開始');
        
        // 延遲初始化，確保 DOM 已準備好
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * 初始化系統
     */
    async init() {
        if (this.isInitialized) {
            console.log('⚠️ I18nManager 已經初始化過');
            return;
        }
        
        try {
            console.log('🔧 開始初始化全域 I18nManager...');
            
            // 初始化 DOM 元素
            this.initElements();
            
            // 載入語言檔案
            await this.loadTranslations();
            
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 恢復使用者語言偏好
            this.restoreLanguagePreference();
            
            // 標記為已初始化
            this.isInitialized = true;
            
            console.log('✅ 全域 I18nManager 初始化完成');
            
        } catch (error) {
            console.error('❌ 全域 I18nManager 初始化失敗:', error);
            this.showError('語言系統初始化失敗，請重新整理頁面');
        }
    }
    
    /**
     * 初始化 DOM 元素
     */
    initElements() {
        console.log('🔍 尋找 DOM 元素...');
        
        // 尋找語言下拉選單元素
        this.dropdown = document.querySelector('.lang-dropdown');
        this.toggle = document.querySelector('.lang-dropdown__toggle');
        this.menu = document.querySelector('.lang-dropdown__menu');
        this.currentText = document.querySelector('.lang-dropdown__current');
        
        if (!this.dropdown || !this.toggle || !this.menu || !this.currentText) {
            throw new Error('找不到必要的 DOM 元素');
        }
        
        console.log('✅ DOM 元素初始化完成');
    }
    
    /**
     * 載入語言檔案
     */
    async loadTranslations() {
        try {
            console.log('📚 開始載入語言檔案...');
            
            // 載入中文翻譯
            const zhResponse = await fetch('static/langs/zh.json');
            if (!zhResponse.ok) throw new Error('無法載入中文翻譯檔案');
            const zhData = await zhResponse.json();
            
            // 載入英文翻譯
            const enResponse = await fetch('static/langs/en.json');
            if (!enResponse.ok) throw new Error('無法載入英文翻譯檔案');
            const enData = await enResponse.json();
            
            this.translations = {
                zh: zhData,
                en: enData
            };
            
            this.isLoaded = true;
            console.log('✅ 語言檔案載入完成');
            
        } catch (error) {
            console.error('❌ 語言檔案載入失敗:', error);
            throw error;
        }
    }
    
    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        console.log('🎧 設定事件監聽器...');
        
        // 點擊切換按鈕開關下拉選單
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // 點擊語言選項
        const langItems = this.menu.querySelectorAll('.lang-dropdown__item');
        langItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang');
                this.changeLanguage(lang);
                this.closeDropdown();
            });
        });
        
        // 點擊外部關閉下拉選單
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // 鍵盤操作支援
        this.toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDropdown();
            }
        });
        
        // ESC 鍵關閉下拉選單
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
            }
        });
        
        console.log('✅ 事件監聽器設定完成');
    }
    
    /**
     * 開關下拉選單
     */
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    /**
     * 開啟下拉選單
     */
    openDropdown() {
        if (this.isOpen) return;
        
        this.menu.classList.add('is-open');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        
        console.log('📖 下拉選單已開啟');
    }
    
    /**
     * 關閉下拉選單
     */
    closeDropdown() {
        if (!this.isOpen) return;
        
        this.menu.classList.remove('is-open');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        
        console.log('📖 下拉選單已關閉');
    }
    
    /**
     * 恢復使用者語言偏好
     */
    restoreLanguagePreference() {
        try {
            // 從 localStorage 恢復語言設定
            const savedLang = localStorage.getItem('lang');
            if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
                this.currentLang = savedLang;
                console.log(`🔄 從 localStorage 恢復語言偏好: ${savedLang}`);
            } else {
                // 檢查瀏覽器語言
                const browserLang = navigator.language || navigator.userLanguage;
                if (browserLang.startsWith('en')) {
                    this.currentLang = 'en';
                    console.log('🌐 根據瀏覽器語言設定為英文');
                } else {
                    this.currentLang = 'zh';
                    console.log('🌐 根據瀏覽器語言設定為中文');
                }
            }
            
            // 更新 UI 顯示
            this.updateLanguageUI();
            
            // 更新頁面內容
            this.updatePageContent();
            
        } catch (error) {
            console.error('❌ 恢復語言偏好失敗:', error);
            // 使用預設語言
            this.currentLang = 'zh';
            this.updateLanguageUI();
            this.updatePageContent();
        }
    }
    
    /**
     * 更新語言 UI 顯示
     */
    updateLanguageUI() {
        try {
            // 更新當前語言顯示
            if (this.currentText) {
                this.currentText.textContent = this.currentLang === 'zh' ? '中' : 'En';
            }
            
            // 更新選單狀態
        const langItems = this.menu.querySelectorAll('.lang-dropdown__item');
        langItems.forEach(item => {
                const itemLang = item.getAttribute('data-lang');
                if (itemLang === this.currentLang) {
                    item.classList.add('lang-dropdown__item--active');
                } else {
            item.classList.remove('lang-dropdown__item--active');
                }
            });
            
            // 更新抽屜內的語言按鈕狀態
            const drawerLangButtons = document.querySelectorAll('.lang-option');
            drawerLangButtons.forEach(btn => {
                const btnLang = btn.getAttribute('data-lang');
                if (btnLang === this.currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // 更新 HTML lang 屬性
            document.documentElement.lang = this.currentLang === 'zh' ? 'zh-Hant' : 'en';
            
            // 更新 meta 標籤
            this.updateMetaTags();
            
            console.log(`✅ 語言 UI 更新完成: ${this.currentLang}`);
            
        } catch (error) {
            console.error('❌ 更新語言 UI 失敗:', error);
        }
    }
    
    /**
     * 更新 meta 標籤
     */
    updateMetaTags() {
        try {
            // 更新 og:locale
            let ogLocale = document.querySelector('meta[property="og:locale"]');
            if (!ogLocale) {
                ogLocale = document.createElement('meta');
                ogLocale.setAttribute('property', 'og:locale');
                document.head.appendChild(ogLocale);
            }
            ogLocale.setAttribute('content', this.currentLang === 'zh' ? 'zh_TW' : 'en_US');
            
        } catch (error) {
            console.error('❌ 更新 meta 標籤失敗:', error);
        }
    }
    
    /**
     * 切換語言
     */
    changeLanguage(newLang) {
        if (!this.isLoaded || this.currentLang === newLang) {
            return;
        }
        
        // 防抖處理
        if (this.changeLanguageTimeout) {
            clearTimeout(this.changeLanguageTimeout);
        }
        
        this.changeLanguageTimeout = setTimeout(() => {
            this.performLanguageChange(newLang);
        }, 100);
    }
    
    /**
     * 執行語言切換
     */
    performLanguageChange(newLang) {
        try {
            console.log(`🔄 開始切換語言: ${this.currentLang} → ${newLang}`);
            
            // 保存滾動位置和 hash
            const scrollPosition = window.scrollY;
            const currentHash = window.location.hash;
            
            // 更新語言
            this.currentLang = newLang;
            
            // 保存到 localStorage
            try {
                localStorage.setItem('lang', newLang);
                console.log('💾 語言偏好已保存到 localStorage');
            } catch (error) {
                console.warn('⚠️ 無法保存語言偏好到 localStorage:', error);
            }
            
            // 更新 UI
            this.updateLanguageUI();
            
            // 更新頁面內容
            this.updatePageContent();
            
            // 恢復滾動位置和 hash
            setTimeout(() => {
                if (currentHash) {
                    window.location.hash = currentHash;
                }
                window.scrollTo(0, scrollPosition);
                console.log(`📍 已恢復滾動位置: ${scrollPosition}px`);
            }, 100);
            
            console.log(`✅ 語言切換完成: ${newLang}`);
            
        } catch (error) {
            console.error('❌ 語言切換失敗:', error);
        }
    }
    
    /**
     * 更新頁面內容
     */
    updatePageContent() {
        try {
            // 更新所有 data-i18n 元素
            this.updateI18nElements();
            
            // 更新所有 data-i18n-attr 元素
            this.updateI18nAttributes();
            
            // 更新頁面特定的內容
            this.updatePageSpecificContent();
            
            console.log('✅ 頁面內容更新完成');
            
        } catch (error) {
            console.error('❌ 更新頁面內容失敗:', error);
        }
    }
    
    /**
     * 更新 data-i18n 元素
     */
    updateI18nElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // 使用 textContent 避免 XSS 攻擊
                element.textContent = translation;
            } else {
                console.warn(`⚠️ 找不到翻譯 key: ${key}`);
            }
        });
    }
    
    /**
     * 更新 data-i18n-attr 元素
     */
    updateI18nAttributes() {
        const elements = document.querySelectorAll('[data-i18n-attr]');
        
        elements.forEach(element => {
            const attrData = element.getAttribute('data-i18n-attr');
            if (!attrData) return;
            
            // 解析格式：attrName:key
            const [attrName, key] = attrData.split(':');
            if (!attrName || !key) return;
            
            const translation = this.getTranslation(key);
            if (translation) {
                element.setAttribute(attrName, translation);
            } else {
                console.warn(`⚠️ 找不到翻譯 key: ${key}`);
            }
        });
    }
    
    /**
     * 更新頁面特定的內容
     */
    updatePageSpecificContent() {
            const currentPage = this.getCurrentPage();
        
            switch (currentPage) {
                case 'home':
                this.updateHomePage();
                    break;
                case 'about':
                this.updateAboutPage();
                    break;
                case 'menu':
                this.updateMenuPage();
                    break;
                case 'news':
                this.updateNewsPage();
                    break;
                case 'love':
                this.updateLovePage();
                    break;
            default:
                console.log('ℹ️ 未知頁面，跳過特定內容更新');
        }
    }
    
    /**
     * 獲取當前頁面
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
     * 獲取翻譯
     */
    getTranslation(key) {
        try {
            const keys = key.split('.');
            let current = this.translations[this.currentLang];
            
            for (const k of keys) {
                if (current && typeof current === 'object' && current[k] !== undefined) {
                    current = current[k];
                } else {
                    return null;
                }
            }
            
            return typeof current === 'string' ? current : null;
            
        } catch (error) {
            console.error(`❌ 獲取翻譯失敗 (key: ${key}):`, error);
            return null;
        }
    }
    
    /**
     * 更新首頁內容
     */
    updateHomePage() {
        console.log('🏠 更新首頁內容...');
        
        // 更新導航
        this.updateNavigation();
        
        // 更新 Hero 區域
        this.updateElementText('[data-i18n="home.hero.title"]', this.getTranslation('home.hero.title'));
        this.updateElementText('[data-i18n="home.hero.subtitle"]', this.getTranslation('home.hero.subtitle'));
        this.updateElementText('[data-i18n="home.hero.cta"]', this.getTranslation('home.hero.cta'));
        
        // 更新 USP 區域
        this.updateElementText('[data-i18n="home.usp.item1.title"]', this.getTranslation('home.usp.item1.title'));
        this.updateElementText('[data-i18n="home.usp.item1.description"]', this.getTranslation('home.usp.item1.description'));
        this.updateElementText('[data-i18n="home.usp.item2.title"]', this.getTranslation('home.usp.item2.title'));
        this.updateElementText('[data-i18n="home.usp.item2.description"]', this.getTranslation('home.usp.item2.description'));
        this.updateElementText('[data-i18n="home.usp.item3.title"]', this.getTranslation('home.usp.item3.title'));
        this.updateElementText('[data-i18n="home.usp.item3.description"]', this.getTranslation('home.usp.item3.description'));
        
        // 更新新聞區域
        this.updateElementText('[data-i18n="home.news.title"]', this.getTranslation('home.news.title'));
        this.updateElementText('[data-i18n="home.news.cta"]', this.getTranslation('home.news.cta'));
        
        // 更新 CTA 區域
        this.updateElementText('[data-i18n="home.cta.title"]', this.getTranslation('home.cta.title'));
        this.updateElementText('[data-i18n="home.cta.store"]', this.getTranslation('home.cta.store'));
        this.updateElementText('[data-i18n="home.cta.menu"]', this.getTranslation('home.cta.menu'));
        
        // 更新公司資訊
        this.updateElementText('[data-i18n="home.company"]', this.getTranslation('home.company'));
        
        console.log('✅ 首頁內容更新完成');
    }
    
    /**
     * 更新關於頁面內容
     */
    updateAboutPage() {
        console.log('ℹ️ 更新關於頁面內容...');
        
        // 更新導航
        this.updateNavigation();
        
        // 更新 Hero 區域
        this.updateElementText('[data-i18n="about.hero.title"]', this.getTranslation('about.hero.title'));
        this.updateElementText('[data-i18n="about.hero.subtitle"]', this.getTranslation('about.hero.subtitle'));
        this.updateElementText('[data-i18n="about.hero.cta"]', this.getTranslation('about.hero.cta'));
        
        // 更新品牌故事
        this.updateElementText('[data-i18n="about.story.title"]', this.getTranslation('about.story.title'));
        this.updateElementText('[data-i18n="about.story.subtitle"]', this.getTranslation('about.story.subtitle'));
        this.updateElementText('[data-i18n="about.story.content1"]', this.getTranslation('about.story.content1'));
        this.updateElementText('[data-i18n="about.story.content2"]', this.getTranslation('about.story.content2'));
        this.updateElementText('[data-i18n="about.story.content3"]', this.getTranslation('about.story.content3'));
        
        // 更新門市資訊
        this.updateElementText('[data-i18n="about.store.title"]', this.getTranslation('about.store.title'));
        this.updateElementText('[data-i18n="about.store.subtitle"]', this.getTranslation('about.store.subtitle'));
        this.updateElementText('[data-i18n="about.store.name"]', this.getTranslation('about.store.name'));
        this.updateElementText('[data-i18n="about.store.address"]', this.getTranslation('about.store.address'));
        this.updateElementText('[data-i18n="about.store.phone"]', this.getTranslation('about.store.phone'));
        this.updateElementText('[data-i18n="about.store.hours"]', this.getTranslation('about.store.hours'));
        
        // 更新地圖相關
        this.updateElementText('[data-i18n="about.map.loading"]', this.getTranslation('about.map.loading'));
        this.updateElementText('[data-i18n="about.map.error"]', this.getTranslation('about.map.error'));
        this.updateElementText('[data-i18n="about.map.fallback"]', this.getTranslation('about.map.fallback'));
        
        console.log('✅ 關於頁面內容更新完成');
    }
    
    /**
     * 更新菜單頁面內容
     */
    updateMenuPage() {
        console.log('📋 更新菜單頁面內容...');
        
        // 更新導航
        this.updateNavigation();
        
        // 更新 Hero 區域
        this.updateElementText('[data-i18n="menu.hero.title"]', this.getTranslation('menu.hero.title'));
        this.updateElementText('[data-i18n="menu.hero.subtitle"]', this.getTranslation('menu.hero.subtitle'));
        this.updateElementText('[data-i18n="menu.hero.cta"]', this.getTranslation('menu.hero.cta'));
        
        // 更新頁內導覽
        this.updateElementText('[data-i18n="menu.nav.combo"]', this.getTranslation('menu.nav.combo'));
        this.updateElementText('[data-i18n="menu.nav.small"]', this.getTranslation('menu.nav.small'));
        this.updateElementText('[data-i18n="menu.nav.mini"]', this.getTranslation('menu.nav.mini'));
        this.updateElementText('[data-i18n="menu.nav.exclusive"]', this.getTranslation('menu.nav.exclusive'));
        
        // 更新動態載入的菜單內容
        this.updateDynamicMenuContent();
        
        console.log('✅ 菜單頁面內容更新完成');
    }
    
    /**
     * 更新動態載入的菜單內容
     */
    updateDynamicMenuContent() {
        // 更新組合套餐區域
        this.updateElementText('[data-i18n="menu.combo.title"]', this.getTranslation('menu.combo.title'));
        this.updateElementText('[data-i18n="menu.combo.notice.title"]', this.getTranslation('menu.combo.notice.title'));
        
        // 更新各項套餐卡片
        for (let i = 1; i <= 7; i++) {
            this.updateElementText(`[data-i18n="menu.combo.cards.combo${i}.title"]`, this.getTranslation(`menu.combo.cards.combo${i}.title`));
            this.updateElementText(`[data-i18n="menu.combo.cards.combo${i}.description"]`, this.getTranslation(`menu.combo.cards.combo${i}.description`));
        }
        
        // 更新注意事項列表
        for (let i = 0; i < 3; i++) {
            this.updateElementText(`[data-i18n="menu.combo.notice.items.${i}"]`, this.getTranslation(`menu.combo.notice.items.${i}`));
        }
        
        // 更新小鍋系列
        this.updateElementText('[data-i18n="menu.small.title"]', this.getTranslation('menu.small.title'));
        this.updateElementText('[data-i18n="menu.small.pots.milk.title"]', this.getTranslation('menu.small.pots.milk.title'));
        this.updateElementText('[data-i18n="menu.small.pots.spicy.title"]', this.getTranslation('menu.small.pots.spicy.title'));
        this.updateElementText('[data-i18n="menu.small.pots.stone.title"]', this.getTranslation('menu.small.pots.stone.title'));
        this.updateElementText('[data-i18n="menu.small.pots.cheese.title"]', this.getTranslation('menu.small.pots.cheese.title'));
        this.updateElementText('[data-i18n="menu.small.pots.weekday.title"]', this.getTranslation('menu.small.pots.weekday.title'));
        
        // 更新 Mini 系列
        this.updateElementText('[data-i18n="menu.mini.title"]', this.getTranslation('menu.mini.title'));
        this.updateElementText('[data-i18n="menu.mini.items.combo.title"]', this.getTranslation('menu.mini.items.combo.title'));
        this.updateElementText('[data-i18n="menu.mini.items.combo.description"]', this.getTranslation('menu.mini.items.combo.description'));
        
        // 更新麻煮限定
        this.updateElementText('[data-i18n="menu.exclusive.title"]', this.getTranslation('menu.exclusive.title'));
        this.updateElementText('[data-i18n="menu.exclusive.items.spicy_mama"]', this.getTranslation('menu.exclusive.items.spicy_mama'));
        this.updateElementText('[data-i18n="menu.exclusive.items.intestine"]', this.getTranslation('menu.exclusive.items.intestine'));
        this.updateElementText('[data-i18n="menu.exclusive.items.double_monster"]', this.getTranslation('menu.exclusive.items.double_monster'));
        this.updateElementText('[data-i18n="menu.exclusive.items.duck_blood"]', this.getTranslation('menu.exclusive.items.duck_blood'));
        this.updateElementText('[data-i18n="menu.exclusive.items.stinky_tofu"]', this.getTranslation('menu.exclusive.items.stinky_tofu'));
        this.updateElementText('[data-i18n="menu.exclusive.items.black_noodle"]', this.getTranslation('menu.exclusive.items.black_noodle'));
        this.updateElementText('[data-i18n="menu.exclusive.items.small_noodle"]', this.getTranslation('menu.exclusive.items.small_noodle'));
        this.updateElementText('[data-i18n="menu.exclusive.items.crispy_tofu"]', this.getTranslation('menu.exclusive.items.crispy_tofu'));
        this.updateElementText('[data-i18n="menu.exclusive.items.crispy_wings"]', this.getTranslation('menu.exclusive.items.crispy_wings'));
        this.updateElementText('[data-i18n="menu.exclusive.items.potato_strips"]', this.getTranslation('menu.exclusive.items.potato_strips'));
        
        console.log('✅ 動態菜單內容更新完成');
    }
    
    /**
     * 更新新聞頁面內容
     */
    updateNewsPage() {
        console.log('📰 更新新聞頁面內容...');
        
        // 更新導航
        this.updateNavigation();
        
        // 更新 Hero 區域
        this.updateElementText('[data-i18n="news.hero.title"]', this.getTranslation('news.hero.title'));
        this.updateElementText('[data-i18n="news.hero.subtitle"]', this.getTranslation('news.hero.subtitle'));
        this.updateElementText('[data-i18n="news.hero.cta"]', this.getTranslation('news.hero.cta'));
        
        // 更新最新訊息區域
        this.updateElementText('[data-i18n="news.latest.title"]', this.getTranslation('news.latest.title'));
        this.updateElementText('[data-i18n="news.latest.hint"]', this.getTranslation('news.latest.hint'));
        
        console.log('✅ 新聞頁面內容更新完成');
    }
    
    /**
     * 更新愛心公益頁面內容
     */
    updateLovePage() {
        console.log('❤️ 更新愛心公益頁面內容...');
        
        // 更新導航
        this.updateNavigation();
        
        // 更新 Hero 區域
        this.updateElementText('[data-i18n="love.hero.title1"]', this.getTranslation('love.hero.title1'));
        this.updateElementText('[data-i18n="love.hero.title2"]', this.getTranslation('love.hero.title2'));
        this.updateElementText('[data-i18n="love.hero.cta"]', this.getTranslation('love.hero.cta'));
        
        // 更新頁內導覽
        this.updateElementText('[data-i18n="love.nav.origin"]', this.getTranslation('love.nav.origin'));
        this.updateElementText('[data-i18n="love.nav.programs"]', this.getTranslation('love.nav.programs'));
        this.updateElementText('[data-i18n="love.nav.guidelines"]', this.getTranslation('love.nav.guidelines'));
        this.updateElementText('[data-i18n="love.nav.milestones"]', this.getTranslation('love.nav.milestones'));
        this.updateElementText('[data-i18n="love.nav.faq"]', this.getTranslation('love.nav.faq'));
        
        // 更新我們的初衷
        this.updateElementText('[data-i18n="love.origin.title"]', this.getTranslation('love.origin.title'));
        this.updateElementText('[data-i18n="love.origin.text"]', this.getTranslation('love.origin.text'));
        
        // 更新公益方案
        this.updateElementText('[data-i18n="love.programs.title"]', this.getTranslation('love.programs.title'));
        
        // 更新各項卡片
        const cardTypes = ['visually_impaired', 'medical_staff', 'filial_piety', 'matsu_resident', 'new_resident', 'beach_cleanup', 'allpass'];
        cardTypes.forEach(type => {
            this.updateElementText(`[data-i18n="love.programs.cards.${type}.title"]`, this.getTranslation(`love.programs.cards.${type}.title`));
            this.updateElementText(`[data-i18n="love.programs.cards.${type}.text"]`, this.getTranslation(`love.programs.cards.${type}.text`));
        });
        
        // 更新使用須知
        this.updateElementText('[data-i18n="love.guidelines.title"]', this.getTranslation('love.guidelines.title'));
        this.updateElementText('[data-i18n="love.guidelines.note"]', this.getTranslation('love.guidelines.note'));
        
        // 更新成效里程碑
        this.updateElementText('[data-i18n="love.milestones.title"]', this.getTranslation('love.milestones.title'));
        this.updateElementText('[data-i18n="love.milestones.subtitle1"]', this.getTranslation('love.milestones.subtitle1'));
        this.updateElementText('[data-i18n="love.milestones.subtitle2"]', this.getTranslation('love.milestones.subtitle2'));
        this.updateElementText('[data-i18n="love.milestones.total"]', this.getTranslation('love.milestones.total'));
        
        // 更新各項標籤
        cardTypes.forEach(type => {
            this.updateElementText(`[data-i18n="love.milestones.labels.${type}"]`, this.getTranslation(`love.milestones.labels.${type}`));
        });
        
        // 更新 FAQ
        this.updateElementText('[data-i18n="love.faq.title"]', this.getTranslation('love.faq.title'));
        this.updateElementText('[data-i18n="love.faq.subtitle"]', this.getTranslation('love.faq.subtitle'));
        
        // 更新 FAQ 項目
        for (let i = 0; i < 5; i++) {
            this.updateElementText(`[data-i18n="love.faq.items.${i}.q"]`, this.getTranslation(`love.faq.items.${i}.q`));
            this.updateElementText(`[data-i18n="love.faq.items.${i}.a"]`, this.getTranslation(`love.faq.items.${i}.a`));
        }
        
        console.log('✅ 愛心公益頁面內容更新完成');
    }
    
    /**
     * 更新導航
     */
    updateNavigation() {
        // 更新主要導航
        this.updateElementText('[data-i18n="nav.home"]', this.getTranslation('nav.home'));
        this.updateElementText('[data-i18n="nav.about"]', this.getTranslation('nav.about'));
        this.updateElementText('[data-i18n="nav.menu"]', this.getTranslation('nav.menu'));
        this.updateElementText('[data-i18n="nav.news"]', this.getTranslation('nav.news'));
        this.updateElementText('[data-i18n="nav.love"]', this.getTranslation('nav.love'));
        
        // 更新手機版導航
        this.updateElementText('.mobile-nav [data-i18n="nav.home"]', this.getTranslation('nav.home'));
        this.updateElementText('.mobile-nav [data-i18n="nav.about"]', this.getTranslation('nav.about'));
        this.updateElementText('.mobile-nav [data-i18n="nav.menu"]', this.getTranslation('nav.menu'));
        this.updateElementText('.mobile-nav [data-i18n="nav.news"]', this.getTranslation('nav.news'));
        this.updateElementText('.mobile-nav [data-i18n="nav.love"]', this.getTranslation('nav.love'));
    }
    
    /**
     * 更新元素文字
     */
    updateElementText(selector, text) {
        if (!text) return;
        
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.textContent = text;
        });
    }
    
    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        console.error('❌ 錯誤:', message);
        // 可以在這裡添加用戶友好的錯誤提示
    }
}

// 創建全域實例
const i18nManager = new I18nManager();

// 將實例設為全域變數，供其他腳本使用
window.i18nManager = i18nManager;

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
