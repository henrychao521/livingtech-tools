// 橋樑工程師實驗室 模組 1：認識橋樑結構
const PK = 'structure_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// 年級自適應
function getGrade() { return loadP().grade || '7'; }
function gradeText(map) { const g = getGrade(); return map[g] || map['7']; }

/* ── 熱點資料（8 個） ──────────────────────────────────── */
const HOTSPOTS = {
  'top-chord': {
    name: '上弦桿（Top Chord）',
    role: 'COMPRESSION MEMBER',
    desc: '桁架橋最上方的水平桿件，承受垂直荷重後<strong>受壓</strong>——就像拱的「壓力線」在這裡。上弦桿必須夠粗壯才不會「挫屈」（橫向彎折）。',
    formula: gradeText({ '7': '', '8': 'F = -P（壓力，負號代表受壓）', '9': 'σ = F/A，臨界挫屈力 Pcr = π²EI/L²' }),
    color: '#dc2626', tag: '受壓',
    fact: '上弦桿太細或太長時，會突然側向彎折——這就是「挫屈」（Buckling），是壓桿最怕的失效模式。'
  },
  'bot-chord': {
    name: '下弦桿（Bottom Chord）',
    role: 'TENSION MEMBER',
    desc: '桁架橋最下方的水平桿件，垂直荷重讓它<strong>受拉</strong>伸長。鋼和繩索最擅長受拉，木材和混凝土則不擅長承受張力。',
    formula: gradeText({ '7': '', '8': 'F = +P（張力，正號代表受拉）', '9': 'σ = F/A ≤ σ_allow' }),
    color: '#2563eb', tag: '受拉',
    fact: '下弦桿受張力，不會挫屈。但要注意節點孔洞造成的應力集中——這是 Silver Bridge 斷裂的真正原因。'
  },
  'diagonal': {
    name: '斜桿（Diagonal）',
    role: 'DIAGONAL MEMBER',
    desc: '連接上下弦桿的傾斜桿件。受張力還是壓力，取決於桁架型態：Pratt 桁架的斜桿<strong>受拉</strong>（更輕量），Howe 桁架的斜桿<strong>受壓</strong>。',
    formula: gradeText({ '7': '', '8': '力向量分解：Fdiag = P / sin(θ)', '9': '節點法：ΣFx=0，ΣFy=0' }),
    color: '#7c3aed', tag: '張或壓',
    fact: 'Pratt 桁架讓斜桿受張力（可以用更細的桿）、豎桿受壓，1844 年以前是鐵路橋的標準設計。'
  },
  'vertical': {
    name: '豎桿（Vertical Post）',
    role: 'VERTICAL MEMBER',
    desc: '連接上下弦桿的垂直桿件。在 Pratt 桁架中<strong>受壓</strong>，負責把上弦荷重傳遞到下弦。豎桿也是「梁」與「桁架」外形上的主要差異。',
    formula: gradeText({ '7': '', '8': 'Fvert ≈ P（集中力直傳）', '9': '以節點法逐段求解' }),
    color: '#dc2626', tag: '受壓',
    fact: '桁架橋的豎桿讓橋看起來有「格柵」感。Warren 桁架沒有豎桿，只靠斜桿傳遞力，重量更輕。'
  },
  'pin-support': {
    name: '鉸支承（Pin Support）',
    role: 'PINNED BOUNDARY',
    desc: '可以旋轉但不能移動的支承，同時提供<strong>水平</strong>與<strong>垂直</strong>反力。橋的一端通常設鉸支承，固定住橋的位置。',
    formula: gradeText({ '7': '', '8': 'Rx 和 Ry 都不為零', '9': 'ΣFx=Rx=0，ΣFy=Ry-P=0' }),
    color: '#0f766e', tag: '固定端',
    fact: '橋用鉸支承的原因：讓橋可以對溫度膨脹做出「旋轉」反應，不把熱漲力硬傳到墩台，避免開裂。'
  },
  'roller-support': {
    name: '滾支承（Roller Support）',
    role: 'ROLLER BOUNDARY',
    desc: '只提供<strong>垂直</strong>反力，水平方向自由滑動。橋的另一端通常設滾支承，允許橋在溫度變化時自由伸縮。',
    formula: gradeText({ '7': '', '8': 'Rx=0，Ry = P (1-a)/L', '9': 'ΣM_pin = 0 → Ry = P·a/L' }),
    color: '#0d9488', tag: '滑動端',
    fact: '如果把橋兩端都固定（雙鉸），夏天熱漲的力可以輕易讓橋墩崩潰。台灣多橋就是一端鉸、一端滾。'
  },
  'joint': {
    name: '節點（Joint / Node）',
    role: 'CONNECTION POINT',
    desc: '多根桿件的交會點。桁架理論中，假設節點為<strong>鉸接</strong>（可旋轉），因此桿件只承受軸力（張力或壓力），不承受彎矩——這大大簡化計算。',
    formula: gradeText({ '7': '', '8': '節點法：ΣFx=0，ΣFy=0', '9': '求出各桿件軸力，再代入截面法驗算' }),
    color: '#1e293b', tag: '鉸接假設',
    fact: '節點是結構的弱點：大部分橋樑失效都從節點開始（焊縫裂、螺栓鬆、銷孔磨損）。I-35W 橋就是節點鋼板太薄。'
  },
  'load': {
    name: '集中載重（Concentrated Load）',
    role: 'APPLIED FORCE',
    desc: '在特定節點向下施加的外力，代表橋上的車輛、行人重量。集中力的位置影響各桿件的受力大小——越靠近橋中央，下弦桿拉力越大。',
    formula: gradeText({ '7': '', '8': 'P 在距左支承 a 處 → 反力 RL = P(L-a)/L', '9': '移動荷重求最不利位置：RL·x = max 時 x = L/2' }),
    color: '#dc2626', tag: '向下外力',
    fact: '台灣舊橋「超重車輛」常是斷橋主因：設計承重 20t，實際開過 60t 砂石車，安全係數瞬間不足。'
  },
};

/* ── 4 種橋型圖鑑 ────────────────────────────────────── */
const BRIDGE_TYPES = [
  {
    id: 'beam', name: '梁橋', eng: 'Beam / Girder Bridge',
    desc: '最簡單的橋：把一根樑架在兩個支墩之間。受力後樑的上側受壓、下側受拉，中性軸零應力。跨度越長，需要越高的樑才能抗彎。',
    color: '#64748b',
    svgPath: `<line x1="10" y1="40" x2="190" y2="40" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
              <rect x="5" y="44" width="18" height="20" fill="#94a3b8"/>
              <rect x="177" y="44" width="18" height="20" fill="#94a3b8"/>
              <text x="100" y="78" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="Inter">上壓下拉</text>`,
    example: '關西大橋・高速公路交流道',
    range: '跨度 5–100m',
  },
  {
    id: 'arch', name: '拱橋', eng: 'Arch Bridge',
    desc: '以「壓力拱」傳力——荷重沿拱形轉化為壓力，傳到橋台（abutment）。拱橋不需要大量鋼材，但橋台要承受巨大水平推力。',
    color: '#0284c7',
    svgPath: `<path d="M10 70 Q100 10 190 70" stroke="#0284c7" stroke-width="6" fill="none" stroke-linecap="round"/>
              <line x1="10" y1="70" x2="190" y2="70" stroke="#0284c7" stroke-width="2" stroke-dasharray="5 4" opacity=".5"/>
              <rect x="2" y="70" width="16" height="14" fill="#7dd3fc"/>
              <rect x="182" y="70" width="16" height="14" fill="#7dd3fc"/>
              <text x="100" y="82" text-anchor="middle" font-size="9" fill="#0284c7" font-family="Inter" font-weight="700">全桿受壓</text>`,
    example: '石碇橋・中橫谷關段',
    range: '跨度 20–500m',
  },
  {
    id: 'cable-stayed', name: '斜張橋', eng: 'Cable-Stayed Bridge',
    desc: '從塔頂拉斜索（cable），把橋面的重量直接傳到主塔。斜索<strong>受拉</strong>，主塔<strong>受壓</strong>。現代長跨度的首選，外型壯觀。',
    color: '#f59e0b',
    svgPath: `<line x1="100" y1="8" x2="100" y2="72" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
              <line x1="100" y1="20" x2="30" y2="65" stroke="#f59e0b" stroke-width="2"/>
              <line x1="100" y1="20" x2="60" y2="65" stroke="#f59e0b" stroke-width="2"/>
              <line x1="100" y1="20" x2="140" y2="65" stroke="#f59e0b" stroke-width="2"/>
              <line x1="100" y1="20" x2="170" y2="65" stroke="#f59e0b" stroke-width="2"/>
              <line x1="10" y1="65" x2="190" y2="65" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
              <text x="100" y="82" text-anchor="middle" font-size="9" fill="#f59e0b" font-family="Inter" font-weight="700">索拉・塔壓</text>`,
    example: '高雄斜張橋（大港橋）・楊梅交流道',
    range: '跨度 100–1000m',
  },
  {
    id: 'truss', name: '桁架橋', eng: 'Truss Bridge',
    desc: '本實驗室的主角：用三角形分割空間，讓每根桿只承受軸力（純張或純壓），沒有彎矩。材料利用率高，適合中跨度鐵路橋和公路橋。',
    color: '#0d9488',
    svgPath: `<line x1="10" y1="60" x2="190" y2="60" stroke="#0d9488" stroke-width="4"/>
              <line x1="40" y1="25" x2="160" y2="25" stroke="#0d9488" stroke-width="4"/>
              <line x1="10" y1="60" x2="40" y2="25" stroke="#0d9488" stroke-width="2.5"/>
              <line x1="40" y1="25" x2="80" y2="60" stroke="#2563eb" stroke-width="2.5"/>
              <line x1="80" y1="60" x2="120" y2="25" stroke="#2563eb" stroke-width="2.5"/>
              <line x1="120" y1="25" x2="160" y2="60" stroke="#dc2626" stroke-width="2.5"/>
              <line x1="160" y1="25" x2="190" y2="60" stroke="#0d9488" stroke-width="2.5"/>
              <line x1="80" y1="25" x2="80" y2="60" stroke="#dc2626" stroke-width="2" opacity=".7"/>
              <line x1="120" y1="25" x2="120" y2="60" stroke="#dc2626" stroke-width="2" opacity=".7"/>
              <text x="100" y="78" text-anchor="middle" font-size="9" fill="#0d9488" font-family="Inter" font-weight="700">桿件只承受軸力</text>`,
    example: '鐵路橋・十九孔橋（舊台鐵）',
    range: '跨度 30–300m',
  },
];

/* ── 狀態初始化 ────────────────────────────────────────── */
const p = loadP();
const seenHotspots = new Set(p.m1_hotspots || []);
const seenBridges  = new Set(p.m1_bridges  || []);
const TOTAL = 12; // 8 + 4

function calcProgress() {
  return seenHotspots.size + seenBridges.size;
}

function syncProgress() {
  const done = calcProgress();
  document.getElementById('progress-text').textContent = `${done} / ${TOTAL}`;
  document.getElementById('progress-bar').style.width = Math.min(100, done / TOTAL * 100) + '%';
  if (done >= TOTAL) {
    document.getElementById('unlock').classList.remove('hidden');
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    const pp = loadP(); pp.module1 = true; saveP(pp);
  }
}

/* ── 熱點互動 ──────────────────────────────────────────── */
const infoEl = document.getElementById('hotspot-info');
const checklistEl = document.getElementById('hotspot-checklist');

// 建立 checklist
Object.entries(HOTSPOTS).forEach(([id, h]) => {
  const chip = document.createElement('span');
  chip.className = 'part-chip' + (seenHotspots.has(id) ? ' seen' : '');
  chip.dataset.id = id;
  chip.textContent = h.name.split('（')[0];
  checklistEl.appendChild(chip);
});

// 更新 SVG 著色
function syncHotspotSVG() {
  document.querySelectorAll('.hotspot-group').forEach(g => {
    const seen = seenHotspots.has(g.dataset.id);
    const circle = g.querySelector('.hotspot-circle');
    if (seen) {
      circle.setAttribute('fill', '#0d9488');
    }
  });
}
syncHotspotSVG();

document.querySelectorAll('.hotspot-group').forEach(g => {
  g.addEventListener('click', () => {
    const id = g.dataset.id;
    const h = HOTSPOTS[id];
    if (!h) return;
    if (typeof SoundFX !== 'undefined') SoundFX.pop();

    // 顯示說明
    infoEl.innerHTML = `
      <h3>${h.name}</h3>
      <p class="role" style="font-size:11px;font-weight:700;letter-spacing:.1em;color:${h.color};margin-bottom:10px">${h.role}
        <span style="margin-left:8px;padding:2px 8px;background:${h.color}20;color:${h.color};border-radius:999px;font-size:10px">${h.tag}</span>
      </p>
      <p class="desc" style="font-size:14px;color:var(--text-soft);line-height:1.7">${h.desc}</p>
      ${h.formula ? `<p style="margin-top:10px;font-size:13px;font-family:Inter;color:var(--primary-dark);font-weight:600">📐 ${h.formula}</p>` : ''}
      <div class="fact-box"><strong style="color:var(--accent)">💡 重點：</strong>${h.fact}</div>
    `;

    if (!seenHotspots.has(id)) {
      seenHotspots.add(id);
      g.querySelector('.hotspot-circle').setAttribute('fill', '#0d9488');
      document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
      if (typeof SoundFX !== 'undefined') SoundFX.success();
      const pp = loadP(); pp.m1_hotspots = Array.from(seenHotspots);
      if (seenHotspots.size === 8) { pp.m1_hotspots_done = true; showToast('✅ 8 個元件全認識！繼續看橋型圖鑑', 'good'); }
      saveP(pp);
      syncProgress();
    }
  });
});

/* ── 橋型圖鑑 ──────────────────────────────────────────── */
const bridgeGrid = document.getElementById('bridge-type-grid');
const bridgeInfo = document.getElementById('bridge-type-info');

BRIDGE_TYPES.forEach(bt => {
  const card = document.createElement('div');
  card.className = 'bridge-type-card' + (seenBridges.has(bt.id) ? ' seen' : '');
  card.innerHTML = `
    <svg class="bridge-type-svg" viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg"
         style="background:#f8fafc;border-radius:8px;padding:4px">
      ${bt.svgPath}
    </svg>
    <h4>${bt.name} <small style="font-size:12px;font-weight:500;color:#888">${bt.eng}</small></h4>
    <p>${bt.desc.substring(0, 60)}…</p>
    <div style="margin-top:8px;font-size:12px;color:var(--text-muted)">📏 ${bt.range}　🏛 例：${bt.example}</div>
  `;
  card.addEventListener('click', () => {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    bridgeInfo.style.display = 'block';
    bridgeInfo.innerHTML = `
      <h3 style="color:${bt.color}">${bt.name}</h3>
      <p class="role" style="font-size:11px;font-weight:700;letter-spacing:.1em;color:${bt.color};margin-bottom:10px">${bt.eng}</p>
      <p class="desc" style="font-size:14px;color:var(--text-soft);line-height:1.7">${bt.desc}</p>
      <div style="margin-top:14px;display:flex;gap:16px;flex-wrap:wrap;font-size:13px">
        <span>📏 跨度：<strong>${bt.range}</strong></span>
        <span>🏛 台灣例：<strong>${bt.example}</strong></span>
      </div>
    `;
    if (!seenBridges.has(bt.id)) {
      seenBridges.add(bt.id);
      card.classList.add('seen');
      if (typeof SoundFX !== 'undefined') SoundFX.success();
      const pp = loadP(); pp.m1_bridges = Array.from(seenBridges);
      if (seenBridges.size === 4) { pp.m1_bridges_done = true; showToast('🎉 4 種橋型全看完！', 'good'); }
      saveP(pp);
      syncProgress();
    }
  });
  bridgeGrid.appendChild(card);
});

syncProgress();
