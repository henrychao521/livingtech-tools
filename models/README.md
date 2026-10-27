# 開源 3D 模型原始檔(OpenSCAD)

這個資料夾收錄全平台教具的 **OpenSCAD 參數化原始碼(`.scad`)** 與已輸出的 **`.stl`(可直接 3D 列印)**。
歡迎老師/學生自行修改尺寸、重新輸出、列印或匯入其他軟體。

## 為什麼有兩套 3D?

| | 網頁上顯示的(`<tool>/assets/models/*.glb`) | 這裡的(`models/*/*.scad` + `.stl`) |
|---|---|---|
| 來源 | 13 件已改為 **build123d 參數化建模、依型錄／標準實際尺寸**(原始碼 `models/tool-glb/`,2026-10-28);其餘(能源、動力、簡單機械)仍是 Tripo AI 生成 | 手寫 OpenSCAD 參數化建模(示意/結構清晰) |
| 用途 | 網頁「認識」單元的旋轉模型(辨識實物外形) | **開源可修改、可 3D 列印**的教具原始檔 |
| 顏色 | PBR 材質(金屬、塑膠、木頭) | `.scad` 內有色彩標註;`.stl` 為單色(列印用) |
| 編輯 | `tool-glb/` 改尺寸後重跑即可(見各檔檔頭的尺寸出處);AI 生成的不可改 | 改幾個參數就能重生,適合自製/教學 |

`models/tool-glb/` 重新產生 glb:`~/text-to-cad/.venv/bin/python <名稱>.py`(輸出零件 STL 與 manifest)→
`blender -b -P assemble_glb.py -- <零件資料夾> <輸出.glb>`;驗收用 `render_views.py`、`measure_glb.py`、`vlm_check.py`。
已重畫:手電鑽、鑽床、線鋸機、砂帶砂盤機、3D 印表機、麵包板、Arduino UNO、桁架橋,以及手工具的羊角錘、美工刀、活動扳手、尖嘴鉗、十字起子。

**結論:兩套並存,各司其職。** 網頁用 glb 模型幫學生辨識實物;這裡的 OpenSCAD 原始檔給想動手做、改尺寸、3D 列印的人參考。

## 使用方式

1. 安裝 [OpenSCAD](https://openscad.org/)(免費)。
2. 開啟任一 `.scad`(同目錄的 `_common.scad` 是共用樣式,需一起放著)。
3. 改參數 → 預覽(F5)→ 算繪(F6)→ 匯出 STL/3MF。
4. 或直接拿現成的 `.stl` 丟進切片軟體列印。

## 模型清單(18 類 / 74 件)

| 類別 | 模型 |
|---|---|
| 簡單機械 simple-machines | 槓桿 lever、滑輪 pulley、輪軸 wheel-axle、斜面 inclined-plane、楔形 wedge、螺旋 screw |
| 三視圖立體 orthographic | cube、cylinder、cone、sphere、pyramid、wedge、L-block、step、T-slot、bracket、hole |
| 手工具 hand-tools | hammer、driver、pliers、wrench、knife、saw、file、clamp、measure、punch |
| 機構 mechanism | gear、cam、crank、four-bar、ratchet、belt |
| 能源 energy | fossil、nuclear、solar、wind、hydro |
| 動力系統 powertrain | ice-engine、ev-motor、fuel-cell、hybrid、hydraulic |
| 結構 structure-sim | truss、arch、frame、shell、cable、tensile |
| 液壓手臂 hydraulic-arm | arm-base、arm-lower、arm-upper、arm-gripper、syringe |
| 微控制器 microcontroller | arduino、esp32、microbit |
| 機台 | drill、drill-press、sander、scrollsaw、printer3d、breadboard、solder(iron) |
| FRC | robot |

> 每個 `.scad` 旁都有同名 `.stl`(已輸出,可直接列印)。改完 `.scad` 重新 F6→匯出即可更新。
