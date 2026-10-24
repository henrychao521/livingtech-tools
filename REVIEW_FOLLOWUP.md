# 全站審查後續處理說明

> 對應 PR：https://github.com/henrychao521/livingtech-tools/pull/1
> 分支：`claude/busy-albattani-c870wt`（9 個 commit、114 個檔案）
> 本文件分三部分：① 這次已修正什麼　② 需要在本機處理的事項　③ 可直接貼進本機 Claude Code 對話的指令

---

## ① 已修正摘要（依 commit）

| commit | 範圍 | 重點 |
|---|---|---|
| d459762 | 機電／FRC／微控制器 | FRC 2024 重量 125 lb、bumper 規格、swerve 8 馬達＋4 CANcoder、Phoenix 6 `getValueAsDouble()`；微控制器程式區塊補 `white-space:pre`、按鈕補 GND 回路、避障加 L298N；arduino/esp32/microbit/robot .scad 排針、USB、LED 矩陣、輪位 |
| 14ad082 | 手電鑽／鑽床 | 扭力環刻度三處統一順時針、轉速表指針、F/R 弧線、木材轉速 800–1500、磁磚題改關電鎚；鑽床部件圖鑽頭不再穿透工件、步驟星號改 strong、預留高度 1–2 cm、鑰匙模擬器起點；drill.scad 改槍型、drill-press.scad 主軸移到立柱前 |
| 274d9fc | 烙鐵／麵包板 | 首頁紅＋黑−、電阻色環 220Ω、直行編號對齊、故障圖鑑接線軌；PPE 放置框對位、SMD 溫度統一、SMD 關卡補元件、完美焊點去裸孔；breadboard.scad 孔距 2.54 與示範迴路、iron.scad 防滑環外露 |
| ec29d0b | 線鋸機 | 鋸齒朝下、壓料腳貼板、吹氣管對切割點、照片說明依實圖、LICENSE 路徑；Three.js 下夾頭移台面下、鋸條接通、啟動歸位；M3 五個動畫、M4 愛心 sin³、鋸齒朝進給方向、成就 9 步；scrollsaw.scad 鋸片穿過台面並補壓料腳 |
| 2038de1 | 雷切／3D 列印／Onshape | 雷切 M1 新增機器部件與光路 SVG、死連結、刻線用語；印表機 PETG 說法、熱床標籤、截面圖重疊；Onshape M3/M4 動畫 opacity 被 inline style 蓋住（原本整段不顯示）、Extrude 方向、XYZ 軸色、版本說明；printer3d.scad 料架、噴嘴高度、Z 軸、擠出機 |
| 0b56472 | 能源／STEAM／新興科技／教師端／共用 | 燃煤 820g 漏改、首頁卡片描述、課綱編碼（生 J-A2/J-B3/J-C3 不存在 → P-IV／A-IV／設 c-IV-1）、透鏡焦點、manual.html 操作說明；wind/hydro/solar .scad 葉片、水庫、傾角 |
| 433ea23 前一筆 | 橋梁工程師／結構模擬器 | 普拉特豎桿受力補說明、地震力分類、比強度、混凝土抗張、台灣桁架橋例、紙橋目標統一；首頁華倫桁架重畫、桁架縮圖、力標籤避讓、−0.0kN、卡片縮圖溢出；truss/arch/shell/cable/frame .scad |
| 三視圖／機構／簡單機械／動力 | | L 型與階梯塊側視可見邊、圓孔虛線對正、Round 3 投影方向、wedge.scad 截面方向（wedge.stl 已手動重建）、CNS 3 尺寸數字；齒輪模擬器嚙合、滑輪組繩路重畫；gear/belt/cam/lever/pulley/inclined-plane/wedge/screw/fuel-cell/hydraulic/ice-engine .scad |
| 433ea23 | 砂磨機／手工具 | 馬達與集塵口重疊、PPE 對位、帶式模擬工件貼砂帶、靠尺示意、粒度模擬壓板；活動扳手題答案反了、銼刀握法、引註；sander.scad 砂盤改直立、hammer/driver/pliers/wrench/knife/saw/clamp .scad |

---

## ② 需要在本機處理的事項

### A. 重新輸出 3D 模型（雲端環境沒有 OpenSCAD，只做了語法與座標核對）

以下 .scad 已修改，對應的 `.stl` 與 `-iso.png` 都是舊的，網頁上「3D 模型參考圖」區塊會顯示舊圖：

| 目錄 | 檔案 |
|---|---|
| models/drill | drill |
| models/drill-press | drill-press |
| models/scrollsaw | scrollsaw |
| models/sander | sander |
| models/hand-tools | hammer、driver、pliers、wrench、knife、saw、clamp |
| models/breadboard | breadboard |
| models/solder | iron |
| models/printer3d | printer3d |
| models/energy | wind、hydro、solar（nuclear、fossil 只改註解，不必重出） |
| models/structure-sim | truss、arch、shell、cable、frame |
| models/orthographic | wedge（.stl 已手動重建，**只需重出 PNG**） |
| models/mechanism | gear、belt、cam |
| models/simple-machines | lever、pulley、inclined-plane、wedge、screw |
| models/powertrain | fuel-cell、hydraulic、ice-engine |
| models/frc | robot |
| models/microcontroller | arduino、esp32、microbit |

做法：`bash scripts/build_models.sh`（腳本會依時間戳只重做改過的；`--png-only` 可只重出圖）。腳本內 OpenSCAD 路徑寫死為 `/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD`，若版本不同要改。

**重出後務必逐張看 -iso.png**，確認幾何真的符合預期（例如電鑽是槍型、線鋸機鋸片露在台面上、風機三葉片在輪轂上、拱橋開口向下、麵包板 LED 不在溝槽裡）。雲端只能靜態推算座標，沒有實際算繪過。

### B. 重新匯出 GLB（Blender）

這兩組 GLB 是從同一份 .scad 匯出的，帶有相同錯誤：

- `structure-sim/assets/models/{truss,arch,shell,cable,frame}.glb`（tensile 未改）
- `orthographic/assets/models/wedge.glb`

流程：STL → Blender 匯入 → 匯出 glTF Binary（沿用原本的匯出設定）。

### C. 在真實瀏覽器確認

headless Chromium 沒有 GPU，以下只能在本機瀏覽器確認：

- 各模組 M1 的 `<model-viewer>` GLB 正常載入（特別是 printer3d、sander、microcontroller）
- `scrollsaw/pages/module1.html` Three.js 線鋸機：下夾頭在台面下、鋸條接通上下夾頭、按「啟動」鋸條在原位往復、停止後歸位
- `orthographic/pages/module4.html` 楔形塊：正視三角形、俯視矩形
- `onshape/pages/module3.html`、`module4.html` 四種建模動畫可見
- `mechanism/pages/module4.html` 齒輪組兩輪不重疊；`simple-machines/pages/module4.html` 滑輪組繩路

### D. 需人工查證的時效性／外部資料（未改動）

- FRC：`frc/js/module1.js:5`、`frc/index.html:169` 終局 20 秒；`frc/pages/module6.html:179` 2026 兩套 field layout、2027 Command-based v2
- Onshape：`onshape/pages/module2.html` 方案價格與「Standard 5 個專案」限制
- 雷切：`lasercut/pages/module1.html` PM2.5 以「環保署 24 小時值 35 μg/m³」為標準線，主管機關已改制環境部，標準可能修訂；建議加註「2019 年當時標準」
- 手電鑽：`drill/js/module2.js` 事故案例卡「CPSC 每年約 40 萬人次」連結指向 CPSC 電池商業指引頁；HSE INDG229 實際標題為 "Using work equipment safely"
- 橋梁：`structure/js/module1.js` 橋型圖鑑台灣例「石碇橋・中橫谷關段」「關西大橋」等地名
- 能源：`energy/js/module4.js` 每度成本與建廠成本為概估，未標年度與出處；`energy/js/module1.js` 核能「2025 年 5 月起為 0」寫死

### E. 建議另開工作（超出最小修正）

- `manual.html` 缺 lasercut、mechatronics、emerging-tech、steam、physics 五章（含截圖）
- `js/sources.js` 缺 `structure`（橋梁工程師）與 `physics` 的來源清單，physics 頁尾不會出現來源區塊
- `scrollsaw/js/module5.js:377-380` 上傳 SVG 功能是 stub，不論內容一律用固定正方形分析
- `structure-sim/pages/module1.html` 舞台 SVG 是「有豎桿的華倫式」且兩端無端柱，可改成純華倫與首頁一致
- `structure/js/module3.js` 普拉特說明卡 SVG 仍畫 3 根藍色豎桿（荷重在上弦情形），只加了文字說明
- `models/orthographic/lblock.scad` 與 `step.scad` 幾何同型，三視圖無法區分；建議階梯塊改三段或 L 型改不等深
- `models/mechanism/fourbar.scad` 桿長 30/35/36/60 為非 Grashof 雙搖桿，與 M1「曲柄搖桿」描述不符
- `models/README.md` 寫「同目錄的 `_common.scad` 需一起放著」，但 solder、breadboard 目錄沒有也不需要
- `breadboard/js/module3.js` 步驟 5 LED 動畫兩腳同時向上下延伸，與文字對不上
- `scrollsaw` M1 SVG 與 M3 blade 動畫的下夾頭仍畫在台面「上」（2D 側視簡化）

### F. 小瑕疵（已知、可不處理）

- `frc/pages/module1.html` 示意 SVG bumper 標 2026 但夾 2024 的 NOTE；PDH 標 24ch 只畫 10 燈
- `frc/js/module5.js:443` 腦力激盪三方案評分 12/11/11 卻選 #3
- `hand-tools/js/module2.js:2` 註解「A 迷思 B 正解」與實際題目不符
- `drill-press/pages/module1.html` 皮帶箱 SPDL 主軸輪不在主軸正上方
- `models/microcontroller/arduino.scad:76` 「裁角」實為多加方塊、DIP 每側 7 pin
- `models/hand-tools/measure.scad` 尺帶刻度半藏殼內、`file.scad` 尖端圓錐
- `models/hydraulic-arm/arm-base.scad` 耳孔是實心圓柱非挖孔
- `mechanism/js/module1.js` 未使用的 `vizAnim` 小輪轉 540° 應 720°
- `simple-machines/js/module2.js` 第二、三類槓桿支點三角形穿過桿身

---

## ③ 貼進本機 Claude Code 對話的指令

複製下面整段（從「---開始---」到「---結束---」之間）：

---開始---

我在 `livingtech-tools` 倉庫根目錄。雲端審查已把全站內容、SVG、OpenSCAD 修正推到分支 `claude/busy-albattani-c870wt`（PR #1），但雲端沒有 OpenSCAD 與 GPU，有幾件事要在本機完成。請依序做，每一步做完回報結果再往下，所有改動 commit 到同一分支並 push。詳細清單在 `REVIEW_FOLLOWUP.md`，請先讀它。

**步驟 1：切到分支並確認環境**
```
git fetch origin claude/busy-albattani-c870wt && git checkout claude/busy-albattani-c870wt && git pull
```
確認 OpenSCAD CLI 存在；`scripts/build_models.sh` 內的路徑寫死為 `/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD`，若本機版本不同就改那一行。確認 Blender 可用（`blender --version`）。

**步驟 2：重新輸出 STL 與 PNG**
執行 `bash scripts/build_models.sh`，把輸出貼給我。若有 ERROR，打開對應 .scad 修到能算繪為止（錯誤多半是語法或變數名稱，不要改變幾何意圖）。`models/orthographic/wedge.stl` 已手動重建，只重出 PNG 即可。

**步驤 3：逐張檢視 -iso.png**
用 Read 工具看 `REVIEW_FOLLOWUP.md` ② A 表格列出的每一張 `-iso.png`，對照同名 .scad 開頭的註解與 `models/README.md` 的模型清單，確認幾何合理：
- drill 是槍型（水平機身、向下握把、前端夾頭鑽頭）；drill-press 鑽頭露在立柱前方、位於工作台正上方
- scrollsaw 鋸片露在台面上、有壓料腳；sander 砂盤直立、砂帶為環帶
- hammer 看得到 V 形羊角、driver 露出十字頭、pliers 握把向後張開、wrench 是 U 形開口、saw 齒在鋸條平面內
- breadboard 孔為 2.54mm 間距、溝槽兩側各 5 列、LED 與電阻跨在孔位上
- printer3d 線材捲掛在頂樑、噴嘴貼物件頂面、有 Z 軸螺桿與擠出機
- wind 三葉片都在輪轂上；hydro 水庫在壩後上游側、廠房在壩趾外；solar 面板傾斜約 25°
- truss 斜桿接到上弦呈普拉特 V 形；arch 開口向下、橋面在拱上；shell 是半球；cable 主纜為下垂曲線且吊桿接到主纜；frame 頂層樑落在柱頂
- gear 兩輪共面嚙合；belt 皮帶貼住兩輪；cam 從動件貼住凸輪
- lever 支點在桿正下方；pulley 繩繞過輪頂；inclined-plane 斜面立起且方塊貼在斜面上；simple-machines/wedge 刃口插進木塊頂面；screw 螺紋外露、六角頭在軸端
- fuel-cell 閥門露出瓶頂；hydraulic 回油管接回油箱；ice-engine 歧管在缸列兩側各 4 支
- robot 六輪左右對稱；arduino 排針沿兩長邊；esp32 USB 與天線在兩端；microbit LED 矩陣在板面中央
任何一張不符合，就修 .scad、重跑 `bash scripts/build_models.sh <目錄> --png-only` 直到正確。

**步驟 4：重新匯出 GLB**
`structure-sim/assets/models/{truss,arch,shell,cable,frame}.glb` 與 `orthographic/assets/models/wedge.glb` 來自同一份 .scad，需從新的 .stl 用 Blender 重匯 glTF Binary。先看倉庫有沒有既有的匯出腳本或 git log 提到匯出方式；沒有就用 Blender Python（`bpy.ops.import_mesh.stl` → `bpy.ops.export_scene.gltf(export_format='GLB')`）批次匯出，單位與方向沿用舊 GLB（可先讀舊檔的 bounding box 比對尺度）。

**步驟 5：在真實瀏覽器驗證**
`python3 -m http.server 8080` 後用瀏覽器開以下頁面並截圖給我看：
- `scrollsaw/pages/module1.html`：3D 分頁的下夾頭在台面下、鋸條連到上下夾頭、按啟動鋸條原位往復、停止後歸位；`<model-viewer>` GLB 正常
- `orthographic/pages/module4.html`：楔形塊正視三角形、俯視矩形；`orthographic/pages/module1.html` 的 wedge.glb 立面正確
- `structure-sim/pages/module1.html`：6 個 GLB 載入正常、形狀與名稱相符
- `onshape/pages/module3.html`、`module4.html`：四種建模動畫可見
- `mechanism/pages/module4.html` 齒輪不重疊；`simple-machines/pages/module4.html` 滑輪組繩路；`printer3d/pages/module1.html`、`sander/pages/module1.html`、`microcontroller/pages/module1.html` 的 GLB 正常

**步驟 6：人工查證項目**
`REVIEW_FOLLOWUP.md` ② D 列的時效性資料，請逐條上網查最新官方來源（FIRST 官方手冊、Onshape 官網、環境部空氣品質標準、CPSC／HSE 原始頁面）後修正文字與連結，每條在 commit 訊息註明依據。查不到確切依據的保留原文並告訴我。

**步驟 7：Commit 與 push**
分批 commit（模型輸出一筆、GLB 一筆、查證修正一筆），訊息用繁體中文，推到 `claude/busy-albattani-c870wt`。最後回報：重出了幾個 STL／PNG／GLB、哪幾張圖修了第二次、查證改了哪幾條、還有哪些沒解決。

② E「建議另開工作」的項目這次不要做，等我另外指示。

---結束---
