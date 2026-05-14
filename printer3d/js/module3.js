// 3D 印表機 模組 3：列印流程
const STEPS = [
  { title: '建模 / 取得 STL', desc: '從 Tinkercad、Fusion 360、Blender 等軟體匯出 STL 檔案，或從 Thingiverse、Printables 下載現成模型。', tip: 'STL 檔本身沒有顏色與材質資訊，只記錄三角面。', warn: null, anim: 'stl' },
  { title: '匯入切片軟體', desc: '常用切片軟體：Cura（免費）、PrusaSlicer（免費）、Bambu Studio。把 STL 拖入軟體，選擇你的印表機型號。', tip: '確認模型擺放方向：底面要平、避免懸空。', warn: null, anim: 'slicer' },
  { title: '調整切片參數', desc: '層厚（0.2mm 標準）、填充密度（15–20% 一般、80%+ 結構件）、列印速度（50–100mm/s）、支撐（懸空角度 > 45° 才需要）。', tip: '初學者：使用內建「PLA 標準」配置即可。', warn: null, anim: 'params' },
  { title: '匯出 G-code', desc: '切片完成後匯出 .gcode 檔，存到 SD 卡或透過 Wi-Fi / USB 傳給印表機。預估時間和耗材重量會顯示在切片軟體中。', tip: '檔名要避免中文與空格，部分機型不認得。', warn: null, anim: 'gcode' },
  { title: '預熱噴頭與熱床', desc: 'PLA：噴頭 200°C / 熱床 60°C\nPETG：噴頭 240°C / 熱床 85°C\nABS：噴頭 250°C / 熱床 100°C\n預熱完成才進行校正——熱脹冷縮會改變高度。', tip: '可在切片時順便預熱，等到列印開始溫度也達標。', warn: null, anim: 'heat' },
  { title: '熱床校正', desc: '預熱完成後 → 將噴頭手動移到四角 → 用 A4 紙確認摩擦阻力 → 微調螺絲。某些機型有自動調平（auto bed leveling）。', tip: 'A4 紙能略微通過、有阻力是最佳距離（約 0.1mm）。', warn: '校正不準是「首層失敗」最大原因。', anim: 'calibrate' },
  { title: '開始列印 ＆ 觀察首層', desc: '前 3–5 層是關鍵。守在機台旁觀察：絲線有沒有黏熱床？有沒有跑位？有沒有跳針（漏層）？', tip: '首層 OK 後就可以放心離開（但仍要定期巡視）。', warn: null, anim: 'print' },
  { title: '取件 ＆ 後處理', desc: '等熱床冷卻到 < 40°C → 用鏟刀斜插底部撬起 → 移除支撐結構 → 用銼刀或砂紙修平接縫 → 必要時噴漆/上色。', tip: 'PLA 物件可以用鋁箔紙打磨表面變光亮。', warn: '熱床還燙的時候強拔會傷模型也傷熱床。', anim: 'remove' },
];

function renderAnim(type) {
  const anims = {
    stl: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 螢幕 -->
      <rect x="100" y="20" width="200" height="140" rx="8" fill="#0f172a"/>
      <rect x="106" y="26" width="188" height="128" rx="4" fill="#1e293b"/>
      <!-- 立體 3D 模型（旋轉中的 cube）-->
      <g transform="translate(200,90)">
        <polygon points="-30,-15 0,-30 30,-15 0,0" fill="#67e8f9" stroke="#0e7490">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/>
        </polygon>
        <polygon points="-30,-15 0,0 0,30 -30,15" fill="#06b6d4" stroke="#0e7490">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/>
        </polygon>
        <polygon points="30,-15 0,0 0,30 30,15" fill="#0891b2" stroke="#0e7490">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/>
        </polygon>
      </g>
      <!-- 螢幕邊框 -->
      <rect x="100" y="160" width="200" height="10" fill="#475569"/>
      <rect x="180" y="170" width="40" height="20" fill="#334155"/>
      <text x="200" y="206" text-anchor="middle" font-size="12" fill="#444" font-family="Noto Sans TC">STL ＝ 由三角面構成的 3D 模型</text>
    </svg>`,

    slicer: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 切片軟體介面 -->
      <rect x="20" y="20" width="360" height="150" rx="6" fill="#1e293b"/>
      <rect x="20" y="20" width="360" height="20" rx="6" fill="#334155"/>
      <circle cx="32" cy="30" r="3" fill="#ef4444"/>
      <circle cx="44" cy="30" r="3" fill="#fbbf24"/>
      <circle cx="56" cy="30" r="3" fill="#22c55e"/>
      <text x="80" y="34" font-size="9" fill="#cbd5e1" font-family="Inter">PrusaSlicer</text>
      <!-- 列印床網格 -->
      <rect x="40" y="50" width="220" height="110" fill="#475569"/>
      <g stroke="#64748b" stroke-width=".3" opacity=".5">
        <line x1="60" y1="50" x2="60" y2="160"/><line x1="80" y1="50" x2="80" y2="160"/><line x1="100" y1="50" x2="100" y2="160"/><line x1="120" y1="50" x2="120" y2="160"/><line x1="140" y1="50" x2="140" y2="160"/><line x1="160" y1="50" x2="160" y2="160"/><line x1="180" y1="50" x2="180" y2="160"/><line x1="200" y1="50" x2="200" y2="160"/><line x1="220" y1="50" x2="220" y2="160"/><line x1="240" y1="50" x2="240" y2="160"/>
        <line x1="40" y1="70" x2="260" y2="70"/><line x1="40" y1="90" x2="260" y2="90"/><line x1="40" y1="110" x2="260" y2="110"/><line x1="40" y1="130" x2="260" y2="130"/><line x1="40" y1="150" x2="260" y2="150"/>
      </g>
      <!-- 拖入的物件 -->
      <g transform="translate(150,105)">
        <polygon points="-25,-15 0,-25 25,-15 0,-5" fill="#67e8f9" stroke="#0891b2"/>
        <polygon points="-25,-15 0,-5 0,25 -25,15" fill="#06b6d4" stroke="#0891b2"/>
        <polygon points="25,-15 0,-5 0,25 25,15" fill="#0891b2" stroke="#0e7490"/>
      </g>
      <!-- 右側參數面板 -->
      <rect x="270" y="50" width="100" height="110" fill="#0f172a"/>
      <text x="280" y="65" font-size="8" fill="#94a3b8" font-family="Inter">層厚 0.2mm</text>
      <text x="280" y="80" font-size="8" fill="#94a3b8" font-family="Inter">填充 20%</text>
      <text x="280" y="95" font-size="8" fill="#94a3b8" font-family="Inter">速度 60mm/s</text>
      <text x="280" y="110" font-size="8" fill="#94a3b8" font-family="Inter">材料 PLA</text>
      <rect x="280" y="125" width="80" height="20" rx="3" fill="#06b6d4"/>
      <text x="320" y="139" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">切片</text>
      <text x="200" y="206" text-anchor="middle" font-size="12" fill="#444" font-family="Noto Sans TC">STL → 軟體 → 選擇印表機</text>
    </svg>`,

    params: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 三個參數對比視覺 -->
      <g>
        <rect x="20" y="40" width="100" height="120" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
        <text x="70" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#334155" font-family="Noto Sans TC">層厚 0.1mm</text>
        <!-- 細密層紋 -->
        <g stroke="#8b5cf6" stroke-width=".8">
          ${Array.from({length: 22}, (_, i) => `<line x1="35" y1="${75 + i*3.5}" x2="105" y2="${75 + i*3.5}"/>`).join('')}
        </g>
        <text x="70" y="170" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">細緻・慢</text>
      </g>
      <g>
        <rect x="150" y="40" width="100" height="120" rx="6" fill="#ecfdf5" stroke="#86efac"/>
        <text x="200" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d" font-family="Noto Sans TC">層厚 0.2mm</text>
        <g stroke="#8b5cf6" stroke-width="1.2">
          ${Array.from({length: 12}, (_, i) => `<line x1="165" y1="${75 + i*7}" x2="235" y2="${75 + i*7}"/>`).join('')}
        </g>
        <text x="200" y="170" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">★ 平衡（推薦）</text>
      </g>
      <g>
        <rect x="280" y="40" width="100" height="120" rx="6" fill="#fef3c7" stroke="#fbbf24"/>
        <text x="330" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#92400e" font-family="Noto Sans TC">層厚 0.3mm</text>
        <g stroke="#8b5cf6" stroke-width="2">
          ${Array.from({length: 8}, (_, i) => `<line x1="295" y1="${78 + i*11}" x2="365" y2="${78 + i*11}"/>`).join('')}
        </g>
        <text x="330" y="170" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">粗糙・快</text>
      </g>
      <text x="200" y="206" text-anchor="middle" font-size="12" fill="#444" font-family="Noto Sans TC">層厚 ↑ → 速度 ↑ ／ 細節 ↓</text>
    </svg>`,

    gcode: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- G-code 檔案視覺化 -->
      <rect x="40" y="20" width="180" height="170" rx="6" fill="#0a2a0a"/>
      <text x="50" y="40" font-size="9" fill="#3aff6a" font-family="monospace">; benchy.gcode</text>
      <text x="50" y="55" font-size="8" fill="#86efac" font-family="monospace">M104 S200 ; 噴頭 200°C</text>
      <text x="50" y="68" font-size="8" fill="#86efac" font-family="monospace">M140 S60  ; 熱床 60°C</text>
      <text x="50" y="81" font-size="8" fill="#86efac" font-family="monospace">G28 ; home</text>
      <text x="50" y="94" font-size="8" fill="#86efac" font-family="monospace">G1 Z0.2 F300</text>
      <text x="50" y="107" font-size="8" fill="#86efac" font-family="monospace">G1 X40 Y40 E0.5</text>
      <text x="50" y="120" font-size="8" fill="#86efac" font-family="monospace">G1 X160 Y40 E2.5</text>
      <text x="50" y="133" font-size="8" fill="#86efac" font-family="monospace">G1 X160 Y160 E4.5</text>
      <text x="50" y="146" font-size="8" fill="#86efac" font-family="monospace">G1 X40 Y160 E6.5</text>
      <text x="50" y="159" font-size="8" fill="#86efac" font-family="monospace">G1 Z0.4 ; 下一層</text>
      <text x="50" y="172" font-size="8" fill="#65a30d" font-family="monospace">; ... 8421 行</text>
      <text x="50" y="185" font-size="8" fill="#fbbf24" font-family="monospace">; 預估 2h 38m</text>
      <!-- SD 卡或 USB -->
      <g transform="translate(280,80)">
        <rect x="0" y="0" width="50" height="60" rx="3" fill="#1f2937"/>
        <rect x="5" y="0" width="40" height="8" fill="#fbbf24"/>
        <text x="25" y="32" text-anchor="middle" font-size="10" fill="#fbbf24" font-weight="700">SD</text>
        <text x="25" y="46" text-anchor="middle" font-size="8" fill="#fbbf24">8GB</text>
      </g>
      <!-- 箭頭 -->
      <path d="M 230 100 L 270 100" stroke="#06b6d4" stroke-width="2" marker-end="url(#arr-gc)"/>
      <defs><marker id="arr-gc" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#06b6d4"/></marker></defs>
      <text x="200" y="206" text-anchor="middle" font-size="12" fill="#444" font-family="Noto Sans TC">.gcode → SD 卡 → 印表機</text>
    </svg>`,

    calibrate: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 熱床側視圖 -->
      <rect x="40" y="120" width="320" height="20" fill="#7f1d1d"/>
      <rect x="40" y="118" width="320" height="4" fill="#dc2626"/>
      <!-- 噴頭 -->
      <g transform="translate(200,80)">
        <rect x="-20" y="-30" width="40" height="40" rx="3" fill="#1e293b"/>
        <rect x="-18" y="-26" width="36" height="12" fill="#dc2626"/>
        <text x="0" y="-18" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">200°C</text>
        <polygon points="-6,10 6,10 0,22" fill="#fbbf24"/>
      </g>
      <!-- A4 紙（穿過噴頭與熱床之間）-->
      <rect x="60" y="113" width="80" height="5" fill="#fefce8" stroke="#94a3b8" stroke-width=".8"/>
      <text x="100" y="106" text-anchor="middle" font-size="8" fill="#475569" font-family="Noto Sans TC">A4 紙</text>
      <!-- 標示間距 -->
      <line x1="60" y1="125" x2="60" y2="113" stroke="#16a34a" stroke-width=".5"/>
      <text x="50" y="108" font-size="8" fill="#16a34a" font-weight="700">0.1mm</text>
      <!-- 校正螺絲（四角）-->
      <g transform="translate(60,140)">
        <circle cx="0" cy="0" r="6" fill="#94a3b8"/>
        <circle cx="0" cy="0" r="3" fill="#475569"/>
        <text x="0" y="20" text-anchor="middle" font-size="7" fill="#666">調螺絲</text>
      </g>
      <g transform="translate(340,140)">
        <circle cx="0" cy="0" r="6" fill="#94a3b8"/>
        <circle cx="0" cy="0" r="3" fill="#475569"/>
      </g>
      <!-- 標準參考 -->
      <g transform="translate(60,170)">
        <text x="0" y="0" font-size="9" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">✓ A4 略微通過、有阻力</text>
      </g>
      <g transform="translate(60,184)">
        <text x="0" y="0" font-size="9" fill="#dc2626" font-family="Noto Sans TC">✗ 太緊：紙拉不動</text>
        <text x="190" y="0" font-size="9" fill="#dc2626" font-family="Noto Sans TC">✗ 太鬆：紙無阻力</text>
      </g>
      <text x="200" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#334155" font-family="Noto Sans TC">A4 紙校平法</text>
    </svg>`,

    heat: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 三種材料的溫度對照 -->
      <g transform="translate(40,40)">
        <rect x="0" y="0" width="100" height="130" rx="6" fill="#ecfdf5" stroke="#86efac"/>
        <text x="50" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#15803d">PLA</text>
        <text x="50" y="36" text-anchor="middle" font-size="9" fill="#15803d">最常用 ★</text>
        <!-- 噴頭溫度 -->
        <rect x="15" y="48" width="70" height="22" rx="3" fill="#0a2a0a"/>
        <text x="50" y="63" text-anchor="middle" font-size="11" fill="#3aff6a" font-family="monospace" font-weight="700">200°C</text>
        <text x="50" y="80" text-anchor="middle" font-size="7" fill="#666">噴頭</text>
        <!-- 熱床溫度 -->
        <rect x="15" y="86" width="70" height="22" rx="3" fill="#7f1d1d"/>
        <text x="50" y="101" text-anchor="middle" font-size="11" fill="#fde68a" font-family="monospace" font-weight="700">60°C</text>
        <text x="50" y="118" text-anchor="middle" font-size="7" fill="#666">熱床</text>
      </g>
      <g transform="translate(150,40)">
        <rect x="0" y="0" width="100" height="130" rx="6" fill="#fef3c7" stroke="#fbbf24"/>
        <text x="50" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e">PETG</text>
        <text x="50" y="36" text-anchor="middle" font-size="9" fill="#92400e">耐用</text>
        <rect x="15" y="48" width="70" height="22" rx="3" fill="#0a2a0a"/>
        <text x="50" y="63" text-anchor="middle" font-size="11" fill="#3aff6a" font-family="monospace" font-weight="700">240°C</text>
        <text x="50" y="80" text-anchor="middle" font-size="7" fill="#666">噴頭</text>
        <rect x="15" y="86" width="70" height="22" rx="3" fill="#7f1d1d"/>
        <text x="50" y="101" text-anchor="middle" font-size="11" fill="#fde68a" font-family="monospace" font-weight="700">80°C</text>
        <text x="50" y="118" text-anchor="middle" font-size="7" fill="#666">熱床</text>
      </g>
      <g transform="translate(260,40)">
        <rect x="0" y="0" width="100" height="130" rx="6" fill="#fef2f2" stroke="#fca5a5"/>
        <text x="50" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#991b1b">ABS</text>
        <text x="50" y="36" text-anchor="middle" font-size="9" fill="#991b1b">高強度</text>
        <rect x="15" y="48" width="70" height="22" rx="3" fill="#0a2a0a"/>
        <text x="50" y="63" text-anchor="middle" font-size="11" fill="#3aff6a" font-family="monospace" font-weight="700">250°C</text>
        <text x="50" y="80" text-anchor="middle" font-size="7" fill="#666">噴頭</text>
        <rect x="15" y="86" width="70" height="22" rx="3" fill="#7f1d1d"/>
        <text x="50" y="101" text-anchor="middle" font-size="11" fill="#fde68a" font-family="monospace" font-weight="700">100°C</text>
        <text x="50" y="118" text-anchor="middle" font-size="7" fill="#666">熱床</text>
      </g>
      <text x="200" y="206" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">材料不同 → 溫度不同</text>
    </svg>`,

    print: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 列印中（含動畫）-->
      <rect x="40" y="160" width="320" height="20" fill="#7f1d1d"/>
      <rect x="40" y="158" width="320" height="4" fill="#dc2626"/>
      <!-- 物件（逐漸增高）-->
      <rect x="150" y="120" width="100" height="40" fill="#a78bfa" stroke="#5b21b6">
        <animate attributeName="y" values="155;120;155" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="height" values="3;40;3" dur="6s" repeatCount="indefinite"/>
      </rect>
      <g stroke="#5b21b6" stroke-width=".4" opacity=".5">
        <line x1="150" y1="130" x2="250" y2="130"/>
        <line x1="150" y1="140" x2="250" y2="140"/>
        <line x1="150" y1="150" x2="250" y2="150"/>
      </g>
      <!-- 噴頭（移動）-->
      <g>
        <rect x="190" y="80" width="40" height="40" rx="3" fill="#1e293b">
          <animateTransform attributeName="transform" type="translate" values="0,0; -90,0; 90,0; 0,0" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="y" values="80;40;80" dur="6s" repeatCount="indefinite"/>
        </rect>
        <polygon points="200,120 220,120 210,134" fill="#fbbf24">
          <animateTransform attributeName="transform" type="translate" values="0,0; -90,0; 90,0; 0,0" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="points" values="200,120 220,120 210,134;200,80 220,80 210,94;200,120 220,120 210,134" dur="6s" repeatCount="indefinite"/>
        </polygon>
      </g>
      <!-- 進度文字 -->
      <rect x="40" y="20" width="320" height="32" rx="6" fill="#0a2a0a"/>
      <text x="60" y="40" font-size="11" fill="#3aff6a" font-family="monospace">▶ PRINTING</text>
      <text x="200" y="40" font-size="11" fill="#3aff6a" font-family="monospace">42%</text>
      <text x="290" y="40" font-size="11" fill="#3aff6a" font-family="monospace">1h 23m</text>
      <rect x="40" y="56" width="320" height="6" rx="2" fill="#1e293b"/>
      <rect x="40" y="56" width="135" height="6" rx="2" fill="#06b6d4"/>
      <text x="200" y="206" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">首層最關鍵 → 守在旁邊觀察</text>
    </svg>`,

    remove: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <!-- 熱床冷卻後 -->
      <rect x="40" y="140" width="320" height="20" fill="#475569"/>
      <text x="200" y="153" text-anchor="middle" font-size="9" fill="#cbd5e1" font-weight="700" font-family="monospace">BED 32°C ✓ COOL</text>
      <!-- 列印完成物（小船 Benchy）-->
      <g transform="translate(170,80)">
        <path d="M 0 60 L 60 60 L 50 30 L 10 30 Z" fill="#8b5cf6" stroke="#5b21b6"/>
        <rect x="15" y="10" width="30" height="20" fill="#a78bfa" stroke="#5b21b6"/>
        <rect x="20" y="0" width="20" height="10" fill="#8b5cf6" stroke="#5b21b6"/>
        <!-- 層紋 -->
        <line x1="0" y1="40" x2="60" y2="40" stroke="#5b21b6" stroke-width=".5" opacity=".5"/>
        <line x1="0" y1="50" x2="60" y2="50" stroke="#5b21b6" stroke-width=".5" opacity=".5"/>
      </g>
      <!-- 鏟刀 -->
      <g transform="translate(80,135) rotate(-15)">
        <rect x="0" y="0" width="70" height="6" fill="#9ca3af" stroke="#475569"/>
        <rect x="65" y="-3" width="30" height="12" fill="#1f2937"/>
        <text x="80" y="6" text-anchor="middle" font-size="8" fill="#fff">鏟刀</text>
      </g>
      <!-- 撬起箭頭 -->
      <path d="M 200 140 Q 180 110 200 90" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3 2" fill="none" marker-end="url(#arr-rm)"/>
      <defs><marker id="arr-rm" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#16a34a"/></marker></defs>
      <!-- 標題 -->
      <text x="200" y="30" text-anchor="middle" font-size="11" font-weight="700" fill="#334155" font-family="Noto Sans TC">等冷卻後撬起</text>
      <text x="200" y="206" text-anchor="middle" font-size="11" fill="#444" font-family="Noto Sans TC">熱床 &lt; 40°C → 鏟刀斜插底面撬</text>
    </svg>`,
  };
  return anims[type] || '';
}

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const seenSteps = new Set();
const PK = 'printer3d_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const sp = loadP();
if (sp.module3_seen) sp.module3_seen.forEach(i => seenSteps.add(i));

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item';
  if (seenSteps.has(i)) item.classList.add('done');
  item.innerHTML = `<div class="num">${i + 1}</div><div class="step-title">${s.title}</div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.step-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
  const s = STEPS[i];
  stepDetailEl.innerHTML = `
    <div class="step-num">STEP ${String(i + 1).padStart(2, '0')} / 08</div>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p style="white-space:pre-line">${s.desc}</p>
    <div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 注意：</strong>${s.warn}</div>` : ''}
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一步</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有步驟 ✓' : '下一步 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) { seenSteps.add(i); if (typeof SoundFX !== 'undefined') SoundFX.success(); }
  document.querySelectorAll('.step-item')[i].classList.add('done');
  stepProgressEl.textContent = `已學習 ${seenSteps.size} / 8 步`;
  const prog = loadP(); prog.module3_seen = Array.from(seenSteps);
  if (seenSteps.size === STEPS.length) {
    prog.module3 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 八步完成！', 'good');
  }
  saveP(prog);
  if (i < STEPS.length - 1) selectStep(i + 1);
}
selectStep(0);
window.selectStep = selectStep; window.markDone = markDone;

// ========================
// 層厚 × 填充率 互動預覽（模組 3 延伸互動）
// ========================
(function() {
  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'slice-params';
  sec.innerHTML = `
    <h3>🎛️ 切片參數互動預覽</h3>
    <p class="muted" style="margin-bottom:18px">調整「層厚」與「填充率」，即時看到截面效果與列印時間估算變化。</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px">
      <div>
        <label style="font-weight:700;font-size:13px;display:block;margin-bottom:8px">
          層厚（Layer Height）：<span id="lh-val" style="color:var(--accent,#7c3aed);font-family:Inter,monospace">0.20</span> mm
        </label>
        <input type="range" id="lh-slider" min="1" max="3" step="1" value="2"
          style="width:100%;accent-color:var(--accent,#7c3aed);cursor:pointer">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-top:4px">
          <span>0.10 精緻</span><span>0.20 標準</span><span>0.30 快速</span>
        </div>
      </div>
      <div>
        <label style="font-weight:700;font-size:13px;display:block;margin-bottom:8px">
          填充率（Infill）：<span id="inf-val" style="color:var(--accent,#7c3aed);font-family:Inter,monospace">20</span>%
        </label>
        <input type="range" id="inf-slider" min="1" max="3" step="1" value="1"
          style="width:100%;accent-color:var(--accent,#7c3aed);cursor:pointer">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-top:4px">
          <span>20% 一般</span><span>50% 結構</span><span>80% 高強</span>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
      <canvas id="slice-canvas" width="220" height="180" style="border-radius:10px;border:1px solid #e2e8f0;flex-shrink:0"></canvas>
      <div id="slice-info" style="flex:1;min-width:180px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px"></div>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const cv = document.getElementById('slice-canvas');
  const ctx = cv.getContext('2d');
  const lhSlider = document.getElementById('lh-slider');
  const infSlider = document.getElementById('inf-slider');

  const LH_MAP = { 1: { mm: '0.10', label: '精緻', factor: 1.8 }, 2: { mm: '0.20', label: '標準', factor: 1.0 }, 3: { mm: '0.30', label: '快速', factor: 0.65 } };
  const INF_MAP = { 1: { pct: '20', label: '一般（省料）', factor: 1.0, pattern: 'grid' }, 2: { pct: '50', label: '結構件', factor: 1.4, pattern: 'dense' }, 3: { pct: '80', label: '高強度', factor: 1.9, pattern: 'solid' } };

  function drawSlice() {
    const lh = LH_MAP[lhSlider.value];
    const inf = INF_MAP[infSlider.value];
    ctx.clearRect(0, 0, 220, 180);

    // Board bg
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 220, 180);

    // Draw layers (cross-section of a simple rectangular object)
    const objW = 140, objH = 120, objX = 40, objY = 50;
    const layerPx = lh.mm === '0.10' ? 8 : lh.mm === '0.20' ? 14 : 20;
    const numLayers = Math.floor(objH / layerPx);

    for (let i = 0; i < numLayers; i++) {
      const y = objY + objH - (i + 1) * layerPx;
      const h = layerPx - 1;

      // Outer shell (always)
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(objX, y, 8, h);
      ctx.fillRect(objX + objW - 8, y, 8, h);

      // Infill
      const innerX = objX + 8, innerW = objW - 16;
      if (inf.pattern === 'solid') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(innerX, y, innerW, h);
      } else if (inf.pattern === 'dense') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(innerX, y, innerW, h);
        const spacing = 8;
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 1.5;
        for (let x = innerX; x < innerX + innerW; x += spacing) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke();
        }
        if (i % 2 === 0) {
          ctx.beginPath(); ctx.moveTo(innerX, y + h / 2); ctx.lineTo(innerX + innerW, y + h / 2); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(innerX, y, innerW, h);
        if (i % 3 === 0) {
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(innerX, y + 1); ctx.lineTo(innerX + innerW, y + 1); ctx.stroke();
        } else if (i % 3 === 1) {
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1;
          for (let x = innerX; x < innerX + innerW; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke();
          }
        }
      }

      // Layer line
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(objX, y + h); ctx.lineTo(objX + objW, y + h); ctx.stroke();
    }

    // Top and bottom solid layers
    ctx.fillStyle = '#c4b5fd';
    ctx.fillRect(objX, objY, objW, layerPx - 1);
    ctx.fillRect(objX, objY + objH - layerPx, objW, layerPx - 1);

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${numLayers} 層`, 215, 20);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('截面示意圖', 110, 170);
  }

  function updateInfo() {
    const lh = LH_MAP[lhSlider.value];
    const inf = INF_MAP[infSlider.value];
    document.getElementById('lh-val').textContent = lh.mm;
    document.getElementById('inf-val').textContent = inf.pct;
    const baseMins = 45;
    const timeFactor = lh.factor * inf.factor;
    const estMins = Math.round(baseMins * timeFactor);
    const hours = Math.floor(estMins / 60);
    const mins = estMins % 60;
    const timeStr = hours > 0 ? `${hours} 小時 ${mins} 分` : `${mins} 分鐘`;
    const strength = inf.pct === '80' ? '高強度 ★★★' : inf.pct === '50' ? '中強度 ★★' : '輕量 ★';
    const quality = lh.mm === '0.10' ? '精緻 ★★★' : lh.mm === '0.20' ? '標準 ★★' : '快速 ★';
    document.getElementById('slice-info').innerHTML = `
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:13px">
        <span style="color:#64748b">層厚</span><strong>${lh.mm} mm（${lh.label}）</strong>
        <span style="color:#64748b">填充率</span><strong>${inf.pct}%（${inf.label}）</strong>
        <span style="color:#64748b">表面品質</span><strong>${quality}</strong>
        <span style="color:#64748b">結構強度</span><strong>${strength}</strong>
        <span style="color:#64748b">估算時間</span><strong style="color:var(--accent,#7c3aed)">${timeStr}</strong>
      </div>
      <div style="margin-top:12px;background:#ede9fe;border-radius:8px;padding:10px;font-size:12px;color:#5b21b6">
        💡 ${lh.mm === '0.10' ? '精細層厚表面最光滑，但耗時最長。用於展示品或需要精緻外觀的零件。' : lh.mm === '0.30' ? '快速列印省時間，層紋較明顯。適合結構測試版本或不需要精緻表面的零件。' : '0.2mm 是最常見的標準設定，平衡品質與速度。大多數情況下使用此設定。'}
      </div>`;
    drawSlice();
  }

  lhSlider.addEventListener('input', updateInfo);
  infSlider.addEventListener('input', updateInfo);
  updateInfo();
})();

// === 步驟排序拼圖 ===
if (typeof Interactions !== 'undefined') {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map(s => s.title),
    title: '把打亂的步驟排回正確順序',
    onComplete: () => {
      try {
        const k = 'printer3d_progress_v1';
        const p = JSON.parse(localStorage.getItem(k)) || {};
        p.module3_puzzle = true;
        localStorage.setItem(k, JSON.stringify(p));
      } catch (e) {}
      if (typeof showToast === 'function') showToast('🏆 排序測驗通過！', 'good');
    }
  });
}
