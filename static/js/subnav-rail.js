/**
 * Slim Rail 側邊導覽列管理器
 * 使用 matchMedia 控制行為，避免閃爍和殘留狀態
 * 
 * @author 麻煮開發團隊
 * @version 3.0.0
 */

// 響應式斷點設定
const DESKTOP_BREAKPOINT = 1200; // 桌機版觸發效果的斷點

class SubnavRailManager {
    constructor(options = {}) {
        this.options = {
            railSelector: '.side-rail',
            linkSelector: '.side-rail__link',
            itemSelector: '.side-rail__item',
            sectionSelector: '[id]',
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px',
            smoothScroll: true,
            triggerSelector: '.subnav-trigger', // 哨兵元素選擇器
            headerSelector: '.header', // Header 選擇器
            ...options
        };
        
        this.rail = null;
        this.links = [];
        this.sections = [];
        this.observer = null;
        this.currentActive = null;
        this.triggerElement = null;
        this.headerElement = null;
        this.isVisible = false;
        this.isDesktop = false; // 是否為桌機版（≥1200px）
        this.resizeObserver = null;
        this.triggerOffset = 0; // 觸發點的絕對座標
        
        // 新增：防抖動機制
        this.resizeTimeout = null;
        this.orientationChangeTimeout = null;
        this.isResizing = false;
        
        // 新增：matchMedia 實例
        this.desktopMediaQuery = null;
        
        this.init();
    }
    
    /**
     * 檢查是否為桌機版（使用 matchMedia）
     */
    isDesktopView() {
        return this.desktopMediaQuery && this.desktopMediaQuery.matches;
    }
    
    /**
     * 初始化側邊導覽列
     */
    init() {
        // 設置 matchMedia
        this.setupMediaQuery();
        
        this.rail = document.querySelector(this.options.railSelector);
        if (!this.rail) {
            console.warn('找不到側邊導覽列元素:', this.options.railSelector);
            return;
        }
        
        // 找到哨兵元素
        this.triggerElement = document.querySelector(this.options.triggerSelector);
        if (!this.triggerElement) {
            console.warn('找不到哨兵元素:', this.options.triggerSelector);
        }
        
        // 找到 Header 區塊
        this.headerElement = document.querySelector(this.options.headerSelector);
        if (!this.headerElement) {
            console.warn('找不到 Header 區塊:', this.options.headerSelector);
        }
        
        this.links = Array.from(this.rail.querySelectorAll(this.options.linkSelector));
        this.sections = this.getSections();
        
        if (this.links.length === 0 || this.sections.length === 0) {
            console.warn('找不到導覽連結或對應區塊');
            return;
        }
        
        // 初始設置 header 高度以支援所有模式
        if (this.headerElement) {
            this.updateHeaderHeight();
        }
        
        // 根據當前狀態初始化
        this.updateMode();
        
        this.setupIntersectionObserver();
        this.bindEvents();
        this.initializeActiveState();
        
        console.log(`Slim Rail 側邊導覽列初始化完成（是否桌機: ${this.isDesktop}）`);
    }
    
    /**
     * 設置 matchMedia 查詢
     */
    setupMediaQuery() {
        this.desktopMediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
        
        // 監聽媒體查詢變化
        this.desktopMediaQuery.addEventListener('change', (e) => {
            console.log(`媒體查詢變化: ${e.matches ? '桌機' : '手機+平板'}`);
            this.handleModeChange();
        });
    }
    
    /**
     * 處理模式變化
     */
    handleModeChange() {
        // 使用 requestAnimationFrame + 延遲確保穩定
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                this.updateMode();
            });
        }, 100);
    }
    
    /**
     * 更新模式
     */
    updateMode() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = this.isDesktopView();
        
        if (wasDesktop !== this.isDesktop) {
            console.log(`模式切換: ${wasDesktop ? '桌機' : '手機+平板'} → ${this.isDesktop ? '桌機' : '手機+平板'}`);
            
            if (this.isDesktop) {
                this.enableDesktop();
            } else {
                this.disableDesktop();
            }
        }
    }
    
    /**
     * 初始化桌機版（啟用 Hero 觸發效果）
     */
    initDesktop() {
        // 初始狀態隱藏次導覽列（確保沒有 is-visible 類別）
        this.hideRail();
        
        // 設置動態 header 高度
        this.setupHeaderHeight();
        
        // 計算觸發點絕對座標
        this.calculateTriggerOffset();
        
        // 設置滾動監聽器
        this.setupScrollListener();
        
        console.log('桌機版：啟用 Hero 觸發效果');
    }
    
    /**
     * 初始化手機+平板（停用觸發效果，還原基準樣式）
     */
    initMobileTablet() {
        // 手機+平板：直接顯示，不需要觸發
        this.showRail();
        
        // 移除任何 Hero 觸發相關的樣式
        this.rail.classList.remove('is-visible');
        
        // 不需要滾動監聽器
        
        console.log('手機+平板：停用觸發效果，還原基準樣式');
    }
    
    /**
     * 計算觸發點的絕對座標
     */
    calculateTriggerOffset() {
        if (!this.triggerElement || !this.isDesktop) return;
        
        const rect = this.triggerElement.getBoundingClientRect();
        this.triggerOffset = rect.top + window.pageYOffset;
        
        console.log('觸發點絕對座標:', this.triggerOffset);
    }
    
    /**
     * 設置滾動監聽器
     */
    setupScrollListener() {
        if (!this.isDesktop) return;
        
        // 使用節流函數監聽滾動事件
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // 約 60fps
        
        // 監聽視窗大小變化，重新計算觸發點座標
        window.addEventListener('resize', this.throttle(() => {
            this.calculateTriggerOffset();
        }, 100));
    }
    
    /**
     * 處理滾動事件
     */
    handleScroll() {
        if (!this.isDesktop) return;
        
        const scrollY = window.pageYOffset;
        
        if (scrollY >= this.triggerOffset) {
            // 滾動位置超過觸發點，顯示次導覽列
            this.showRail();
        } else {
            // 滾動位置在觸發點以上，隱藏次導覽列
            this.hideRail();
        }
    }
    
    /**
     * 設置動態 header 高度
     */
    setupHeaderHeight() {
        if (!this.headerElement || !this.isDesktop) return;
        
        // 初始設置
        this.updateHeaderHeight();
        
        // 監聽 header 高度變化
        this.resizeObserver = new ResizeObserver(() => {
            this.updateHeaderHeight();
        });
        
        this.resizeObserver.observe(this.headerElement);
        
        // 監聽視窗大小變化
        window.addEventListener('resize', this.throttle(() => {
            const wasDesktop = this.isDesktop;
            
            this.isDesktop = this.isDesktopView();
            
            // 如果從桌機切換到手機+平板，停用觸發效果
            if (wasDesktop && !this.isDesktop) {
                this.disableDesktop();
            }
            // 如果從手機+平板切換到桌機，啟用觸發效果
            else if (!wasDesktop && this.isDesktop) {
                this.enableDesktop();
            }
            // 如果都是桌機，更新 header 高度和觸發點座標
            else if (this.isDesktop) {
                this.updateHeaderHeight();
                this.calculateTriggerOffset();
                
                // 記錄斷點變化
                const windowWidth = window.innerWidth;
                console.log(`斷點變化: 視窗寬度 ${windowWidth}px, 是否桌機: ${this.isDesktop}`);
            }
        }, 100));
    }
    
    /**
     * 更新 header 高度 CSS 變數
     */
    updateHeaderHeight() {
        if (!this.headerElement) return;
        
        const headerHeight = this.headerElement.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        
        // 只在桌機模式下更新次導覽列位置
        if (this.isDesktop && this.rail) {
            const topOffset = getComputedStyle(document.documentElement)
                .getPropertyValue('--subnav-rail-top-offset')
                .trim() || '100px';
            this.rail.style.top = `calc(${headerHeight}px + ${topOffset})`;
        }
    }
    
    /**
     * 清理桌機相關資源
     */
    cleanupDesktop() {
        // 清理 ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        // 移除滾動監聽器
        window.removeEventListener('scroll', this.handleScroll);
        
        // 清理定時器
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        
        if (this.orientationChangeTimeout) {
            clearTimeout(this.orientationChangeTimeout);
            this.orientationChangeTimeout = null;
        }
        
        // 重置狀態
        this.isResizing = false;
    }
    
    /**
     * 啟用桌機行為
     */
    enableDesktop() {
        if (this.isDesktop) {
            // 桌機版：啟用 Hero 觸發效果
            this.initDesktop();
        }
    }
    
    /**
     * 停用桌機行為，回到手機+平板基準樣式
     */
    disableDesktop() {
        if (!this.isDesktop) {
            // 清理桌機相關資源
            this.cleanupDesktop();
            
            // 手機+平板：停用觸發效果，還原到基準樣式
            this.initMobileTablet();
        }
    }
    
    /**
     * 獲取對應的區塊元素
     */
    getSections() {
        const sections = [];
        
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    sections.push({
                        id: sectionId,
                        element: section,
                        link: link,
                        item: link.closest(this.options.itemSelector)
                    });
                }
            }
        });
        
        return sections;
    }
    
    /**
     * 顯示次導覽列
     */
    showRail() {
        if (this.isVisible) return;
        
        // 只在桌機模式下添加 is-visible 類別
        if (this.isDesktop) {
            this.rail.classList.add('is-visible');
        }
        
        this.isVisible = true;
        
        const windowWidth = window.innerWidth;
        const triggerType = this.isDesktop ? 'Hero 觸發' : '直接顯示';
        console.log(`次導覽列已顯示（視窗寬度 ${windowWidth}px, 是否桌機: ${this.isDesktop}, 觸發方式: ${triggerType}）`);
    }
    
    /**
     * 隱藏次導覽列
     */
    hideRail() {
        if (!this.isVisible) return;
        
        // 只在桌機模式下移除 is-visible 類別
        if (this.isDesktop) {
            this.rail.classList.remove('is-visible');
        }
        
        this.isVisible = false;
        
        const windowWidth = window.innerWidth;
        const triggerType = this.isDesktop ? 'Hero 觸發' : '直接顯示';
        console.log(`次導覽列已隱藏（視窗寬度 ${windowWidth}px, 是否桌機: ${this.isDesktop}, 觸發方式: ${triggerType}）`);
    }
    
    /**
     * 設置 IntersectionObserver
     */
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log(`👁️ IntersectionObserver 觸發: ${entry.target.id}`);
                        this.updateActiveState(entry.target.id);
                    }
                });
            },
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );
        
        // 觀察所有區塊
        this.sections.forEach(({ element }) => {
            this.observer.observe(element);
            console.log(`👁️ 開始觀察區塊: ${element.id}`);
        });
        
        console.log(`✅ IntersectionObserver 設置完成，觀察 ${this.sections.length} 個區塊`);
    }
    
    /**
     * 綁定事件
     */
    bindEvents() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
            link.addEventListener('keydown', (e) => this.handleKeydown(e));
        });
        
        // 監聽滾動事件（備用方案）
        window.addEventListener('scroll', this.throttle(() => {
            this.updateActiveStateOnScroll();
        }, 100));
    }
    
    /**
     * 處理連結點擊
     */
    handleLinkClick(e) {
        e.preventDefault();
        
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            const sectionId = href.substring(1);
            
            // 檢查是否在菜單頁面
            if (window.location.pathname.includes('menu.html')) {
                this.handleMenuPageNavigation(sectionId);
            } else {
                // 其他頁面直接滾動到區塊
                const section = document.getElementById(sectionId);
                if (section) {
                    this.scrollToSection(section);
                    this.updateActiveState(sectionId);
                }
            }
        }
    }
    
    /**
     * 處理鍵盤事件
     */
    handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleLinkClick(e);
        }
    }
    
    /**
     * 滾動到指定區塊
     */
    scrollToSection(section) {
        if (this.options.smoothScroll) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            section.scrollIntoView({
                block: 'start'
            });
        }
    }
    
    /**
     * 處理菜單頁面的導航
     */
    handleMenuPageNavigation(sectionId) {
        // 更新 URL hash
        window.location.hash = sectionId;
        
        // 檢查是否有 MenuSPAManager 可用
        if (window.menuSPAManager && typeof window.menuSPAManager.loadMenuContent === 'function') {
            // 使用現有的 SPA 管理器載入內容
            window.menuSPAManager.loadMenuContent(sectionId);
        } else {
            // 備用方案：直接滾動到對應區塊
            const section = document.getElementById(sectionId);
            if (section) {
                this.scrollToSection(section);
            }
        }
        
        // 更新激活狀態
        this.updateActiveState(sectionId);
    }
    
    /**
     * 更新激活狀態
     */
    updateActiveState(sectionId) {
        if (this.currentActive === sectionId) return;
        
        console.log(`🔄 更新激活狀態: ${this.currentActive} → ${sectionId}`);
        
        // 移除所有激活狀態
        this.links.forEach(link => {
            link.classList.remove('is-active');
        });
        
        this.sections.forEach(({ item }) => {
            if (item) {
                item.classList.remove('is-active');
            }
        });
        
        // 設置新的激活狀態
        const targetSection = this.sections.find(s => s.id === sectionId);
        if (targetSection) {
            targetSection.link.classList.add('is-active');
            if (targetSection.item) {
                targetSection.item.classList.add('is-active');
            }
            this.currentActive = sectionId;
            console.log(`✅ 激活狀態已更新: ${sectionId}`);
        } else {
            console.warn(`⚠️ 找不到目標區塊: ${sectionId}`);
        }
    }
    
    /**
     * 滾動時更新激活狀態（備用方案）
     */
    updateActiveStateOnScroll() {
        if (!this.observer) return;
        
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        let activeSection = null;
        
        this.sections.forEach(({ element, id }) => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;
            const elementBottom = elementTop + rect.height;
            
            // 如果區塊在視窗中間附近，認為是當前區塊
            if (elementTop <= scrollTop + windowHeight * 0.6 && 
                elementBottom >= scrollTop + windowHeight * 0.4) {
                activeSection = id;
            }
        });
        
        if (activeSection && this.currentActive !== activeSection) {
            this.updateActiveState(activeSection);
        }
    }
    
    /**
     * 初始化激活狀態
     */
    initializeActiveState() {
        // 檢查 URL hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            const section = this.sections.find(s => s.id === hash);
            if (section) {
                this.updateActiveState(hash);
                return;
            }
        }
        
        // 預設第一個區塊為激活狀態
        if (this.sections.length > 0) {
            this.updateActiveState(this.sections[0].id);
        }
    }
    
    /**
     * 節流函數
     */
    throttle(func, delay) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                func.apply(this, args);
            }
        };
    }
    
    /**
     * 清理資源
     */
    cleanup() {
        // 清理 IntersectionObserver
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // 清理桌機相關資源
        this.cleanupDesktop();
        
        // 清理 matchMedia 監聽器
        if (this.desktopMediaQuery) {
            this.desktopMediaQuery.removeEventListener('change', this.handleModeChange);
            this.desktopMediaQuery = null;
        }
        
        // 清理事件監聽器
        if (this.links.length > 0) {
            this.links.forEach(link => {
                link.removeEventListener('click', this.handleLinkClick);
                link.removeEventListener('keydown', this.handleKeydown);
            });
        }
        
        // 移除滾動監聽器
        window.removeEventListener('scroll', this.updateActiveStateOnScroll);
        
        // 重置狀態
        this.isVisible = false;
        this.currentActive = null;
        
        console.log('Slim Rail 已清理資源');
    }
    
    /**
     * 銷毀實例
     */
    destroy() {
        this.cleanup();
    }
}

// 全域實例管理
window.subnavRailManagers = window.subnavRailManagers || {};

/**
 * 初始化側邊導覽列
 * @param {string} railId 導覽列 ID
 * @param {Object} options 配置選項
 */
function initSubnavRail(railId, options = {}) {
    if (window.subnavRailManagers[railId]) {
        window.subnavRailManagers[railId].destroy();
    }
    
    window.subnavRailManagers[railId] = new SubnavRailManager({
        railSelector: `#${railId}`,
        ...options
    });
    
    return window.subnavRailManagers[railId];
}

// 自動初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化側邊導覽列
    const subnav = document.getElementById('subnav');
    if (subnav) {
        // 根據當前頁面自動選擇觸發器
        let triggerSelector = '.subnav-trigger'; // 預設選擇器
        
        // 檢查是否在菜單頁面
        if (window.location.pathname.includes('menu.html')) {
            triggerSelector = '#menu-subnav-trigger';
        }
        // 檢查是否在愛心公益頁面
        else if (window.location.pathname.includes('love.html')) {
            triggerSelector = '#love-subnav-trigger';
        }
        
        const manager = new SubnavRailManager({
            railSelector: '#subnav',
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px',
            triggerSelector: triggerSelector, // 動態選擇觸發器
            headerSelector: '.header' // Header 選擇器
        });
        
        // 將管理器實例存儲到全域變數中
        window.subnavRailManagers = window.subnavRailManagers || {};
        window.subnavRailManagers['subnav'] = manager;
        
        console.log(`✅ ${window.location.pathname.includes('menu.html') ? '菜單' : '愛心公益'}頁面 Slim Rail 初始化完成，觸發器: ${triggerSelector}`);
    }
});

// 移除重複的延遲初始化，避免衝突
