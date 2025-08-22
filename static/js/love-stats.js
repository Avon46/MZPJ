/**
 * 愛心公益數字動畫模組
 * 負責顯示數字並執行動畫效果
 * 
 * @author 麻煮開發團隊
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // === 設定常數 ===
    
    const CONFIG = {
        ANIMATION_DURATION: 2000, // 2秒動畫時間
        ANIMATION_DELAY: 200,     // 每個數字延遲200ms開始
        OBSERVER_THRESHOLD: 0.1   // 當元素10%可見時觸發動畫
    };
    
    // === 靜態數據（作為備用方案） ===
    
    const STATIC_STATS = {
        donation: 714649,
        visually_impaired: 488540,
        medical_staff: 133468,
        filial_piety: 3155,
        matsu_resident: 1160,
        new_resident: 1674,
        beach_cleanup: 3780,
        allpass: 78807
    };
    
    // === 數字動畫管理器 ===
    
    class NumberAnimationManager {
        constructor() {
            this.animatedElements = new Set();
            this.observer = null;
            this.init();
        }
        
        init() {
            // 等待 DOM 載入完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
            } else {
                this.setupAnimations();
            }
            
            // 嘗試載入最後更新時間
            this.loadLastUpdatedTime();
        }
        
        async loadLastUpdatedTime() {
            try {
                const response = await fetch('/api/love-stats');
                if (response.ok) {
                    const data = await response.json();
                    this.displayLastUpdatedTime(data.updatedAt);
                } else {
                    // 如果 API 失敗，顯示靜態時間
                    this.displayLastUpdatedTime(new Date().toISOString());
                }
            } catch (error) {
                console.log('無法載入 API 數據，使用靜態時間');
                // 顯示靜態時間
                this.displayLastUpdatedTime(new Date().toISOString());
            }
        }
        
        displayLastUpdatedTime(updatedAt) {
            const lastUpdatedElement = document.querySelector('.love-last-updated');
            if (lastUpdatedElement && updatedAt) {
                try {
                    const date = new Date(updatedAt);
                    const formattedDate = date.toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    lastUpdatedElement.innerHTML = `
                        <div style="text-align: center; margin-top: var(--spacing-lg); padding: var(--spacing-md); background: var(--color-gray-light); border-radius: var(--border-radius-md);">
                            <p style="margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                                📅 最後更新時間：${formattedDate}
                            </p>
                        </div>
                    `;
                } catch (error) {
                    console.error('Error parsing date:', error);
                    lastUpdatedElement.innerHTML = `
                        <div style="text-align: center; margin-top: var(--spacing-lg); padding: var(--spacing-md); background: var(--color-gray-light); border-radius: var(--border-radius-md);">
                            <p style="margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                                📅 最後更新時間：載入中...
                            </p>
                        </div>
                    `;
                }
            }
        }
        
        setupAnimations() {
            // 檢查是否存在愛心公益數字區塊
            const statsContainer = document.querySelector('.love-milestones');
            if (!statsContainer) {
                console.log('Love stats section not found, skipping...');
                return;
            }
            
            // 設置 Intersection Observer 來觸發動畫
            this.setupIntersectionObserver();
            
            // 如果頁面已經滾動到該區域，立即執行動畫
            if (this.isElementInViewport(statsContainer)) {
                this.startAnimations();
            }
        }
        
        setupIntersectionObserver() {
            const options = {
                threshold: CONFIG.OBSERVER_THRESHOLD,
                rootMargin: '0px 0px -100px 0px'
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.startAnimations();
                        // 動畫開始後停止觀察
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            // 觀察里程碑區塊
            const milestonesSection = document.querySelector('.love-milestones');
            if (milestonesSection) {
                this.observer.observe(milestonesSection);
            }
        }
        
        startAnimations() {
            const numberElements = document.querySelectorAll('.love-milestone__number');
            
            numberElements.forEach((element, index) => {
                // 延遲執行動畫，創造連續效果
                setTimeout(() => {
                    this.animateNumber(element);
                }, index * CONFIG.ANIMATION_DELAY);
            });
        }
        
        animateNumber(element) {
            // 如果已經動畫過，跳過
            if (this.animatedElements.has(element)) {
                return;
            }
            
            this.animatedElements.add(element);
            
            // 獲取目標數字
            const targetText = element.textContent;
            const targetValue = this.extractNumber(targetText);
            
            if (targetValue === null) {
                return; // 無法解析數字，跳過
            }
            
            // 保存原始文字格式
            const originalFormat = this.getNumberFormat(targetText);
            
            // 開始動畫
            this.runNumberAnimation(element, 0, targetValue, originalFormat);
        }
        
        extractNumber(text) {
            // 從文字中提取數字，移除逗號和加號
            const match = text.match(/[\d,]+/);
            if (!match) return null;
            
            return parseInt(match[0].replace(/,/g, ''), 10);
        }
        
        getNumberFormat(text) {
            // 獲取數字的格式（是否帶有加號等）
            if (text.includes('+')) {
                return 'plus';
            }
            return 'normal';
        }
        
        runNumberAnimation(element, startValue, targetValue, format) {
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / CONFIG.ANIMATION_DURATION, 1);
                
                // 使用 easeOutQuart 緩動函數
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
                
                // 格式化當前數字
                const formattedValue = this.formatNumber(currentValue, format);
                element.textContent = formattedValue;
                
                // 繼續動畫或完成
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // 確保最終值正確
                    const finalFormatted = this.formatNumber(targetValue, format);
                    element.textContent = finalFormatted;
                }
            };
            
            requestAnimationFrame(animate);
        }
        
        formatNumber(num, format) {
            // 添加千分位逗號
            const withCommas = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            // 根據格式添加符號
            switch (format) {
                case 'plus':
                    return withCommas + '+';
                default:
                    return withCommas;
            }
        }
        
        isElementInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    }
    
    // === 初始化 ===
    
    // 創建並初始化數字動畫管理器
    const numberAnimationManager = new NumberAnimationManager();
    
    // 全域變數，讓其他腳本可以存取
    window.numberAnimationManager = numberAnimationManager;
    
})();
