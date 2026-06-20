# 開源 3D 模型原始檔(OpenSCAD)

這個資料夾收錄全平台教具的 **OpenSCAD 參數化原始碼(`.scad`)** 與已輸出的 **`.stl`(可直接 3D 列印)**。
歡迎老師/學生自行修改尺寸、重新輸出、列印或匯入其他軟體。

## 為什麼有兩套 3D?

| | 網頁上顯示的(`<tool>/assets/models/*.glb`) | 這裡的(`models/*/*.scad` + `.stl`) |
|---|---|---|
| 來源 | Tripo AI 生成(寫實外觀) | 手寫 OpenSCAD 參數化建模(示意/結構清晰) |
| 用途 | 網頁「認識」單元的**寫實旋轉模型**(辨識實物外形) | **開源可修改、可 3D 列印**的教具原始檔 |
| 顏色 | 有材質貼圖 | `.scad` 內有色彩標註;`.stl` 為單色(列印用) |
| 編輯 | 不可改(AI 生成網格) | 改幾個參數就能重生,適合自製/教學 |

**結論:兩套並存,各司其職。** 網頁用 Tripo 寫實模型幫學生辨識實物;這裡的 OpenSCAD 原始檔給想動手做、改尺寸、3D 列印的人參考。

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
