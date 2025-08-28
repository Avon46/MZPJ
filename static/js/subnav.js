/**
 * 響應式次導覽列管理器
 * 支援手機平板橫向 + 桌機垂直佈局
 */
class ResponsiveSubnavManager {
    constructor(subnavElement) {
        this.subnav = subnavElement;
        this.links = this.subnav.querySelectorAll('.subnav__link');
        this.sections = [];
        this.currentActiveLink = null;
        this.observer = null;
        this.heroObserver = null;
        this.desktopMediaQuery = window.matchMedia('(min-width: 992px)');
        this.isDesktop = this.desktopMediaQuery.matches;
        
        this.init();
    }

    init() {
        this.collectSections();
        this.setupMediaQuery();
        this.updateMode();
        this.bindEvents();
    }

    collectSections() {
        this.sections = Array.from(this.links).map(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                const section = document.getElementById(sectionId);
                console.log(`收集區塊: ${sectionId}`, section ? '✓' : '✗');
                return { id: sectionId, element: section, link };
            }
            return null;
        }).filter(Boolean);
        
        console.log('已收集的區塊:', this.sections.map(s => s.id));
        
        // 重新設置觀察器
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        if (this.isDesktop) {
            this.setupDesktopIntersectionObserver();
        } else {
            this.setupMobileIntersectionObserver();
        }
    }

    setupMediaQuery() {
        this.desktopMediaQuery.addListener(() => {
            const wasDesktop = this.isDesktop;
            this.isDesktop = this.desktopMediaQuery.matches;
            
            if (wasDesktop !== this.isDesktop) {
                console.log(`模式切換: ${this.isDesktop ? '桌機' : '手機平板'}`);
                this.updateMode();
            }
        });
    }

    updateMode() {
        this.cleanup();
        
        if (this.isDesktop) {
            this.enableDesktop();
        } else {
            this.enableMobile();
        }
    }

    enableMobile() {
        console.log('啟用手機平板版次導覽');
        // 手機平板版：橫向 chip tab，sticky 定位
        this.bindMobileEvents();
        this.setupMobileIntersectionObserver();
    }

    enableDesktop() {
        console.log('啟用桌機版次導覽');
        // 桌機版：垂直導覽，fixed 定位，Hero 後淡入
        this.bindDesktopEvents();
        this.setupHeroTrigger();
        this.setupDesktopIntersectionObserver();
    }

    bindMobileEvents() {
        this.links.forEach(link => {
            link.addEventListener('click', this.handleMobileClick.bind(this));
        });
    }

    bindDesktopEvents() {
        this.links.forEach(link => {
            link.addEventListener('click', this.handleDesktopClick.bind(this));
        });
    }

    handleMobileClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href')?.substring(1);
        console.log('手機版次導覽點擊:', targetId);
        
        if (targetId) {
            // 首先檢查目標區塊是否存在
            let targetSection = document.getElementById(targetId);
            
            // 如果區塊不存在，可能是因為內容未載入，嘗試載入菜單內容
            if (!targetSection && window.menuSPAManager) {
                console.log('目標區塊不存在，嘗試載入菜單內容:', targetId);
                window.menuSPAManager.loadMenuContent(targetId);
                
                // 等待內容載入後再次嘗試
                setTimeout(() => {
                    targetSection = document.getElementById(targetId);
                    this.scrollToSection(targetSection, targetId);
                }, 100);
            } else {
                this.scrollToSection(targetSection, targetId);
            }
        }
    }
    
    scrollToSection(targetSection, targetId) {
        if (targetSection) {
            console.log('滾動到目標區塊:', targetId);
            // 手機版滾動時考慮 sticky header
            const headerHeight = 80; // 根據實際 header 高度調整
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // 更新激活狀態
            const activeLink = this.subnav.querySelector(`[href="#${targetId}"]`);
            if (activeLink) {
                this.updateActiveState(activeLink);
            }
        } else {
            console.warn('找不到目標區塊:', targetId);
        }
    }

    handleDesktopClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href')?.substring(1);
        console.log('桌機版次導覽點擊:', targetId);
        
        if (targetId) {
            // 首先檢查目標區塊是否存在
            let targetSection = document.getElementById(targetId);
            
            // 如果區塊不存在，可能是因為內容未載入，嘗試載入菜單內容
            if (!targetSection && window.menuSPAManager) {
                console.log('目標區塊不存在，嘗試載入菜單內容:', targetId);
                window.menuSPAManager.loadMenuContent(targetId);
                
                // 等待內容載入後再次嘗試
                setTimeout(() => {
                    targetSection = document.getElementById(targetId);
                    this.scrollToSectionDesktop(targetSection, targetId);
                }, 100);
            } else {
                this.scrollToSectionDesktop(targetSection, targetId);
            }
        }
    }
    
    scrollToSectionDesktop(targetSection, targetId) {
        if (targetSection) {
            console.log('桌機版滾動到目標區塊:', targetId);
            // 桌機版平滑滾動
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // 更新激活狀態
            const activeLink = this.subnav.querySelector(`[href="#${targetId}"]`);
            if (activeLink) {
                this.updateActiveState(activeLink);
            }
        } else {
            console.warn('找不到目標區塊:', targetId);
        }
    }

    setupHeroTrigger() {
        // 只在桌機版設置 Hero 觸發器
        const heroSection = document.querySelector('.hero, .menu-hero, .love-hero');
        if (!heroSection) {
            console.warn('未找到 Hero 區塊');
            // 如果沒有 Hero，預設顯示次導覽
            this.subnav.classList.add('is-visible');
            return;
        }

        this.heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Hero 在視口內：隱藏次導覽
                    this.subnav.classList.remove('is-visible');
                } else {
                    // Hero 離開視口：顯示次導覽
                    this.subnav.classList.add('is-visible');
                }
            });
        }, {
            rootMargin: '0px 0px -10% 0px', // Hero 底部往上 10% 才觸發
            threshold: 0
        });

        this.heroObserver.observe(heroSection);
    }

    setupMobileIntersectionObserver() {
        // 手機版的區塊高亮偵測
        if (this.sections.length === 0) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    const sectionData = this.sections.find(s => s.element === entry.target);
                    if (sectionData) {
                        this.updateActiveState(sectionData.link);
                    }
                }
            });
        }, {
            rootMargin: '-15% 0px -70% 0px',
            threshold: [0, 0.3, 0.6, 1]
        });

        this.sections.forEach(({ element }) => {
            if (element) {
                this.observer.observe(element);
            }
        });
    }

    setupDesktopIntersectionObserver() {
        // 桌機版的區塊高亮偵測
        if (this.sections.length === 0) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
                    const sectionData = this.sections.find(s => s.element === entry.target);
                    if (sectionData) {
                        this.updateActiveState(sectionData.link);
                    }
                }
            });
        }, {
            rootMargin: '-10% 0px -60% 0px',
            threshold: [0, 0.4, 0.7, 1]
        });

        this.sections.forEach(({ element }) => {
            if (element) {
                this.observer.observe(element);
            }
        });
    }

    updateActiveState(activeLink) {
        if (this.currentActiveLink) {
            this.currentActiveLink.classList.remove('is-active');
        }
        
        activeLink.classList.add('is-active');
        this.currentActiveLink = activeLink;
        console.log(`更新選中狀態: ${activeLink.textContent}`);
    }

    cleanup() {
        // 清理所有觀察器
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        if (this.heroObserver) {
            this.heroObserver.disconnect();
            this.heroObserver = null;
        }

        // 移除事件監聽器 (使用克隆技巧)
        this.removeAllEvents();

        // 重置狀態
        this.subnav.classList.remove('is-visible');
        if (this.currentActiveLink) {
            this.currentActiveLink.classList.remove('is-active');
            this.currentActiveLink = null;
        }
    }

    removeAllEvents() {
        // 使用克隆節點來移除所有事件監聽器
        this.links.forEach(link => {
            const clonedLink = link.cloneNode(true);
            link.parentNode.replaceChild(clonedLink, link);
        });
        // 重新獲取清理後的連結
        this.links = this.subnav.querySelectorAll('.subnav__link');
    }

    // 公共方法：手動顯示/隱藏次導覽
    show() {
        if (this.isDesktop) {
            this.subnav.classList.add('is-visible');
        }
    }

    hide() {
        if (this.isDesktop) {
            this.subnav.classList.remove('is-visible');
        }
    }

    // 公共方法：重新初始化
    reinit() {
        this.cleanup();
        this.init();
    }


}

// 全域管理器存儲
window.subnavRailManagers = window.subnavRailManagers || {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const subnavElements = document.querySelectorAll('.subnav');
    
    subnavElements.forEach((element, index) => {
        const id = element.id || `subnav-${index}`;
        const manager = new ResponsiveSubnavManager(element);
        window.subnavRailManagers[id] = manager;
        console.log(`初始化響應式次導覽管理器: ${id}`);
    });
});

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveSubnavManager;
}

// 全域暴露 (向後兼容)
window.ResponsiveSubnavManager = ResponsiveSubnavManager;
window.SubnavManager = ResponsiveSubnavManager; // 向後兼容