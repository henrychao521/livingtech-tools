// 麵包板平台 模組 5：故障排除圖鑑
const ERRORS = [
  { id: 'no-resistor', name: 'LED 沒接電阻就上電', symptom: '通電瞬間 LED 變很亮然後永遠變暗（燒掉）', cause: '5V 直接驅動 LED 沒有電阻限流。LED 內部 PN 接面瞬間燒毀。', fix: '永遠在 LED 串聯一顆 220Ω 以上電阻。LED 已燒毀只能換新。' },
  { id: 'led-reversed', name: 'LED 反接', symptom: 'LED 沒亮但其他正常', cause: 'LED 是二極體，只允許電流從正極（長腳）流向負極（短腳）。反接電流不通。', fix: '把 LED 拔起來翻轉 180° 再插回去。長腳那邊應該接電阻側。' },
  { id: 'wrong-row', name: '元件腳插同一行', symptom: '元件腳互相短路 / 電阻或 LED 沒作用', cause: '麵包板同行（a-e 或 f-j 同 row）內部相連。例如 LED 兩腳都插 a5，等於把兩腳接在一起 = 短路。', fix: '每個元件腳要插在不同行（不同 row 數字）。例如 LED 兩腳插 a5 和 a6（同列不同行）。' },
  { id: 'rail-broken', name: '電源軌斷點未跨接', symptom: '左側電路正常，右側 LED 不亮', cause: '大型麵包板（830 點）電源軌中央有實體斷點，左半 與 右半其實是分開的金屬條。', fix: '在斷點兩側用同色跳線跨接（紅軌跨紅、黑軌跨黑）。' },
  { id: 'short-circuit', name: '正負極直接短路', symptom: '電池發燙、變形、電源燈狂閃，元件可能燒毀', cause: '一條跳線把 + 軌直接連到 − 軌（中間沒有任何負載）。電流瞬間衝到最大。', fix: '立刻拔電池！檢查所有跳線：每條紅線都應接到負載（電阻、LED 等）才轉到地。' },
  { id: 'loose-wire', name: '跳線沒插緊', symptom: '時好時壞，動到麵包板就斷電', cause: '跳線插得太淺，沒接觸到內部金屬簧片。', fix: '每條線都壓到底，插到聽到「卡」聲。線芯彎曲的話用斜口鉗剪斷重剝。' },
  { id: 'wrong-resistor', name: '電阻值太大', symptom: 'LED 很暗或完全不亮', cause: '誤用 10kΩ 取代 220Ω。電阻太大導致電流不足以點亮 LED（< 1mA）。', fix: '檢查色環：紅紅棕 = 220Ω。常見錯誤：紅黑橙 = 20kΩ。換用正確阻值。' },
  { id: 'cap-reversed', name: '電解電容反接', symptom: '電容鼓起、漏液、爆炸', cause: '電解電容（圓柱型有金屬殼）有極性。長腳是正極（+），短腳是負極（−）。反接會讓內部化學反應失控。', fix: '立刻斷電！電容已鼓起的不能再用，要換新。陶瓷電容（小盤狀）才沒有極性。' },
];

// 各錯誤對應的 SVG 視覺
// 共用：寫實麵包板紋理（含黃色板、洞洞陣列、紅黑電源軌）
function bbBase(showRails, gradientId) {
  return `
    <defs>
      <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fefce8"/>
        <stop offset="1" stop-color="#e7e2c0"/>
      </linearGradient>
    </defs>
    <rect x="10" y="40" width="180" height="80" rx="3" fill="url(#${gradientId})" stroke="#a89770" stroke-width="1.2"/>
    ${showRails ? `
      <line x1="14" y1="50" x2="186" y2="50" stroke="#dc2626" stroke-width="1.2"/>
      <line x1="14" y1="56" x2="186" y2="56" stroke="#1a1a1a" stroke-width="1"/>
      <line x1="14" y1="106" x2="186" y2="106" stroke="#dc2626" stroke-width="1.2"/>
      <line x1="14" y1="112" x2="186" y2="112" stroke="#1a1a1a" stroke-width="1"/>
      <text x="6" y="53" font-size="6" fill="#dc2626" font-weight="700">+</text>
      <text x="6" y="59" font-size="6" fill="#1a1a1a" font-weight="700">−</text>
    ` : ''}
    <g fill="#666">
      ${[50, 56, 70, 76, 82, 88, 94, 100, 106, 112].map(y =>
        [20, 35, 50, 65, 80, 95, 110, 125, 140, 155, 170, 180].map(x =>
          `<circle cx="${x}" cy="${y}" r="1.2"/>`
        ).join('')
      ).join('')}
    </g>
  `;
}

function renderErrorSVG(id) {
  const SVGs = {
    'no-resistor': `<svg viewBox="0 0 200 140" style="width:90%">
      ${bbBase(true, 'bbg-nr')}
      <!-- 直接接：5V → LED → 地（沒電阻）-->
      <line x1="50" y1="50" x2="50" y2="78" stroke="#dc2626" stroke-width="2.2"/>
      <circle cx="50" cy="50" r="2.5" fill="#dc2626"/>
      <line x1="80" y1="106" x2="80" y2="92" stroke="#1a1a1a" stroke-width="2.2"/>
      <circle cx="80" cy="106" r="2.5" fill="#1a1a1a"/>
      <!-- 燒毀的 LED（黑色、冒煙）-->
      <ellipse cx="65" cy="78" rx="15" ry="14" fill="#1a1a1a" stroke="#444"/>
      <ellipse cx="65" cy="78" rx="10" ry="8" fill="#4a4a4a"/>
      <line x1="50" y1="78" x2="50" y2="92" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="80" y1="92" x2="80" y2="78" stroke="#9ca3af" stroke-width="1.5"/>
      <!-- 焦黑裂縫 -->
      <line x1="58" y1="74" x2="72" y2="82" stroke="#fbbf24" stroke-width="1" opacity=".7"/>
      <line x1="72" y1="74" x2="58" y2="82" stroke="#fbbf24" stroke-width="1" opacity=".7"/>
      <!-- 飄煙 -->
      <circle cx="63" cy="60" r="3" fill="#9ca3af" opacity=".7"><animate attributeName="cy" values="68;40;68" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.7;0" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="68" cy="55" r="2.5" fill="#9ca3af" opacity=".6"><animate attributeName="cy" values="62;35;62" dur="2.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.6;0" dur="2.5s" repeatCount="indefinite"/></circle>
      <!-- 對照組：右側顯示應該有電阻 -->
      <g transform="translate(110,0)">
        <line x1="20" y1="50" x2="20" y2="62" stroke="#dc2626" stroke-width="2.2"/>
        <circle cx="20" cy="50" r="2.5" fill="#dc2626"/>
        <!-- 電阻 -->
        <rect x="10" y="62" width="20" height="8" rx="2" fill="#d4a574" stroke="#7c4a14"/>
        <rect x="14" y="62" width="2" height="8" fill="#dc2626"/>
        <rect x="18" y="62" width="2" height="8" fill="#dc2626"/>
        <rect x="22" y="62" width="2" height="8" fill="#92400e"/>
        <line x1="20" y1="70" x2="20" y2="82" stroke="#9ca3af" stroke-width="1.5"/>
        <!-- LED 亮起 -->
        <ellipse cx="20" cy="92" rx="14" ry="12" fill="#22c55e" opacity=".9"/>
        <ellipse cx="16" cy="88" rx="4" ry="3" fill="rgba(255,255,255,.7)"/>
        <line x1="20" y1="82" x2="20" y2="78" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="20" y1="104" x2="20" y2="106" stroke="#9ca3af" stroke-width="1.5"/>
      </g>
      <text x="65" y="32" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">✗ 無電阻 → 燒毀</text>
      <text x="130" y="32" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">✓ 串聯 220Ω</text>
    </svg>`,

    'led-reversed': `<svg viewBox="0 0 200 140" style="width:90%">
      ${bbBase(true, 'bbg-lr')}
      <!-- 紅軌跳線 -->
      <path d="M 30 50 Q 35 38 50 50" stroke="#dc2626" stroke-width="1.5" fill="none"/>
      <circle cx="30" cy="50" r="2.5" fill="#dc2626"/>
      <!-- 電阻 -->
      <rect x="55" y="62" width="32" height="9" rx="2" fill="#d4a574" stroke="#7c4a14"/>
      <rect x="61" y="62" width="2.5" height="9" fill="#dc2626"/>
      <rect x="66" y="62" width="2.5" height="9" fill="#1a1a1a"/>
      <rect x="71" y="62" width="2.5" height="9" fill="#92400e"/>
      <line x1="55" y1="66" x2="50" y2="66" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="87" y1="66" x2="95" y2="66" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="50" y1="50" x2="50" y2="62" stroke="#9ca3af" stroke-width="1.5"/>
      <!-- LED（反接：短腳在電阻側）-->
      <ellipse cx="110" cy="75" rx="13" ry="12" fill="#475569" stroke="#1f2937"/>
      <ellipse cx="106" cy="71" rx="3.5" ry="2.5" fill="rgba(255,255,255,.4)"/>
      <!-- 內部 die（暗的，因為沒通電）-->
      <rect x="106" y="73" width="8" height="4" fill="#7f1d1d" opacity=".4"/>
      <!-- 接腳 -->
      <line x1="106" y1="86" x2="106" y2="106" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="114" y1="86" x2="114" y2="106" stroke="#9ca3af" stroke-width="1.5"/>
      <!-- 接腳長度顛倒（極性錯誤）-->
      <text x="100" y="92" font-size="7" fill="#dc2626" font-weight="700">−</text>
      <text x="117" y="92" font-size="7" fill="#dc2626" font-weight="700">+</text>
      <!-- 電流箭頭：被阻擋 -->
      <line x1="95" y1="66" x2="100" y2="75" stroke="#dc2626" stroke-width="1.5"/>
      <text x="105" y="55" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⛔ 不通</text>
      <text x="100" y="32" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ LED 反接 → 不亮但不會壞</text>
    </svg>`,

    'wrong-row': `<svg viewBox="0 0 200 140" style="width:90%">
      ${bbBase(false, 'bbg-wr')}
      <!-- 凸顯同一行的金屬條（紅色虛線）-->
      <rect x="14" y="68" width="172" height="6" fill="rgba(220,38,38,.15)" stroke="#dc2626" stroke-width="1" stroke-dasharray="3 2"/>
      <text x="100" y="65" text-anchor="middle" font-size="7" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">同一行 → 金屬條相連</text>
      <!-- LED 兩腳都插在同一行 -->
      <line x1="80" y1="71" x2="80" y2="32" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="88" y1="71" x2="88" y2="32" stroke="#9ca3af" stroke-width="1.5"/>
      <ellipse cx="84" cy="22" rx="11" ry="10" fill="#ef4444" stroke="#7f1d1d" stroke-width="1"/>
      <ellipse cx="81" cy="19" rx="3" ry="2" fill="rgba(255,255,255,.5)"/>
      <!-- 短路電流符號 -->
      <g>
        <polygon points="79,65 87,65 83,55 91,55 79,42 81,52 73,52" fill="#fbbf24" stroke="#dc2626" stroke-width=".5">
          <animate attributeName="opacity" values=".5;1;.5" dur=".4s" repeatCount="indefinite"/>
        </polygon>
      </g>
      <!-- 對照組：正確接法 -->
      <g transform="translate(105,0)">
        <line x1="20" y1="71" x2="20" y2="32" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="35" y1="83" x2="35" y2="32" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="20" y1="71" x2="35" y2="71" stroke="#16a34a" stroke-width="1" stroke-dasharray="2 1" opacity=".4"/>
        <ellipse cx="27" cy="22" rx="11" ry="10" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
        <ellipse cx="24" cy="19" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
        <text x="27" y="125" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">✓ 不同行</text>
      </g>
      <text x="55" y="125" text-anchor="middle" font-size="8" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">✗ 同行 = 短路</text>
    </svg>`,

    'rail-broken': `<svg viewBox="0 0 200 140" style="width:90%">
      ${bbBase(false, 'bbg-rb')}
      <!-- 上電源軌（中間有實體斷點）-->
      <line x1="14" y1="50" x2="94" y2="50" stroke="#dc2626" stroke-width="2"/>
      <line x1="106" y1="50" x2="186" y2="50" stroke="#dc2626" stroke-width="2"/>
      <rect x="92" y="44" width="16" height="12" fill="#fefce8" stroke="#a89770" stroke-width=".5"/>
      <text x="100" y="55" text-anchor="middle" font-size="6" fill="#92400e">斷點</text>
      <!-- 左半 LED 亮 -->
      <line x1="35" y1="50" x2="35" y2="68" stroke="#dc2626" stroke-width="1.5"/>
      <ellipse cx="35" cy="80" rx="11" ry="10" fill="#22c55e" stroke="#15803d"/>
      <ellipse cx="32" cy="77" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
      <text x="35" y="105" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">✓ 亮</text>
      <!-- 右半 LED 不亮 -->
      <line x1="165" y1="50" x2="165" y2="68" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2 1" opacity=".3"/>
      <ellipse cx="165" cy="80" rx="11" ry="10" fill="#9ca3af" stroke="#475569"/>
      <text x="165" y="105" text-anchor="middle" font-size="8" fill="#888" font-weight="700" font-family="Noto Sans TC">✗ 不亮</text>
      <!-- 標示電源 -->
      <text x="35" y="40" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700">+5V</text>
      <text x="100" y="35" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 軌中央有斷點</text>
      <!-- 修正方案：用紅線跨接 -->
      <path d="M 92 30 Q 100 22 108 30" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3 2" fill="none"/>
      <text x="100" y="22" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="700">解：跨接</text>
    </svg>`,

    'short-circuit': `<svg viewBox="0 0 200 140" style="width:90%">
      ${bbBase(true, 'bbg-sc')}
      <!-- 直接從紅軌接到黑軌（無負載）-->
      <line x1="100" y1="50" x2="100" y2="106" stroke="#dc2626" stroke-width="3"/>
      <circle cx="100" cy="50" r="3.5" fill="#dc2626"/>
      <circle cx="100" cy="106" r="3.5" fill="#1a1a1a"/>
      <!-- 火花動畫 -->
      <g>
        <circle cx="100" cy="80" r="8" fill="#fbbf24" opacity=".8">
          <animate attributeName="r" values="6;14;6" dur=".3s" repeatCount="indefinite"/>
        </circle>
        <polygon points="92,75 108,75 100,65 104,75 96,75 100,85" fill="#fff" opacity=".9">
          <animateTransform attributeName="transform" type="rotate" from="0 100 80" to="360 100 80" dur="1s" repeatCount="indefinite"/>
        </polygon>
      </g>
      <!-- 電池冒煙 -->
      <g transform="translate(160,90)">
        <rect x="0" y="0" width="20" height="14" rx="2" fill="#1f2937"/>
        <rect x="2" y="2" width="8" height="10" fill="#dc2626"/>
        <rect x="11" y="2" width="7" height="10" fill="#1a1a1a"/>
        <!-- 冒煙 -->
        <circle cx="10" cy="-4" r="3" fill="#9ca3af" opacity=".6"><animate attributeName="cy" values="-2;-18;-2" dur="1.5s" repeatCount="indefinite"/></circle>
        <text x="10" y="-12" text-anchor="middle" font-size="11">🔥</text>
      </g>
      <text x="100" y="32" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ +/− 直接短路 → 電池過熱</text>
    </svg>`,

    'loose-wire': `<svg viewBox="0 0 200 140" style="width:90%">
      ${bbBase(false, 'bbg-lw')}
      <!-- 第一個跳線：插得太淺 -->
      <line x1="50" y1="20" x2="50" y2="70" stroke="#dc2626" stroke-width="2.2"/>
      <!-- 金屬針沒到底 -->
      <rect x="48" y="60" width="4" height="14" fill="#9ca3af"/>
      <!-- 紅圈警示 -->
      <circle cx="50" cy="76" r="10" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2">
        <animate attributeName="r" values="9;13;9" dur="1s" repeatCount="indefinite"/>
      </circle>
      <text x="50" y="100" text-anchor="middle" font-size="8" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">✗ 沒到底</text>
      <text x="50" y="110" text-anchor="middle" font-size="7" fill="#dc2626">不接觸金屬條</text>
      <!-- 第二個跳線：插到底（正確）-->
      <line x1="150" y1="20" x2="150" y2="76" stroke="#16a34a" stroke-width="2.2"/>
      <rect x="148" y="62" width="4" height="20" fill="#9ca3af"/>
      <text x="150" y="100" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">✓ 壓到底</text>
      <text x="150" y="110" text-anchor="middle" font-size="7" fill="#16a34a">聽到「卡」聲</text>
      <text x="100" y="32" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 跳線插不夠深</text>
    </svg>`,

    'wrong-resistor': `<svg viewBox="0 0 200 140" style="width:90%">
      <!-- 左：錯誤的電阻 20kΩ -->
      <g transform="translate(20,55)">
        <!-- 接腳 -->
        <line x1="-10" y1="10" x2="0" y2="10" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="60" y1="10" x2="70" y2="10" stroke="#9ca3af" stroke-width="1.5"/>
        <!-- 電阻本體（陶瓷米色）-->
        <ellipse cx="30" cy="10" rx="32" ry="6" fill="#e7c89a" stroke="#7c4a14"/>
        <rect x="0" y="6" width="60" height="8" fill="#e7c89a"/>
        <rect x="0" y="6" width="60" height="8" fill="none" stroke="#7c4a14" stroke-width=".5"/>
        <!-- 色環：紅黑橙 = 20kΩ -->
        <rect x="14" y="6" width="3.5" height="8" fill="#dc2626"/>
        <rect x="20" y="6" width="3.5" height="8" fill="#1a1a1a"/>
        <rect x="26" y="6" width="3.5" height="8" fill="#f97316"/>
        <rect x="42" y="6" width="3.5" height="8" fill="#fbbf24"/>
        <text x="30" y="34" text-anchor="middle" font-size="9" fill="#1a1a1a" font-family="monospace" font-weight="700">紅 黑 橙</text>
        <text x="30" y="46" text-anchor="middle" font-size="14" fill="#dc2626" font-weight="700">20 kΩ</text>
        <text x="30" y="58" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">✗ 太大 LED 很暗</text>
      </g>

      <!-- VS 分隔 -->
      <text x="100" y="80" text-anchor="middle" font-size="14" fill="#888" font-weight="700">VS</text>

      <!-- 右：正確的電阻 220Ω -->
      <g transform="translate(110,55)">
        <line x1="-10" y1="10" x2="0" y2="10" stroke="#9ca3af" stroke-width="1.5"/>
        <line x1="60" y1="10" x2="70" y2="10" stroke="#9ca3af" stroke-width="1.5"/>
        <ellipse cx="30" cy="10" rx="32" ry="6" fill="#e7c89a" stroke="#7c4a14"/>
        <rect x="0" y="6" width="60" height="8" fill="#e7c89a"/>
        <rect x="0" y="6" width="60" height="8" fill="none" stroke="#7c4a14" stroke-width=".5"/>
        <!-- 色環：紅紅棕 = 220Ω -->
        <rect x="14" y="6" width="3.5" height="8" fill="#dc2626"/>
        <rect x="20" y="6" width="3.5" height="8" fill="#dc2626"/>
        <rect x="26" y="6" width="3.5" height="8" fill="#92400e"/>
        <rect x="42" y="6" width="3.5" height="8" fill="#fbbf24"/>
        <text x="30" y="34" text-anchor="middle" font-size="9" fill="#1a1a1a" font-family="monospace" font-weight="700">紅 紅 棕</text>
        <text x="30" y="46" text-anchor="middle" font-size="14" fill="#16a34a" font-weight="700">220 Ω</text>
        <text x="30" y="58" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="700" font-family="Noto Sans TC">✓ 正常</text>
      </g>
      <text x="100" y="20" text-anchor="middle" font-size="10" fill="#1a1a1a" font-weight="700" font-family="Noto Sans TC">色環 → 阻值</text>
    </svg>`,

    'cap-reversed': `<svg viewBox="0 0 200 140" style="width:90%">
      <defs>
        <linearGradient id="capG" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#1e3a8a"/><stop offset=".5" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/>
        </linearGradient>
      </defs>
      <!-- 電解電容（圓柱形、有金屬殼）-->
      <ellipse cx="100" cy="46" rx="22" ry="6" fill="#1e40af"/>
      <rect x="78" y="46" width="44" height="56" fill="url(#capG)"/>
      <ellipse cx="100" cy="102" rx="22" ry="6" fill="#1e3a8a"/>
      <!-- 鼓起的頂部（動畫）-->
      <ellipse cx="100" cy="42" rx="14" ry="5" fill="#60a5fa">
        <animate attributeName="rx" values="14;20;14" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="42;36;42" dur="1s" repeatCount="indefinite"/>
      </ellipse>
      <!-- 標示 -->
      <text x="100" y="80" text-anchor="middle" font-size="14" fill="#fff" font-weight="700" font-family="Inter">−</text>
      <text x="93" y="65" font-size="6" fill="#fff" font-weight="700">100μF</text>
      <text x="93" y="72" font-size="6" fill="#fff" font-weight="700">16V</text>
      <!-- 漏液 -->
      <path d="M 80 85 Q 75 95 78 105 L 82 105 Q 79 95 83 85 Z" fill="#a78bfa" opacity=".7">
        <animate attributeName="opacity" values=".4;.9;.4" dur="2s" repeatCount="indefinite"/>
      </path>
      <!-- 冒煙 -->
      <circle cx="92" cy="30" r="3.5" fill="#9ca3af" opacity=".6"><animate attributeName="cy" values="36;10;36" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.7;0" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="108" cy="28" r="3" fill="#9ca3af" opacity=".5"><animate attributeName="cy" values="34;5;34" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.6;0" dur="2.4s" repeatCount="indefinite"/></circle>
      <!-- 接腳 -->
      <line x1="92" y1="108" x2="92" y2="125" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="108" y1="108" x2="108" y2="125" stroke="#9ca3af" stroke-width="1.5"/>
      <text x="100" y="20" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 反接 → 鼓起 → 爆炸</text>
    </svg>`,
  };
  return SVGs[id] || `<span style="font-size:60px">⚠️</span>`;
}

const grid = document.getElementById('error-gallery');
ERRORS.forEach(e => {
  const card = document.createElement('div');
  card.className = 'bb-error-card';
  card.innerHTML = `
    <div class="visual" style="height:160px;background:linear-gradient(180deg,#fff9e6,#f5f0d0);">${renderErrorSVG(e.id)}</div>
    <span class="err-tag" style="display:inline-block;font-size:11px;background:var(--danger-light);color:var(--danger);padding:3px 10px;border-radius:999px;font-weight:700;margin-bottom:8px">常見錯誤</span>
    <h4 style="font-size:16px;margin-bottom:6px">${e.name}</h4>
    <p style="font-size:13px;color:var(--text-soft);line-height:1.65;margin-bottom:8px"><strong>症狀：</strong>${e.symptom}</p>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;line-height:1.6"><strong style="color:#a72d2d">原因：</strong>${e.cause}</p>
    <div class="err-fix" style="font-size:12px;color:var(--accent);background:var(--accent-light);padding:8px 10px;border-radius:8px;border-left:3px solid var(--accent);line-height:1.6">
      <strong style="color:#1f4798">解法：</strong>${e.fix}
    </div>
  `;
  grid.appendChild(card);
});

// 標記模組 5 完成
const PROGRESS_KEY_BB = 'breadboard_progress_v1';
let p; try { p = JSON.parse(localStorage.getItem(PROGRESS_KEY_BB)) || {}; } catch { p = {}; }
p.module5 = true;
localStorage.setItem(PROGRESS_KEY_BB, JSON.stringify(p));
