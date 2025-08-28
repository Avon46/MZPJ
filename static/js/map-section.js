/**
 * 麻煮MINI石頭火鍋 - 地圖元件
 * MapSection Component using Google Maps JavaScript API
 * 
 * @author 麻煮開發團隊
 * @version 1.0.0
 */

class MapSection {
    constructor(containerId, options = {}) {
        console.log('MapSection: 構造函數被調用', containerId);
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        console.log('MapSection: 容器元素:', this.container);
        
        this.options = {
            address: '100台北市中正區汀州路三段273號',
            zoom: 16,
            language: 'zh-TW',
            mapType: 'roadmap',
            ...options
        };
        
        this.map = null;
        this.marker = null;
        this.apiKey = null;
        this.isApiLoaded = false;
        this.fallbackShown = false;
        
        this.init();
    }
    
    /**
     * 初始化地圖元件
     */
    async init() {
        console.log('MapSection: 開始初始化，容器ID:', this.containerId);
        
        if (!this.container) {
            console.error('MapSection: 找不到容器元素:', this.containerId);
            return;
        }
        
        console.log('MapSection: 找到容器元素，開始檢查 API Key');
        
        // 嘗試從環境變數獲取 API Key
        this.apiKey = this.getApiKey();
        console.log('MapSection: API Key 檢查結果:', this.apiKey ? '已找到' : '未找到');
        
        // 檢查 referer 限制
        const referrerCheck = this.checkReferrer();
        console.log('MapSection: Referrer 檢查結果:', referrerCheck);
        
        if (!referrerCheck) {
            console.warn('MapSection: Referrer 檢查失敗，使用靜態地圖');
            this.showStaticMap();
            return;
        }
        
        // 如果有 API Key，嘗試載入 Google Maps API
        if (this.apiKey) {
            console.log('MapSection: 嘗試載入 Google Maps API');
            try {
                await this.loadGoogleMapsAPI();
                this.createMap();
            } catch (error) {
                console.error('MapSection: Google Maps API 載入失敗:', error);
                this.showStaticMap();
            }
        } else {
            console.log('MapSection: 未找到 Google Maps API Key，使用靜態地圖');
            this.showStaticMap();
        }
    }
    
    /**
     * 獲取 API Key
     */
    getApiKey() {
        // 嘗試從環境變數獲取
        if (typeof process !== 'undefined' && process.env && process.env.VITE_GOOGLE_MAPS_KEY) {
            return process.env.VITE_GOOGLE_MAPS_KEY;
        }
        
        // 嘗試從全域變數獲取
        if (window.VITE_GOOGLE_MAPS_KEY) {
            return window.VITE_GOOGLE_MAPS_KEY;
        }
        
        // 嘗試從 meta 標籤獲取
        const metaKey = document.querySelector('meta[name="google-maps-api-key"]');
        if (metaKey && metaKey.content) {
            return metaKey.content;
        }
        
        return null;
    }
    
    /**
     * 檢查 referer 限制
     */
    checkReferrer() {
        const allowedDomains = [
            'msmz-4d7cc.web.app',
            'localhost',
            '127.0.0.1'
        ];
        
        const currentDomain = window.location.hostname;
        return allowedDomains.includes(currentDomain);
    }
    
    /**
     * 載入 Google Maps JavaScript API
     */
    loadGoogleMapsAPI() {
        return new Promise((resolve, reject) => {
            // 檢查是否已經載入
            if (window.google && window.google.maps) {
                this.isApiLoaded = true;
                resolve();
                return;
            }
            
            // 建立 script 標籤載入 API
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&language=${this.options.language}`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                this.isApiLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Google Maps API 載入失敗'));
            };
            
            // 設定超時
            setTimeout(() => {
                if (!this.isApiLoaded) {
                    reject(new Error('Google Maps API 載入超時'));
                }
            }, 10000);
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * 建立 Google 地圖
     */
    createMap() {
        if (!this.isApiLoaded || !window.google || !window.google.maps) {
            throw new Error('Google Maps API 未載入');
        }
        
        // 建立地圖實例
        this.map = new google.maps.Map(this.container, {
            zoom: this.options.zoom,
            center: { lat: 25.0149, lng: 121.5324 }, // 台北公館座標
            mapTypeId: google.maps.MapTypeId[this.options.mapType.toUpperCase()],
            styles: this.getMapStyles(),
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });
        
        // 建立標記
        this.createMarker();
        
        // 建立資訊視窗
        this.createInfoWindow();
        
        // 地圖載入完成
        google.maps.event.addListenerOnce(this.map, 'idle', () => {
            console.log('MapSection: Google 地圖載入完成');
            this.hideLoading();
        });
    }
    
    /**
     * 建立地圖標記
     */
    createMarker() {
        this.marker = new google.maps.Marker({
            position: { lat: 25.0149, lng: 121.5324 },
            map: this.map,
            title: '麻煮MINI石頭火鍋',
            animation: google.maps.Animation.DROP
        });
    }
    
    /**
     * 建立資訊視窗
     */
    createInfoWindow() {
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #333;">麻煮MINI石頭火鍋</h3>
                    <p style="margin: 0 0 5px 0; color: #666;">${this.options.address}</p>
                    <p style="margin: 0; color: #666;">營業時間：11:00–22:00</p>
                </div>
            `
        });
        
        this.marker.addListener('click', () => {
            infoWindow.open(this.map, this.marker);
        });
    }
    
    /**
     * 獲取地圖樣式
     */
    getMapStyles() {
        return [
            {
                featureType: 'poi.business',
                stylers: [{ visibility: 'simplified' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }]
            }
        ];
    }
    
    /**
     * 顯示靜態地圖（降級方案）
     */
    showStaticMap() {
        if (this.fallbackShown) return;
        
        console.log('MapSection: 顯示靜態地圖');
        this.fallbackShown = true;
        this.hideLoading();
        
        // 獲取當前語言
        const currentLang = this.getCurrentLanguage();
        const translations = this.getTranslations(currentLang);
        
        // 建立靜態地圖容器
        const staticMapContainer = document.createElement('div');
        staticMapContainer.className = 'map-static-fallback';
        staticMapContainer.innerHTML = `
            <div class="map-static-content">
                <div class="map-static-header">
                    <h3>${translations.title}</h3>
                    <p class="map-static-address">${translations.address}</p>
                </div>
                <div class="map-static-image">
                    <div class="map-static-placeholder">
                        <div class="map-placeholder-icon">📍</div>
                        <p>${translations.placeholder}</p>
                    </div>
                </div>
                <div class="map-static-actions">
                    <a href="https://www.google.com/maps?q=${encodeURIComponent(this.options.address)}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="map-open-google-btn">
                        <span class="map-btn-icon">🗺️</span>
                        ${translations.openInGoogle}
                    </a>
                    <a href="https://www.google.com/maps/dir//${encodeURIComponent(this.options.address)}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="map-directions-btn">
                        <span class="map-btn-icon">🚗</span>
                        ${translations.directions}
                    </a>
                </div>
            </div>
        `;
        
        // 清空容器並顯示靜態地圖
        this.container.innerHTML = '';
        this.container.appendChild(staticMapContainer);
        console.log('MapSection: 靜態地圖顯示完成');
    }
    
    /**
     * 獲取當前語言
     */
    getCurrentLanguage() {
        // 檢查 i18n 系統
        if (window.i18nManager && window.i18nManager.currentLanguage) {
            return window.i18nManager.currentLanguage;
        }
        
        // 檢查 localStorage
        const savedLang = localStorage.getItem('lang');
        if (savedLang) {
            return savedLang;
        }
        
        // 檢查 HTML lang 屬性
        const htmlLang = document.documentElement.lang;
        if (htmlLang && htmlLang.startsWith('zh')) {
            return 'zh';
        }
        
        // 預設中文
        return 'zh';
    }
    
    /**
     * 獲取翻譯文字
     */
    getTranslations(lang) {
        const defaultTranslations = {
            title: '麻煮MINI石頭火鍋',
            address: '100台北市中正區汀州路三段273號',
            openInGoogle: '在 Google 地圖開啟',
            directions: '規劃路線',
            placeholder: '地圖載入中...'
        };
        
        if (lang === 'en') {
            return {
                title: 'Mazu MINI Stone Hot Pot',
                address: 'No. 273, Sec. 3, Tingzhou Rd., Zhongzheng Dist., Taipei City 100',
                openInGoogle: 'Open in Google Maps',
                directions: 'Get Directions',
                placeholder: 'Loading map...'
            };
        }
        
        return defaultTranslations;
    }
    
    /**
     * 隱藏載入提示
     */
    hideLoading() {
        const loadingElement = this.container.querySelector('.map-loading');
        if (loadingElement) {
            console.log('MapSection: 隱藏載入提示');
            loadingElement.style.display = 'none';
        } else {
            console.log('MapSection: 未找到載入提示元素');
        }
    }
    
    /**
     * 重新載入地圖
     */
    reload() {
        if (this.map) {
            this.map.setZoom(this.options.zoom);
            this.map.setCenter({ lat: 25.0149, lng: 121.5324 });
        }
    }
    
    /**
     * 銷毀地圖實例
     */
    destroy() {
        if (this.map) {
            google.maps.event.clearInstanceListeners(this.map);
            this.map = null;
        }
        if (this.marker) {
            this.marker.setMap(null);
            this.marker = null;
        }
    }
}

// 全域函數，供 HTML 直接調用
window.createMapSection = function(containerId, options) {
    console.log('MapSection: 手動創建地圖元件', containerId, options);
    return new MapSection(containerId, options);
};

// 自動初始化（如果容器存在）
function initializeMapSection() {
    const mapContainer = document.getElementById('map-section');
    if (mapContainer) {
        console.log('MapSection: 找到地圖容器，開始初始化');
        window.mapSection = new MapSection('map-section', {
            address: '100台北市中正區汀州路三段273號',
            zoom: 16,
            language: 'zh-TW'
        });
    } else {
        console.log('MapSection: 未找到地圖容器，等待 DOM 載入完成');
    }
}

// 在 DOM 載入完成後嘗試初始化
document.addEventListener('DOMContentLoaded', initializeMapSection);

// 如果 DOM 已經載入完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMapSection);
} else {
    initializeMapSection();
}

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapSection;
}
