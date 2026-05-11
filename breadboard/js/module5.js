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
function renderErrorSVG(id) {
  const SVGs = {
    'no-resistor': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="10" y="80" width="180" height="40" fill="#fef9c3" stroke="#a89770" rx="3"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke="#dc2626" stroke-width="1.5"/>
      <line x1="40" y1="100" x2="40" y2="65" stroke="#dc2626" stroke-width="2"/>
      <line x1="120" y1="100" x2="120" y2="65" stroke="#dc2626" stroke-width="2"/>
      <circle cx="120" cy="50" r="14" fill="#7f1d1d" stroke="#1a1a1a"/>
      <text x="120" y="55" text-anchor="middle" font-size="14" fill="#1a1a1a">💀</text>
      <text x="40" y="40" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700">+5V</text>
      <line x1="55" y1="55" x2="68" y2="42" stroke="#fbbf24" stroke-width="2"><animate attributeName="opacity" values="0;1;0" dur="0.4s" repeatCount="indefinite"/></line>
      <line x1="60" y1="42" x2="73" y2="55" stroke="#fbbf24" stroke-width="2"><animate attributeName="opacity" values="0;1;0" dur="0.4s" repeatCount="indefinite"/></line>
      <text x="100" y="20" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ LED 燒毀</text>
    </svg>`,

    'led-reversed': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="10" y="80" width="180" height="40" fill="#fef9c3" stroke="#a89770" rx="3"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke="#dc2626" stroke-width="1.5"/>
      <rect x="40" y="92" width="44" height="14" rx="3" fill="#fef3c7" stroke="#92400e"/>
      <rect x="48" y="92" width="3" height="14" fill="#dc2626"/>
      <rect x="55" y="92" width="3" height="14" fill="#1a1a1a"/>
      <rect x="62" y="92" width="3" height="14" fill="#92400e"/>
      <line x1="100" y1="100" x2="100" y2="65" stroke="#9ca3af" stroke-width="2"/>
      <line x1="108" y1="100" x2="108" y2="65" stroke="#9ca3af" stroke-width="2"/>
      <circle cx="104" cy="50" r="14" fill="#475569" stroke="#1f2937"/>
      <text x="98" y="62" font-size="10" fill="#1a1a1a" font-weight="700">−</text>
      <text x="106" y="62" font-size="10" fill="#1a1a1a" font-weight="700">+</text>
      <text x="100" y="20" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 極性接反 → 不亮</text>
    </svg>`,

    'wrong-row': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="10" y="20" width="180" height="100" fill="#fef9c3" stroke="#a89770" rx="3"/>
      <g fill="#666">
        <circle cx="40" cy="50" r="2"/><circle cx="60" cy="50" r="2"/><circle cx="80" cy="50" r="2"/><circle cx="100" cy="50" r="2"/><circle cx="120" cy="50" r="2"/>
        <circle cx="40" cy="70" r="2"/><circle cx="60" cy="70" r="2"/><circle cx="80" cy="70" r="2"/><circle cx="100" cy="70" r="2"/><circle cx="120" cy="70" r="2"/>
        <circle cx="40" cy="90" r="2"/><circle cx="60" cy="90" r="2"/><circle cx="80" cy="90" r="2"/><circle cx="100" cy="90" r="2"/><circle cx="120" cy="90" r="2"/>
      </g>
      <!-- 同一行內部金屬條（虛線示意）-->
      <line x1="35" y1="70" x2="125" y2="70" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 2" opacity=".6"/>
      <!-- 錯誤：LED 兩腳都在同一行 -->
      <line x1="70" y1="50" x2="70" y2="40" stroke="#9ca3af" stroke-width="2"/>
      <line x1="78" y1="50" x2="78" y2="40" stroke="#9ca3af" stroke-width="2"/>
      <circle cx="74" cy="30" r="8" fill="#ef4444" stroke="#7f1d1d"/>
      <!-- 短路標記 -->
      <text x="74" y="80" text-anchor="middle" font-size="20">⚡</text>
      <text x="74" y="105" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">同行＝短路</text>
    </svg>`,

    'rail-broken': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="10" y="40" width="180" height="60" fill="#fef9c3" stroke="#a89770" rx="3"/>
      <line x1="20" y1="60" x2="90" y2="60" stroke="#dc2626" stroke-width="2"/>
      <line x1="110" y1="60" x2="180" y2="60" stroke="#dc2626" stroke-width="2"/>
      <line x1="90" y1="55" x2="110" y2="55" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2" opacity=".3"/>
      <rect x="92" y="48" width="16" height="20" fill="#fef9c3"/>
      <text x="100" y="78" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">斷點</text>
      <path d="M 92 55 L 108 55" stroke="#1a1a1a" stroke-width="1" stroke-dasharray="2 1"/>
      <text x="22" y="50" font-size="11" fill="#dc2626" font-weight="700">+</text>
      <text x="183" y="50" font-size="11" fill="#16a34a">✓ 有電</text>
      <text x="22" y="120" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">左半亮</text>
      <text x="160" y="120" font-size="10" fill="#888" font-family="Noto Sans TC">右半 ❌</text>
    </svg>`,

    'short-circuit': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="10" y="40" width="180" height="80" fill="#fef9c3" stroke="#a89770" rx="3"/>
      <line x1="20" y1="60" x2="180" y2="60" stroke="#dc2626" stroke-width="2"/>
      <line x1="20" y1="100" x2="180" y2="100" stroke="#1a1a1a" stroke-width="2"/>
      <!-- 直接從紅軌接到黑軌 -->
      <line x1="100" y1="60" x2="100" y2="100" stroke="#dc2626" stroke-width="3"/>
      <circle cx="100" cy="60" r="3" fill="#dc2626"/>
      <circle cx="100" cy="100" r="3" fill="#1a1a1a"/>
      <!-- 火花 -->
      <g>
        <circle cx="100" cy="80" r="5" fill="#fbbf24"><animate attributeName="r" values="5;12;5" dur="0.3s" repeatCount="indefinite"/></circle>
        <text x="100" y="85" text-anchor="middle" font-size="18">⚡</text>
      </g>
      <text x="100" y="20" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 短路 → 電池過熱</text>
    </svg>`,

    'loose-wire': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="10" y="50" width="180" height="60" fill="#fef9c3" stroke="#a89770" rx="3"/>
      <g fill="#666"><circle cx="100" cy="80" r="3"/></g>
      <!-- 跳線插得太淺 -->
      <line x1="100" y1="40" x2="100" y2="76" stroke="#dc2626" stroke-width="2.5"/>
      <line x1="100" y1="76" x2="100" y2="82" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="2 1"/>
      <!-- 紅圈標出沒接觸 -->
      <circle cx="100" cy="80" r="10" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2"><animate attributeName="r" values="10;14;10" dur="1s" repeatCount="indefinite"/></circle>
      <text x="125" y="84" font-size="10" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">未接觸</text>
      <text x="100" y="125" text-anchor="middle" font-size="10" fill="#666" font-family="Noto Sans TC">跳線插得不夠深</text>
    </svg>`,

    'wrong-resistor': `<svg viewBox="0 0 200 140" style="width:90%">
      <rect x="20" y="55" width="64" height="20" rx="3" fill="#fef3c7" stroke="#92400e"/>
      <rect x="32" y="55" width="3" height="20" fill="#dc2626"/>
      <rect x="40" y="55" width="3" height="20" fill="#1a1a1a"/>
      <rect x="48" y="55" width="3" height="20" fill="#f97316"/>
      <text x="52" y="90" text-anchor="middle" font-size="9" fill="#1a1a1a" font-family="monospace">紅黑橙</text>
      <text x="52" y="102" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700">20kΩ ✗</text>

      <rect x="116" y="55" width="64" height="20" rx="3" fill="#fef3c7" stroke="#92400e"/>
      <rect x="128" y="55" width="3" height="20" fill="#dc2626"/>
      <rect x="136" y="55" width="3" height="20" fill="#dc2626"/>
      <rect x="144" y="55" width="3" height="20" fill="#92400e"/>
      <text x="148" y="90" text-anchor="middle" font-size="9" fill="#1a1a1a" font-family="monospace">紅紅棕</text>
      <text x="148" y="102" text-anchor="middle" font-size="11" fill="#16a34a" font-weight="700">220Ω ✓</text>

      <text x="100" y="125" text-anchor="middle" font-size="10" fill="#666" font-family="Noto Sans TC">看色環確認阻值</text>
    </svg>`,

    'cap-reversed': `<svg viewBox="0 0 200 140" style="width:90%">
      <ellipse cx="100" cy="80" rx="22" ry="36" fill="#1e3a8a"/>
      <ellipse cx="100" cy="50" rx="22" ry="8" fill="#1e40af"/>
      <text x="100" y="55" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">−</text>
      <!-- 鼓起 -->
      <ellipse cx="100" cy="35" rx="14" ry="6" fill="#3b82f6">
        <animate attributeName="rx" values="14;18;14" dur="1s" repeatCount="indefinite"/>
      </ellipse>
      <!-- 噴煙 -->
      <circle cx="92" cy="20" r="4" fill="#9ca3af" opacity=".6"><animate attributeName="cy" values="30;5;30" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="108" cy="20" r="3" fill="#9ca3af" opacity=".5"><animate attributeName="cy" values="30;10;30" dur="2.3s" repeatCount="indefinite"/></circle>
      <!-- 接腳 -->
      <line x1="93" y1="115" x2="93" y2="130" stroke="#9ca3af" stroke-width="1.5"/>
      <line x1="107" y1="115" x2="107" y2="130" stroke="#9ca3af" stroke-width="1.5"/>
      <text x="100" y="20" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700" font-family="Noto Sans TC">⚠ 鼓起爆炸</text>
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
