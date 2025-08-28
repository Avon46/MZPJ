/**
 * 視窗觸發動畫管理器
 * 實現數字計數動畫和卡片進入動畫
 * 
 * @author 麻煮開發團隊
 * @version 1.0.0
 */

class ViewportAnimationManager {
    constructor(options = {}) {
        this.options = {
            threshold: 0.25, // 進入視窗 25% 時觸發
            rootMargin: '0px',
            animationDuration: 800, // 數字動畫時間 800ms
            enableReplay: false, // 是否允許重播動畫
            ...options
        };
        
        this.observer = null;
        this.animatedElements = new Set();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    /**
     * 初始化動畫管理器
     */
    init() {
        if (this.isReducedMotion) {
            this.handleReducedMotion();
            return;
        }
        
        this.setupIntersectionObserver();
        this.bindEvents();
        console.log('視窗觸發動畫管理器初始化完成');
    }
    
    /**
     * 設置 IntersectionObserver
     */
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleElementVisible(entry.target);
                    }
                });
            },
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );
        
        // 觀察所有需要動畫的元素
        this.observeElements();
    }
    
    /**
     * 觀察需要動畫的元素
     */
    observeElements() {
        // 觀察數字計數器
        document.querySelectorAll('.viewport-counter').forEach(element => {
            this.observer.observe(element);
        });
        
        // 觀察卡片
        document.querySelectorAll('.viewport-card').forEach(element => {
            this.observer.observe(element);
        });
    }
    
    /**
     * 處理元素進入視窗
     */
    handleElementVisible(element) {
        if (this.animatedElements.has(element) && !this.options.enableReplay) {
            return; // 已經動畫過且不允許重播
        }
        
        if (element.classList.contains('viewport-counter')) {
            this.animateCounter(element);
        } else if (element.classList.contains('viewport-card')) {
            this.animateCard(element);
        }
        
        this.animatedElements.add(element);
    }
    
    /**
     * 動畫數字計數器
     */
    animateCounter(element) {
        const counterNumber = element.querySelector('.counter-number');
        if (!counterNumber) return;
        
        // 顯示容器
        element.classList.add('is-visible');
        
        // 獲取目標數值
        const targetValue = this.getTargetValue(counterNumber);
        const targetText = counterNumber.textContent;
        
        if (targetValue === null) {
            // 無法解析數字，直接顯示
            counterNumber.classList.add('animation-complete');
            return;
        }
        
        // 開始計數動畫
        this.startCountingAnimation(counterNumber, targetValue, targetText);
    }
    
    /**
     * 動畫卡片
     */
    animateCard(element) {
        element.classList.add('is-visible');
        
        // 動畫完成後添加完成標記
        setTimeout(() => {
            element.classList.add('animation-complete');
        }, 800);
    }
    
    /**
     * 開始數字計數動畫
     */
    startCountingAnimation(counterElement, targetValue, originalText) {
        const startValue = 0;
        const startTime = performance.now();
        const duration = this.options.animationDuration;
        
        // 添加計數中樣式
        counterElement.classList.add('is-counting');
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用 easeOutQuart 緩動函數
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
            
            // 更新顯示
            counterElement.textContent = this.formatNumber(currentValue, originalText);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 動畫完成
                counterElement.textContent = originalText;
                counterElement.classList.remove('is-counting');
                counterElement.classList.add('animation-complete');
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * 獲取目標數值
     */
    getTargetValue(counterElement) {
        // 優先使用 data-target 屬性
        const dataTarget = counterElement.getAttribute('data-target');
        if (dataTarget) {
            const number = parseInt(dataTarget, 10);
            return isNaN(number) ? null : number;
        }
        
        // 備用方案：解析文字內容
        const targetText = counterElement.textContent;
        const cleanText = targetText.replace(/[+,]/g, '');
        const number = parseInt(cleanText, 10);
        return isNaN(number) ? null : number;
    }
    
    /**
     * 解析數字文字（備用方法）
     */
    parseNumber(text) {
        // 移除 + 號和逗號，提取數字
        const cleanText = text.replace(/[+,]/g, '');
        const number = parseInt(cleanText, 10);
        return isNaN(number) ? null : number;
    }
    
    /**
     * 格式化數字顯示
     */
    formatNumber(number, originalText) {
        let formatted = number.toLocaleString();
        
        // 如果原始文字有 + 號，保留
        if (originalText.includes('+')) {
            formatted += '+';
        }
        
        return formatted;
    }
    
    /**
     * 處理減少動畫偏好
     */
    handleReducedMotion() {
        // 直接顯示所有元素的最終狀態
        document.querySelectorAll('.viewport-counter, .viewport-card').forEach(element => {
            element.classList.add('is-visible', 'animation-complete');
        });
        
        // 直接顯示最終數字
        document.querySelectorAll('.counter-number').forEach(counter => {
            counter.classList.add('animation-complete');
        });
        
        console.log('檢測到減少動畫偏好，跳過所有動畫');
    }
    
    /**
     * 綁定事件
     */
    bindEvents() {
        // 監聽減少動畫偏好的變化
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            if (this.isReducedMotion) {
                this.handleReducedMotion();
            }
        });
        
        // 監聽視窗大小變化，重新觀察元素
        window.addEventListener('resize', this.debounce(() => {
            this.observeElements();
        }, 250));
    }
    
    /**
     * 防抖函數
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * 手動觸發元素動畫
     */
    triggerAnimation(selector) {
        const element = document.querySelector(selector);
        if (element) {
            this.handleElementVisible(element);
        }
    }
    
    /**
     * 重置所有動畫狀態
     */
    resetAnimations() {
        this.animatedElements.clear();
        
        document.querySelectorAll('.viewport-counter, .viewport-card').forEach(element => {
            element.classList.remove('is-visible', 'animation-complete');
        });
        
        document.querySelectorAll('.counter-number').forEach(counter => {
            counter.classList.remove('is-counting', 'animation-complete');
        });
        
        // 重新觀察元素
        this.observeElements();
    }
    
    /**
     * 銷毀實例
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// 全域實例管理
window.viewportAnimationManager = window.viewportAnimationManager || {};

/**
 * 初始化視窗觸發動畫
 * @param {Object} options 配置選項
 */
function initViewportAnimations(options = {}) {
    if (window.viewportAnimationManager.instance) {
        window.viewportAnimationManager.instance.destroy();
    }
    
    window.viewportAnimationManager.instance = new ViewportAnimationManager(options);
    return window.viewportAnimationManager.instance;
}

// 自動初始化
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否有需要動畫的元素
    const hasAnimations = document.querySelectorAll('.viewport-counter, .viewport-card').length > 0;
    
    if (hasAnimations) {
        initViewportAnimations({
            threshold: 0.25,
            animationDuration: 800,
            enableReplay: false
        });
    }
});

// 延遲初始化（等待其他腳本載入完成）
setTimeout(() => {
    const hasAnimations = document.querySelectorAll('.viewport-counter, .viewport-card').length > 0;
    
    if (hasAnimations && !window.viewportAnimationManager.instance) {
        initViewportAnimations({
            threshold: 0.25,
            animationDuration: 800,
            enableReplay: false
        });
    }
}, 100);
