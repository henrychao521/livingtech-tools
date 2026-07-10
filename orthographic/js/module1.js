// 三視圖 模組 1：核心概念（含立體示範圖）
// 每個概念配一張精準的 SVG 教學圖，依 CNS 3 與工程圖學標準繪製

// 共用 isometric step block（與 hero 一致的投影座標）— 縮小版
const STEP_ISO_MINI = `<g transform="translate(0,0)" stroke="#1E1B4B" stroke-width="0.8" stroke-linejoin="round">
  <polygon points="20.8,12 10.4,18 10.4,12 20.8,6" fill="#4338CA"/>
  <polygon points="0,0 20.8,12 20.8,6 0,-6" fill="#6366F1"/>
  <polygon points="10.4,0 20.8,6 10.4,12 0,6" fill="#A5B4FC"/>
  <polygon points="10.4,0 0,6 0,0 10.4,-6" fill="#4338CA"/>
  <polygon points="0,-6 10.4,0 10.4,-6 0,-12" fill="#6366F1"/>
  <polygon points="0,-12 10.4,-6 0,0 -10.4,-6" fill="#A5B4FC"/>
</g>`;

const CONCEPTS = [
  {
    name: '第三角投影法', icon: '📐',
    desc: '投影面放在「觀察者與物體」之間——像隔著玻璃描圖，視線先穿過投影面才到物體。是中華民國國家標準（CNS）與美國 ANSI 採用的方式。',
    detail: '第三角法配置：俯視在正視「上方」、右側視在正視「右方」，台灣 CNS、美國、日本 JIS 都採用。第一角法（ISO／歐洲慣用）剛好相反：物體在觀察者與投影面之間，俯視在下、右側視在左。',
    visual: `<svg viewBox="0 0 240 90" width="100%" style="background:#F1F5F9;border-radius:6px;display:block">
      <defs><marker id="arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4F46E5"/></marker></defs>
      <!-- 觀察者 -->
      <circle cx="22" cy="45" r="8" fill="#FBBF24" stroke="#92400E" stroke-width="1"/>
      <circle cx="20" cy="44" r="2" fill="#1E1B4B"/>
      <text x="22" y="70" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700">觀察者</text>
      <!-- 投影面（中間，像玻璃）-->
      <rect x="85" y="22" width="50" height="46" fill="#fff" stroke="#94A3B8" stroke-width="1" stroke-dasharray="3 2"/>
      <rect x="97" y="34" width="26" height="22" fill="#E0E7FF" stroke="#3730A3" stroke-width="1.2"/>
      <text x="110" y="80" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700">投影面</text>
      <!-- 物體（右側，立方體 isometric mini）-->
      <g transform="translate(195,42)">${STEP_ISO_MINI}</g>
      <text x="195" y="80" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700">物體</text>
      <!-- 投影方向箭頭 -->
      <line x1="32" y1="45" x2="80" y2="45" stroke="#4F46E5" stroke-width="1.4" marker-end="url(#arr1)"/>
      <line x1="140" y1="45" x2="180" y2="45" stroke="#4F46E5" stroke-width="1.4" marker-end="url(#arr1)" stroke-dasharray="4 3"/>
      <text x="52" y="38" font-size="8" fill="#4F46E5" font-style="italic">視線</text>
      <text x="158" y="38" font-size="8" fill="#4F46E5" font-style="italic">穿過投影面</text>
    </svg>`
  },
  {
    name: '6 個基本視圖', icon: '🎲',
    desc: '一個物體可從 6 個方向投影：正視（前視）、後視、左側視、右側視、俯視、仰視。實作通常只畫 3 個就夠。',
    detail: '選擇原則：選最能表達物體特徵的 3 個視圖。圓柱通常選正視 + 俯視兩個。',
    visual: `<svg viewBox="0 0 240 130" width="100%" style="background:#F1F5F9;border-radius:6px;display:block">
      <!-- 中央立體（step） -->
      <g transform="translate(120,68)">${STEP_ISO_MINI}</g>
      <!-- 6 個方向標籤 + 視圖縮圖 -->
      <!-- 俯視（上）— 矩形 + 分隔線（階梯塊俯視 = 全寬×全深，中線顯示高低分界）-->
      <g transform="translate(120,10)">
        <rect x="-14" y="0" width="28" height="14" fill="#E0E7FF" stroke="#3730A3" stroke-width="1"/>
        <rect x="-10" y="2" width="20" height="10" fill="#A5B4FC" stroke="#3730A3" stroke-width="0.8"/>
        <line x1="0" y1="2" x2="0" y2="12" stroke="#3730A3" stroke-width="0.8"/>
        <text x="0" y="-2" text-anchor="middle" font-size="8" fill="#3730A3" font-weight="700">俯視 TOP</text>
      </g>
      <!-- 仰視（下） -->
      <g transform="translate(120,108)">
        <rect x="-14" y="0" width="28" height="14" fill="#E0E7FF" stroke="#3730A3" stroke-width="1" opacity="0.55"/>
        <text x="0" y="-1" text-anchor="middle" font-size="8" fill="#64748B">仰視 BOTTOM</text>
      </g>
      <!-- 左側視 -->
      <g transform="translate(8,55)">
        <rect x="0" y="0" width="28" height="20" fill="#E0E7FF" stroke="#3730A3" stroke-width="1"/>
        <rect x="6" y="3" width="16" height="14" fill="#A5B4FC" stroke="#3730A3" stroke-width="0.8"/>
        <text x="14" y="84" text-anchor="middle" font-size="8" fill="#3730A3" font-weight="700">左側視</text>
      </g>
      <!-- 右側視 -->
      <g transform="translate(204,55)">
        <rect x="0" y="0" width="28" height="20" fill="#E0E7FF" stroke="#3730A3" stroke-width="1"/>
        <rect x="6" y="3" width="16" height="14" fill="#A5B4FC" stroke="#3730A3" stroke-width="0.8"/>
        <text x="14" y="84" text-anchor="middle" font-size="8" fill="#3730A3" font-weight="700">右側視</text>
      </g>
      <!-- 正視（前，標籤在物體下方） -->
      <text x="120" y="124" text-anchor="middle" font-size="8" fill="#3730A3" font-weight="700">↑ 正視 FRONT（中央）</text>
      <!-- 投影方向虛線 -->
      <g stroke="#94A3B8" stroke-width="0.6" stroke-dasharray="2 2" fill="none">
        <line x1="120" y1="56" x2="120" y2="24"/>
        <line x1="108" y1="68" x2="36" y2="65"/>
        <line x1="132" y1="68" x2="204" y2="65"/>
      </g>
    </svg>`
  },
  {
    name: '投影對齊', icon: '📏',
    desc: '第三角法排列：俯視在正視「上方」、側視在正視「右方」。三視圖之間有投影對齊關係——正視寬 = 俯視寬（長對正）、正視高 = 側視高（高平齊）。',
    detail: '這個對齊是判讀的關鍵：長對正、高平齊。俯視在正視上方是 CNS 第三角投影法的標準排列，與第一角法（俯視在下）剛好相反。',
    visual: `<svg viewBox="0 0 240 148" width="100%" style="background:#F1F5F9;border-radius:6px;display:block">
      <!-- 俯視（第三角法：正視上方）— 矩形（同寬於正視 x=10..35）+ 分隔線示意高低分界 -->
      <g transform="translate(50,10)">
        <rect x="0" y="0" width="80" height="30" fill="#fff" stroke="#3730A3" stroke-width="1.2"/>
        <rect x="10" y="5" width="25" height="20" fill="#E0E7FF" stroke="#3730A3" stroke-width="1.2"/>
        <line x1="25" y1="5" x2="25" y2="25" stroke="#3730A3" stroke-width="1"/>
        <text x="40" y="-2" text-anchor="middle" font-size="9" fill="#3730A3" font-weight="700">俯視 TOP</text>
      </g>
      <!-- 正視（居中）-->
      <g transform="translate(50,50)">
        <rect x="0" y="0" width="80" height="50" fill="#fff" stroke="#3730A3" stroke-width="1.2"/>
        <polygon points="10,40 35,40 35,20 25,20 25,10 10,10" fill="#E0E7FF" stroke="#3730A3" stroke-width="1.2"/>
        <text x="40" y="63" text-anchor="middle" font-size="9" fill="#3730A3" font-weight="700">正視 FRONT</text>
      </g>
      <!-- 側視（正視右方）-->
      <g transform="translate(142,50)">
        <rect x="0" y="0" width="40" height="50" fill="#fff" stroke="#3730A3" stroke-width="1.2"/>
        <rect x="10" y="10" width="20" height="30" fill="#E0E7FF" stroke="#3730A3" stroke-width="1.2"/>
        <text x="20" y="-2" text-anchor="middle" font-size="9" fill="#3730A3" font-weight="700">側視 SIDE</text>
      </g>
      <!-- 對齊輔助線（黃色虛線）-->
      <g stroke="#FBBF24" stroke-width="1" stroke-dasharray="3 2" fill="none">
        <!-- 長對正：俯視左邊 = 正視左邊 -->
        <line x1="50" y1="40" x2="50" y2="50"/>
        <!-- 長對正：俯視右邊 = 正視右邊 -->
        <line x1="130" y1="40" x2="130" y2="50"/>
        <!-- 高平齊：正視上邊 = 側視上邊 -->
        <line x1="130" y1="50" x2="142" y2="50"/>
        <!-- 高平齊：正視下邊 = 側視下邊 -->
        <line x1="130" y1="100" x2="142" y2="100"/>
      </g>
      <!-- 規則文字 -->
      <text x="196" y="78" font-size="9" fill="#92400E" font-weight="700" font-style="italic">高平齊</text>
      <text x="82" y="47" font-size="9" fill="#92400E" font-weight="700" font-style="italic">長對正</text>
      <!-- 第三角法標示 -->
      <text x="10" y="136" font-size="8.5" fill="#4F46E5" font-style="italic" font-weight="600">▲ CNS 第三角法：俯視在上・正視居中・側視在右</text>
    </svg>`
  },
  {
    name: '線型規範', icon: '✏',
    desc: '實線（粗）＝物體可見輪廓\n虛線（細）＝物體背後不可見輪廓\n中心線（點劃線）＝對稱軸或圓心\n尺寸線（細）＝標註尺寸用',
    detail: '線粗 0.7mm 實線、0.35mm 虛線、0.35mm 中心線、0.35mm 尺寸線是 CNS 標準。',
    visual: `<svg viewBox="0 0 240 110" width="100%" style="background:#F1F5F9;border-radius:6px;display:block">
      <line x1="20" y1="18" x2="130" y2="18" stroke="#1E1B4B" stroke-width="2.4"/>
      <text x="140" y="22" font-size="10" fill="#1E1B4B" font-weight="700">粗實線　0.7mm　可見輪廓</text>
      <line x1="20" y1="42" x2="130" y2="42" stroke="#1E1B4B" stroke-width="1.2" stroke-dasharray="7 3"/>
      <text x="140" y="46" font-size="10" fill="#1E1B4B" font-weight="700">虛線　　0.35mm　不可見</text>
      <line x1="20" y1="66" x2="130" y2="66" stroke="#1E1B4B" stroke-width="1" stroke-dasharray="14 2 2 2"/>
      <text x="140" y="70" font-size="10" fill="#1E1B4B" font-weight="700">中心線　0.35mm　對稱軸</text>
      <g>
        <line x1="20" y1="90" x2="100" y2="90" stroke="#1E1B4B" stroke-width="0.7"/>
        <line x1="20" y1="87" x2="20" y2="93" stroke="#1E1B4B" stroke-width="0.7"/>
        <line x1="100" y1="87" x2="100" y2="93" stroke="#1E1B4B" stroke-width="0.7"/>
      </g>
      <text x="140" y="94" font-size="10" fill="#1E1B4B" font-weight="700">尺寸線　0.35mm　含箭頭</text>
    </svg>`
  },
  {
    name: '尺寸標註', icon: '📊',
    desc: '標註原則：\n• 長度：L 或 mm\n• 直徑：⌀\n• 半徑：R\n• 角度：°\n• 公差：±0.1\n標註位置：在視圖外、不重疊、好找。',
    detail: '同尺寸只標註一次。標到方便製造為原則——孔徑標在「該孔最明顯的視圖」上。',
    visual: `<svg viewBox="0 0 240 110" width="100%" style="background:#F1F5F9;border-radius:6px;display:block">
      <!-- 主物體：方塊含圓孔 -->
      <rect x="50" y="30" width="120" height="50" fill="#E0E7FF" stroke="#1E1B4B" stroke-width="1.6"/>
      <circle cx="110" cy="55" r="14" fill="#fff" stroke="#1E1B4B" stroke-width="1.2"/>
      <line x1="92" y1="55" x2="128" y2="55" stroke="#1E1B4B" stroke-width="0.5" stroke-dasharray="3 1 1 1"/>
      <line x1="110" y1="37" x2="110" y2="73" stroke="#1E1B4B" stroke-width="0.5" stroke-dasharray="3 1 1 1"/>
      <!-- 長度標 -->
      <line x1="50" y1="20" x2="170" y2="20" stroke="#1E1B4B" stroke-width="0.6"/>
      <line x1="50" y1="14" x2="50" y2="26" stroke="#1E1B4B" stroke-width="0.6"/>
      <line x1="170" y1="14" x2="170" y2="26" stroke="#1E1B4B" stroke-width="0.6"/>
      <polygon points="50,20 56,18 56,22" fill="#1E1B4B"/>
      <polygon points="170,20 164,18 164,22" fill="#1E1B4B"/>
      <text x="110" y="14" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700">120</text>
      <!-- 高度標 -->
      <line x1="40" y1="30" x2="40" y2="80" stroke="#1E1B4B" stroke-width="0.6"/>
      <line x1="34" y1="30" x2="46" y2="30" stroke="#1E1B4B" stroke-width="0.6"/>
      <line x1="34" y1="80" x2="46" y2="80" stroke="#1E1B4B" stroke-width="0.6"/>
      <text x="32" y="58" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700" transform="rotate(-90 32 58)">50</text>
      <!-- 直徑標 -->
      <line x1="125" y1="48" x2="210" y2="20" stroke="#1E1B4B" stroke-width="0.6"/>
      <text x="212" y="22" font-size="10" fill="#dc2626" font-weight="700">⌀28</text>
      <!-- 公差標 -->
      <text x="180" y="100" font-size="9" fill="#1E1B4B" font-weight="700">公差：±0.1</text>
    </svg>`
  },
  {
    name: '剖視圖（補充）', icon: '🔪',
    desc: '物體內部複雜時，「假想切開」展示內部結構。\n切開部分用斜線（45°）剖面線表示材料。',
    detail: '常見剖視圖：全剖、半剖、局部剖。塑膠模具、引擎內部都用剖視。',
    visual: `<svg viewBox="0 0 240 110" width="100%" style="background:#F1F5F9;border-radius:6px;display:block">
      <defs>
        <pattern id="hatch45" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#1E1B4B" stroke-width="0.5"/>
        </pattern>
      </defs>
      <!-- 左：外觀視圖（不可見孔用虛線）-->
      <g transform="translate(20,25)">
        <rect x="0" y="0" width="80" height="60" fill="#E0E7FF" stroke="#1E1B4B" stroke-width="1.4"/>
        <line x1="22" y1="0" x2="22" y2="60" stroke="#1E1B4B" stroke-width="1" stroke-dasharray="4 2"/>
        <line x1="58" y1="0" x2="58" y2="60" stroke="#1E1B4B" stroke-width="1" stroke-dasharray="4 2"/>
        <line x1="40" y1="0" x2="40" y2="60" stroke="#1E1B4B" stroke-width="0.5" stroke-dasharray="6 2 2 2"/>
        <text x="40" y="74" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700">外觀視圖（虛線難判讀）</text>
      </g>
      <!-- 箭頭 -->
      <text x="115" y="58" font-size="22" fill="#4F46E5" font-weight="900">→</text>
      <!-- 右：剖視圖 -->
      <g transform="translate(140,25)">
        <!-- 剖面（兩側填斜線）-->
        <rect x="0" y="0" width="22" height="60" fill="url(#hatch45)" stroke="#1E1B4B" stroke-width="1.4"/>
        <rect x="58" y="0" width="22" height="60" fill="url(#hatch45)" stroke="#1E1B4B" stroke-width="1.4"/>
        <!-- 中空空腔 -->
        <line x1="22" y1="0" x2="22" y2="60" stroke="#1E1B4B" stroke-width="1.4"/>
        <line x1="58" y1="0" x2="58" y2="60" stroke="#1E1B4B" stroke-width="1.4"/>
        <line x1="0" y1="0" x2="80" y2="0" stroke="#1E1B4B" stroke-width="1.4"/>
        <line x1="0" y1="60" x2="80" y2="60" stroke="#1E1B4B" stroke-width="1.4"/>
        <text x="40" y="74" text-anchor="middle" font-size="9" fill="#1E1B4B" font-weight="700">剖視圖（斜線 = 切到的材料）</text>
      </g>
    </svg>`
  },
];

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

CONCEPTS.forEach(c => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #4F46E5;${seen.has(c.name) ? 'background:#E0E7FF' : ''}`;
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:30px">${c.icon}</span><h4 style="margin:0;color:#3730A3">${c.name}</h4></div>
    ${c.visual ? `<div style="margin:8px 0 12px">${c.visual}</div>` : ''}
    <p style="font-size:13px;color:#444;margin:6px 0">${c.desc.replace(/\n/g, '<br>')}</p>
    <p style="font-size:12.5px;color:#666;background:#E0E7FF;padding:8px;border-radius:6px"><strong>💡：</strong>${c.detail}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(c.name)) {
      seen.add(c.name); card.style.background = '#E0E7FF';
      progEl.textContent = `已認識 ${seen.size} / 6 項`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 6) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 6 個概念都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 6 項`;
if (seen.size === 6) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
