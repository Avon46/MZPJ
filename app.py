"""
麻煮MINI石頭火鍋 - 官方網站後端
Flask 應用程式主檔案

Author: 麻煮開發團隊
Version: 1.0.0
"""

import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

# 應用程式初始化
app = Flask(__name__)
CORS(app)  # 允許跨網域請求

# 日誌設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 應用程式設定
class Config:
    """應用程式設定類別"""
    # 速率限制設定
    RATE_LIMIT_WINDOW = 60  # 60秒窗口
    RATE_LIMIT_MAX = 100    # 每分鐘最多100次請求
    
    # API 快取設定
    API_CACHE_MAX_AGE = 300  # 5分鐘
    
    # 模擬數據（未來可替換為資料庫）
    MOCK_LOVE_STATS = {
        "donation": 714649,     # 累積回饋金額
        "benefit_categories": {
            "total_donation": 714649,      # 自2021年起總優惠金額
            "visually_impaired": 488540,   # 視障/聽障人士
            "medical_staff": 133468,       # 醫護人員證照
            "filial_piety": 3155,         # 孝順雙親
            "matsu_resident": 1160,        # 馬祖身分/漁民證
            "new_resident": 1674,          # 新住民
            "beach_cleanup": 3780,         # 淨灘/手作步道
            "allpass": 78807               # ALLPASS
        },
        "last_updated": datetime.now(timezone.utc).isoformat() # 新增：記錄最後更新時間
    }

# 速率限制管理器
class RateLimiter:
    """簡單的 IP 基礎速率限制器"""
    
    def __init__(self):
        self.request_counts: Dict[str, List[float]] = {}
    
    def is_allowed(self, ip: str) -> bool:
        """
        檢查 IP 是否允許請求
        
        Args:
            ip: 客戶端 IP 地址
            
        Returns:
            bool: 是否允許請求
        """
        current_time = time.time()
        
        # 初始化或清理過期記錄
        if ip not in self.request_counts:
            self.request_counts[ip] = []
        
        # 清理過期的請求記錄
        self.request_counts[ip] = [
            req_time for req_time in self.request_counts[ip]
            if current_time - req_time < Config.RATE_LIMIT_WINDOW
        ]
        
        # 檢查是否超過限制
        if len(self.request_counts[ip]) >= Config.RATE_LIMIT_MAX:
            return False
        
        # 記錄當前請求
        self.request_counts[ip].append(current_time)
        return True

# 全域速率限制器實例
rate_limiter = RateLimiter()

# 數據驗證器
class DataValidator:
    """數據驗證工具類別"""
    
    @staticmethod
    def validate_positive_integer(value, field_name: str) -> Tuple[bool, Optional[str]]:
        """
        驗證正整數
        
        Args:
            value: 要驗證的值
            field_name: 欄位名稱
            
        Returns:
            Tuple[bool, Optional[str]]: (是否有效, 錯誤訊息)
        """
        if value is None:
            return True, None  # 允許空值
        
        if not isinstance(value, int) or value < 0:
            return False, f"Invalid value for {field_name}: must be a positive integer"
        
        return True, None
    
    @staticmethod
    def validate_benefit_categories(categories) -> Tuple[bool, Optional[str]]:
        """
        驗證優惠項目數據
        
        Args:
            categories: 優惠項目字典
            
        Returns:
            Tuple[bool, Optional[str]]: (是否有效, 錯誤訊息)
        """
        if categories is None:
            return True, None
        
        if not isinstance(categories, dict):
            return False, "benefit_categories must be a dictionary"
        
        allowed_keys = set(Config.MOCK_LOVE_STATS["benefit_categories"].keys())
        
        for key, value in categories.items():
            # 檢查是否為允許的欄位
            if key not in allowed_keys:
                return False, f"Unknown benefit category: {key}"
            
            # 檢查數值是否有效
            is_valid, error_msg = DataValidator.validate_positive_integer(value, key)
            if not is_valid:
                return False, error_msg
        
        return True, None

# 愛心公益數據服務
class LoveStatsService:
    """愛心公益數據服務類別"""
    
    @staticmethod
    def get_current_stats() -> Dict:
        """
        取得當前愛心公益統計數據
        
        Returns:
            Dict: 統計數據
        """
        stats = Config.MOCK_LOVE_STATS.copy()
        
        # 優先使用記錄的更新時間，如果沒有則使用當前時間
        if "last_updated" in stats:
            stats["updatedAt"] = stats["last_updated"]
        else:
            stats["updatedAt"] = datetime.now(timezone.utc).isoformat()
        
        logger.info("Love stats data retrieved successfully")
        return stats
    
    @staticmethod
    def update_stats(data: Dict) -> Tuple[bool, Optional[str]]:
        """
        更新愛心公益統計數據
        
        Args:
            data: 要更新的數據
            
        Returns:
            Tuple[bool, Optional[str]]: (是否成功, 錯誤訊息)
        """
        try:
            # 驗證基本統計
            donation = data.get('donation')
            is_valid, error_msg = DataValidator.validate_positive_integer(donation, 'donation')
            if not is_valid:
                return False, error_msg
            
            # 驗證優惠項目
            benefit_categories = data.get('benefit_categories')
            is_valid, error_msg = DataValidator.validate_benefit_categories(benefit_categories)
            if not is_valid:
                return False, error_msg
            
            # 更新模擬數據（未來可替換為資料庫寫入）
            if donation is not None:
                Config.MOCK_LOVE_STATS["donation"] = donation
            
            if benefit_categories:
                for key, value in benefit_categories.items():
                    if value is not None:
                        Config.MOCK_LOVE_STATS["benefit_categories"][key] = value
            
            # 記錄更新時間
            Config.MOCK_LOVE_STATS["last_updated"] = datetime.now(timezone.utc).isoformat()
            
            logger.info(f"Love stats updated successfully: {data}")
            return True, None
            
        except Exception as e:
            logger.error(f"Error updating love stats: {str(e)}")
            return False, "Internal server error during update"

# 路由裝飾器 - 速率限制檢查
def rate_limit_required(f):
    """速率限制裝飾器"""
    def decorated_function(*args, **kwargs):
        client_ip = request.remote_addr or 'unknown'
        
        if not rate_limiter.is_allowed(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return jsonify({"error": "Rate limit exceeded"}), 429
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

# === 前端路由 ===

@app.route("/")
def home():
    """首頁"""
    return render_template("home.html")

@app.route("/about")
def about():
    """關於我們頁面"""
    return render_template("about.html")

@app.route("/menu")
def menu():
    """菜單頁面"""
    return render_template("menu.html")

@app.route("/news")
def news():
    """最新消息頁面"""
    return render_template("news.html")

@app.route("/love")
def love():
    """愛心公益頁面"""
    return render_template("love.html")

@app.route("/admin")
def admin():
    """管理員介面"""
    return render_template("admin.html")

# === 健康檢查端點 ===

@app.route("/healthz")
def health_check():
    """健康檢查端點"""
    return jsonify({"status": "ok"})

# === API 路由 ===

@app.route("/api/love-stats", methods=["GET"])
@rate_limit_required
def api_get_love_stats():
    """
    取得愛心公益數字 API (GET)
    
    Returns:
        JSON: 愛心公益統計數據
    """
    try:
        stats = LoveStatsService.get_current_stats()
        
        response = jsonify(stats)
        response.headers['Cache-Control'] = f'public, max-age={Config.API_CACHE_MAX_AGE}'
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving love stats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/love-stats", methods=["POST"])
@rate_limit_required
def api_update_love_stats():
    """
    更新愛心公益數字 API (POST)
    
    Returns:
        JSON: 更新結果
    """
    try:
        # 驗證請求格式
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # 更新數據
        success, error_msg = LoveStatsService.update_stats(data)
        
        if not success:
            return jsonify({"error": error_msg}), 400
        
        logger.info("Love stats updated successfully")
        return jsonify({"message": "Stats updated successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error in love stats update API: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# === 錯誤處理器 ===

@app.errorhandler(404)
def not_found_error(error):
    """404 錯誤處理"""
    logger.warning(f"404 error: {request.url}")
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(429)
def rate_limit_error(error):
    """429 速率限制錯誤處理"""
    return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429

@app.errorhandler(500)
def internal_error(error):
    """500 內部錯誤處理"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

# === 應用程式啟動 ===

if __name__ == "__main__":
    logger.info("Starting 麻煮MINI石頭火鍋 Flask application...")
    
    # 從環境變數取得埠號，預設為 8000
    import os
    port = int(os.environ.get('PORT', 8000))
    
    # 開發環境設定
    app.run(
        debug=True,      # 開發模式：自動重載 + 偵錯頁面
        host='0.0.0.0',  # 允許外部連接
        port=port        # 使用環境變數埠號
    )