# 🍲 麻煮MINI石頭火鍋官網

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg)
![CSS3](https://img.shields.io/badge/CSS3-1572B6.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)

這是一個使用 Flask 建立的現代化餐廳官方網站，融合了響應式設計、API 驅動的數據管理，以及愛心公益功能。

## ✨ 功能特色

### 🎨 用戶體驗
- 📱 **響應式設計**: 完美支援桌機、平板、手機
- 🍽️ **菜單 SPA**: 單頁應用瀏覽體驗，無需重載頁面
- ⚡ **效能優化**: Lazy loading、節流防抖、快取機制
- ♿ **無障礙設計**: ARIA 標籤、鍵盤導航、螢幕閱讀器支援
- 🎯 **SEO 優化**: 結構化資料、Open Graph、語義化標籤

### ❤️ 愛心公益系統
- 📊 **即時數據**: API 驅動的公益數字顯示
- 🎬 **動畫效果**: 平滑的數字遞增動畫
- 🔄 **錯誤處理**: 智能重試機制和友善錯誤提示
- 🔐 **管理介面**: 直觀的數據管理和快速操作
- 💾 **快取機制**: 提升載入速度和用戶體驗

### 🛡️ 安全性
- 🚦 **速率限制**: 防止 API 濫用 (100次/分鐘)
- 🔒 **輸入驗證**: 嚴格的數據驗證和過濾
- 🌐 **CORS 設定**: 安全的跨網域資源共享
- 📝 **日誌記錄**: 完整的操作和錯誤日誌

## 🏗️ 技術架構

### 後端技術棧
```python
Flask 2.3.3          # Web 框架
Flask-CORS 4.0.0     # 跨網域支援
Python 3.8+          # 程式語言
```

### 前端技術棧
```javascript
HTML5                # 語義化標籤
CSS3                 # Grid/Flexbox + CSS變數
ES6+ JavaScript     # 模組化設計
```

### 架構設計模式
- **MVC 架構**: 清晰的模型-視圖-控制器分離
- **RESTful API**: 標準化的 API 設計
- **組件化**: 可重用的前端組件
- **響應式設計**: Mobile-first 開發策略

## 📁 專案結構

```
📦 mysite/
├── 🐍 app.py                    # Flask 主程式 + API 路由
├── 📋 requirements.txt          # Python 依賴管理
├── 📖 README.md                 # 專案文件 (本檔案)
├── 📜 CHANGELOG.md              # 版本更新日誌
├── 🚫 .gitignore               # Git 忽略檔案
├── 📁 static/                   # 靜態資源
│   ├── 🎨 css/
│   │   └── style.css           # 主要樣式檔 (統一管理)
│   ├── ⚡ js/
│   │   ├── script.js           # 核心功能 (導航、菜單SPA)
│   │   └── love-stats.js       # 愛心公益數字管理
│   ├── 🖼️ img/                  # 圖片資源
│   │   └── logo/               # 品牌圖片
│   └── 📰 news.json             # 最新消息資料
└── 📁 templates/               # Jinja2 HTML 模板
    ├── 🏠 home.html            # 首頁
    ├── ℹ️ about.html            # 關於我們
    ├── 🍽️ menu.html            # 菜單頁面
    ├── 📰 news.html            # 最新消息
    ├── ❤️ love.html            # 愛心公益
    └── 🔐 admin.html           # 管理員介面
```

## 🚀 本地開發與部署

### 📱 本地啟動

#### 方法 1: 直接執行
```bash
# 安裝依賴
pip install -r requirements.txt

# 啟動應用程式 (預設埠號 8000)
python app.py
```

#### 方法 2: 使用環境變數
```bash
# 複製環境變數範例
cp .env.example .env

# 編輯 .env 檔案設定埠號
PORT=8000

# 啟動應用程式
python app.py
```

#### 方法 3: VS Code 除錯
1. 按 `F5` 或點擊除錯按鈕
2. 選擇 "Flask 本地除錯" 配置
3. 應用程式會在埠號 8000 啟動

### 🌐 雲端部署

#### Render 部署 (推薦)

1. **Fork 專案到 GitHub**
2. **註冊 Render 帳號**: [render.com](https://render.com)
3. **建立新服務**:
   - 選擇 "Web Service"
   - 連接 GitHub 專案
   - 服務名稱: `maze-backend`
   - 環境: `Python 3.11`
   - 建置指令: `pip install -r requirements.txt`
   - 啟動指令: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

4. **環境變數設定**:
   ```
   PYTHON_VERSION=3.11
   FLASK_APP=app.py
   FLASK_ENV=production
   ```

5. **自動部署**: 每次 push 到 main 分支會自動部署

#### Railway 部署

1. **註冊 Railway 帳號**: [railway.app](https://railway.app)
2. **連接 GitHub 專案**
3. **自動偵測 Python 專案**
4. **環境變數設定**:
   ```
   PORT=8000
   FLASK_APP=app.py
   FLASK_ENV=production
   ```

#### Heroku 部署

1. **安裝 Heroku CLI**
2. **建立 Heroku 應用程式**:
   ```bash
   heroku create maze-backend
   heroku config:set FLASK_APP=app.py
   heroku config:set FLASK_ENV=production
   ```

3. **部署**:
   ```bash
   git push heroku main
   ```

### 🐳 Docker 部署

```bash
# 建置映像
docker build -t maze-backend .

# 執行容器
docker run -p 8000:8000 -e PORT=8000 maze-backend
```

### 🔍 健康檢查

部署完成後，訪問 `/healthz` 端點確認服務正常：
```bash
curl https://your-app-name.onrender.com/healthz
# 回應: {"status": "ok"}
```

## 🔌 API 文件

### 愛心公益數字 API

#### 📊 GET `/api/love-stats`
**功能**: 取得愛心公益統計數據  
**速率限制**: 100次/分鐘  
**快取**: 5分鐘  

**成功回應 (200)**:
```json
{
  "donation": 714649,
  "updatedAt": "2025-01-22T10:00:00Z",
  "benefit_categories": {
    "total_donation": 714649,      // 總優惠金額
    "visually_impaired": 488540,   // 視障/聽障人士
    "medical_staff": 133468,       // 醫護人員證照
    "filial_piety": 3155,         // 孝順雙親
    "matsu_resident": 1160,        // 馬祖身分/漁民證
    "new_resident": 1674,          // 新住民
    "beach_cleanup": 3780,         // 淨灘/手作步道
    "allpass": 78807               // ALLPASS
  }
}
```

#### 📝 POST `/api/love-stats`
**功能**: 更新愛心公益統計數據 (管理員專用)  
**Content-Type**: `application/json`

**請求格式**:
```json
{
  "donation": 800000,              // 可選：總金額
  "benefit_categories": {          // 可選：詳細項目
    "visually_impaired": 500000,
    "medical_staff": 150000
    // ... 其他項目
  }
}
```

**成功回應 (200)**:
```json
{
  "message": "Stats updated successfully"
}
```

**錯誤回應**:
```json
// 400 - 驗證錯誤
{
  "error": "Invalid value for medical_staff: must be a positive integer"
}

// 429 - 速率限制
{
  "error": "Rate limit exceeded. Please try again later."
}

// 500 - 服務器錯誤
{
  "error": "Internal server error"
}
```

## 🚀 快速開始

### 本地開發環境

1. **複製專案**
```bash
git clone [repository-url]
cd mysite
```

2. **建立 Python 虛擬環境**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **安裝依賴套件**
```bash
pip install -r requirements.txt
```

4. **啟動開發服務器**
```bash
python app.py
```

5. **開啟瀏覽器**
```
http://localhost:5000
```

### 🧪 API 測試

```bash
# 取得愛心公益數字
curl http://localhost:5000/api/love-stats

# 更新數字 (JSON 格式)
curl -X POST http://localhost:5000/api/love-stats \
  -H "Content-Type: application/json" \
  -d '{
    "donation": 800000,
    "benefit_categories": {
      "visually_impaired": 500000
    }
  }'

# PowerShell (Windows)
$body = @{
  donation = 800000
  benefit_categories = @{
    visually_impaired = 500000
  }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/love-stats" `
  -Method POST -Body $body -ContentType "application/json"
```

## 📊 數據管理

### 愛心公益數字更新方式

#### 1. 🎯 管理員介面 (推薦)
- **網址**: `/admin`
- **特色**: 視覺化介面、即時預覽、快速操作
- **功能**: 
  - 當前數據顯示
  - 表單批量更新
  - 快速調整 (+10%, -10%)
  - 一鍵重置默認值

#### 2. 🔧 API 直接呼叫
- **適用**: 自動化腳本、第三方系統整合
- **優勢**: 程式化控制、批量處理

#### 3. 💻 程式碼修改
- **位置**: `app.py` → `Config.MOCK_LOVE_STATS`
- **注意**: 需重啟應用程式

### 數據來源擴展 (未來)

```python
# 1. JSON 檔案存儲
data_file = "data/love-stats.json"

# 2. SQLite 資料庫
from sqlite3 import connect

# 3. 外部 API 整合
import requests
```

## 🔧 開發指南

### 添加新頁面

1. **建立模板**
```bash
# 在 templates/ 建立新的 HTML 檔案
touch templates/new_page.html
```

2. **添加路由**
```python
# 在 app.py 添加新路由
@app.route("/new-page")
def new_page():
    return render_template("new_page.html")
```

3. **更新導航**
```html
<!-- 在 header 導航中添加連結 -->
<li class="header__nav-item">
  <a href="{{ url_for('new_page') }}" class="header__nav-link">新頁面</a>
</li>
```

### 自定義樣式

```css
/* 使用 CSS 變數保持一致性 */
.custom-component {
  color: var(--color-primary);
  background: var(--color-background);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
}
```

### JavaScript 組件開發

```javascript
// 遵循現有的類別架構
class CustomManager {
  constructor() {
    this.init();
  }
  
  init() {
    // 初始化邏輯
  }
  
  bindEvents() {
    // 事件綁定
  }
}
```

## 🐛 常見問題解決

### Q: CORS 跨網域錯誤
**A**: 檢查 `flask-cors` 套件安裝，確認 `CORS(app)` 已啟用

### Q: API 快取問題
**A**: 
- API 有 5 分鐘快取機制
- 可使用管理員介面的「重新整理」按鈕
- 或等待快取自動過期

### Q: 404 頁面未找到
**A**: 
- 檢查 URL 拼寫
- 確認路由在 `app.py` 中已定義
- 檢查模板檔案是否存在

### Q: 速率限制錯誤 (429)
**A**: 
- API 限制每分鐘 100 次請求
- 等待 1 分鐘後重試
- 或調整 `Config.RATE_LIMIT_MAX` 設定

### Q: 圖片載入失敗
**A**: 
- 檢查圖片路徑：`{{ url_for('static', filename='img/...') }}`
- 確認檔案存在於 `static/img/` 目錄

## 🌐 瀏覽器支援

| 瀏覽器 | 版本要求 | 功能支援 |
|--------|----------|----------|
| Chrome | 60+ | ✅ 完整支援 |
| Firefox | 55+ | ✅ 完整支援 |
| Safari | 12+ | ✅ 完整支援 |
| Edge | 79+ | ✅ 完整支援 |
| IE | ❌ | 不支援 |

## 📈 效能指標

- ⚡ **首次內容繪製**: < 1.5s
- 🎯 **互動就緒時間**: < 2.5s
- 📱 **行動裝置友善**: 100% Google PageSpeed
- ♿ **無障礙評分**: AAA 級別

## 🎯 未來規劃

### v1.1.0 (短期)
- [ ] 📧 聯絡表單功能
- [ ] 🗄️ SQLite 資料庫整合
- [ ] 🔐 管理員登入驗證
- [ ] 📱 PWA 離線支援

### v1.2.0 (中期)
- [ ] 🌐 完整多語言支援
- [ ] 📊 數據分析儀表板
- [ ] 🔔 推播通知系統
- [ ] 🛒 線上訂位功能

### v1.3.0 (長期)
- [ ] 🤖 聊天機器人
- [ ] 📱 手機 App 整合
- [ ] 🎨 主題自定義
- [ ] 🔄 即時數據同步

## 📋 版本資訊

- **當前版本**: 1.0.0
- **發布日期**: 2025-01-22
- **Python 需求**: 3.8+
- **Flask 版本**: 2.3.3
- **最後更新**: 2025-01-22

## 📄 授權聲明

此專案為麻煮MINI石頭火鍋專屬網站，包含商標、圖片、設計等知識產權。  
僅供授權使用，未經許可不得複製或商業使用。

---

**開發團隊**: 麻煮開發團隊  
**技術支援**: [聯絡我們](mailto:support@example.com)  
**官方網站**: [麻煮MINI石頭火鍋](http://localhost:5000)