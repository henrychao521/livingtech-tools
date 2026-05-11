# 數位線鋸機 ｜ 生活科技互動教學平台

> 對應 108 課綱・國中生活科技｜五大模組闖關制學習

一個純前端、零相依的互動教學平台，讓學生在進實作教室前，先在數位環境中熟悉線鋸機的結構、安全規範、操作步驟，並透過 Canvas 模擬器累積肌肉記憶。

---

## ✨ 功能模組

| 模組 | 內容 | 互動形式 |
|---|---|---|
| **M1 認識線鋸機** | 8 個部位的名稱、功能、冷知識 | SVG 熱點點擊 |
| **M2 安全規範闖關** | 服儀檢查 + 7 題情境判斷 | 拖曳 + 選擇題（95 分過關） |
| **M3 操作步驟教學** | 8 個分解步驟，含動畫示範 | 步驟導覽 + SVG 動畫 |
| **M4 模擬切割練習** | 5 個關卡（直線→愛心） | Canvas 拖曳模擬，三星評分 |
| **M5 創作挑戰** | 9 個圖樣 + 自訂上傳 | 切割計畫書（可列印） |

加碼：
- 🔊 Web Audio 即時音效（鋸條運轉、警告、星星）
- 🏆 8 個成就徽章（首頁顯示）
- 📊 學習進度儀表板（自動儲存於瀏覽器）
- 📱 響應式設計（桌機 / 平板皆可）

---

## 🚀 快速開始

### 方式 1：直接打開（最簡單）

```bash
# 雙擊 index.html 即可
open index.html
```

> ⚠️ 注意：直接以 `file://` 開啟時，部分瀏覽器（如 Chrome）可能限制 localStorage。建議用方式 2。

### 方式 2：本機伺服器（推薦）

```bash
# Python 3（macOS 內建）
python3 -m http.server 8080

# 或 Node.js
npx serve

# 或 PHP
php -S localhost:8080
```

打開瀏覽器 → `http://localhost:8080`

### 方式 3：VS Code Live Server

1. 安裝 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 套件
2. 右鍵 `index.html` → Open with Live Server

### 方式 4：部署到 GitHub Pages（讓學生線上使用）

1. 進入 GitHub repo 設定 → Pages
2. Source 選 `Deploy from a branch` → `main` 分支 → `/ (root)`
3. 等 1–2 分鐘即可在 `https://<你的帳號>.github.io/livingtech-tools/` 使用

---

## 📚 給教師的使用建議

### 建議排課方式（共 3 節課）

**第 1 節（50 分鐘）：認識與安全**
- 模組 1：認識線鋸機（15 分鐘）
- 模組 2：安全規範闖關（10 分鐘，必須滿分通關）
- 模組 3：操作步驟教學（15 分鐘）
- 課末小測：用模組 2 的成績作為通行證

**第 2 節（50 分鐘）：模擬練習**
- 模組 4：五個關卡（30 分鐘）
- 配合學習單記錄星等與失誤紀錄
- 教師可看學生螢幕，了解誰需要協助

**第 3 節（50 分鐘）：實體操作**
- 進實作教室操作真機台
- 回家作業：用模組 5 完成個人作品的切割計畫書

### 對應 108 課綱

- **生 J-A2**：工具與機具的安全使用
- **生 J-B3**：設計與製作能力

---

## 🏗 技術架構

```
livingtech-tools/
├── index.html              # 首頁（模組地圖 + 進度儀表板 + 成就徽章）
├── css/
│   └── style.css           # 全站樣式（含動畫、響應式）
├── js/
│   ├── main.js             # 共用：進度儲存、Toast、首頁儀表板
│   ├── audio.js            # Web Audio API 音效引擎
│   ├── achievements.js     # 成就徽章系統
│   ├── module1.js          # 認識線鋸機
│   ├── module2.js          # 安全闖關
│   ├── module3.js          # 步驟教學
│   ├── module4.js          # Canvas 切割模擬器（核心）
│   └── module5.js          # 創作挑戰
└── pages/
    └── module1~5.html      # 各模組頁面
```

### 技術選擇

- **零相依**：純 HTML5 + CSS3 + Vanilla JavaScript
- **無建置工具**：不用 npm、webpack、bundle，下載即可用
- **進度儲存**：`localStorage`（學生關電腦回來能延續）
- **音效引擎**：Web Audio API（程式生成，無外部音檔）
- **字體**：Noto Sans TC（Google Fonts）+ Inter
- **支援平台**：Chrome / Edge / Safari / Firefox 最新版

---

## 🎮 操作說明（給學生）

1. **首頁**：依序點擊五個模組卡片闖關
2. **拖曳**：可用滑鼠拖曳，也可點擊物品 → 點擊放置區
3. **音效開關**：右下角 🔊 按鈕可隨時切換靜音
4. **進度自動儲存**：關閉瀏覽器再打開，會繼續上次進度
5. **重來**：在瀏覽器開發者工具執行 `localStorage.clear()` 可清空所有進度

---

## 🛠 客製化指引

### 修改安全題目

編輯 `js/module2.js` 中的 `SCENARIOS` 陣列：

```js
const SCENARIOS = [
  {
    q: '你的問題',
    a: '選項 A',
    b: '選項 B',
    correct: 'a',  // 正確答案
    explain: '解釋為什麼',
  },
  // ...
];
```

### 增加新關卡

編輯 `js/module4.js` 中的 `LEVELS` 物件：

```js
L6: {
  name: 'L6 你的關卡',
  desc: '描述',
  path: [[0, 0], [100, 0], ...],  // 切割路徑點
  tolerance: 16,  // 容忍偏移量
}
```

### 增加新圖樣

編輯 `js/module5.js` 中的 `TEMPLATES` 陣列。

---

## 🐛 已知限制

- M5 上傳 SVG 目前只取簡化外框（精細路徑解析待 v2）
- M4 模擬器在低效能裝置（5 年以上的平板）可能掉幀
- 進度儲存於瀏覽器，跨裝置不同步（待加教師後台）

---

## 📅 路線圖

- [ ] **v1.1**：教師後台（班級進度、派任務、匯出成績）
- [ ] **v1.2**：3D 線鋸機檢視（Three.js）
- [ ] **v1.3**：擴充其他工具（鑽床、砂帶機、熱熔膠槍）
- [ ] **v2.0**：跨裝置同步（Firebase）

---

## 📄 授權

### 程式碼
本專案為 **珩宇老師製作**的生活科技互動教學平台原型。原始碼未經授權請勿用於商業用途。

### 圖片授權聲明（重要）
本平台 `/assets/wiki-photos/` 目錄收錄 **7 張** Wikimedia Commons 公開授權圖片，包含：

- 多數為 **CC BY-SA**（Creative Commons 姓名標示-相同方式分享）授權
- 部分為 **公有領域**（Public Domain）

> **依 CC BY-SA「Share-Alike（相同方式分享）」條款**：
> 凡使用本平台之 CC BY-SA 圖片所製作之衍生作品（fork / 改作 / 商品化等），須以相同的 CC BY-SA 授權釋出，並完整保留原作者署名與授權連結。

每張圖片在平台介面與 [`LICENSE_IMAGES.md`](LICENSE_IMAGES.md) 都列有完整 attribution（作者姓名、授權代號、來源 URL、授權條款 URL）。下游使用者請勿移除這些資訊。

---

## 🙋 支援

若需修改、擴充或反饋問題，請聯絡專案作者或開 Issue。
