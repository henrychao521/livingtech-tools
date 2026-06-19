// 焊接平台 模組 1：認識電烙鐵與焊接耗材
const PARTS = {
  tip: {
    name: '烙鐵頭（Tip）',
    role: 'CORE HEATING POINT',
    desc: '直接接觸接點與焊錫的核心，溫度約 300–400°C。常見形狀：尖頭（細部焊接）、扁頭（一般用途）、刀型（大面積散熱）。新手練習多用扁頭或鉛筆型尖頭。',
    fact: '烙鐵頭表面要保持「上錫」（tinning）才能有效傳熱；發黑就是氧化，要用海綿擦或清潔粉處理。'
  },
  heating: {
    name: '加熱元件（Heating Element）',
    role: 'INTERNAL HEATER',
    desc: '位於烙鐵頭內部的陶瓷電阻發熱體，把電能轉為熱能。功率常見 30W、40W、60W。功率越大加熱越快，但學生用建議 30–40W 就夠。',
    fact: '從冷態加熱到 350°C 約需 30–60 秒，這也是為什麼上課要先開電源讓它預熱。'
  },
  handle: {
    name: '隔熱握柄（Handle）',
    role: 'INSULATED GRIP',
    desc: '由耐高溫塑膠或軟木製成的握把，避免操作者燙傷。手持時應像握筆一樣握在握柄前段（不接觸金屬段為原則）以提高精度。',
    fact: '握柄如果發燙、變形、裂痕，就是危險警訊，要立即停用並通報老師。'
  },
  display: {
    name: '溫控與顯示器（Temp Display）',
    role: 'TEMPERATURE CONTROL',
    desc: '可調溫烙鐵會顯示當前溫度與設定溫度。常用設定：含鉛錫 320°C、無鉛錫 360–400°C、SMD 焊接 280–320°C。',
    fact: '指示燈閃爍代表加熱中，恆亮代表已達設定溫度可以開始焊接。'
  },
  cord: {
    name: '電源線（Power Cord）',
    role: 'POWER LINE',
    desc: '矽膠或耐熱橡膠材質，避免被自身高溫熔毀。要確保電線不會纏繞、不會被烙鐵頭碰到。',
    fact: '電源線若有破皮、銅絲外露、發燙等狀況，必須立即停用更換。'
  },
  stand: {
    name: '烙鐵架（Stand）',
    role: 'IRON HOLDER',
    desc: '金屬底座 + 螺旋彈簧，讓加熱中的烙鐵有安全停放處。烙鐵離手必須立刻放架上，**絕對不可以**直接放桌面或紙上。',
    fact: '直接放桌面是焊接最常見的火災與燙傷成因之一（依 Illinois DRS、MIT EHS 等安全教材）。'
  },
  sponge: {
    name: '清潔海綿（Cleaning Sponge）',
    role: 'TIP CLEANER',
    desc: '使用前要先用水沾濕並擰乾。焊接過程中烙鐵頭容易黏上焊渣，每幾次焊接要在海綿上擦一下。',
    fact: '進階款用「黃銅球」清潔器，比海綿溫和不會驟冷烙鐵頭。'
  },
  'solder-wire': {
    name: '焊錫絲（Solder Wire）',
    role: 'FILLER METAL',
    desc: '中空管狀，內含助焊劑（flux）。常見規格：直徑 0.6mm（精細）、0.8mm（一般）、1.0mm（粗）。國中課堂建議用 0.8mm 含鉛錫（Sn63Pb37）。',
    fact: '無鉛錫熔點較高（217°C 以上），需更高溫操作；含鉛錫熔點 183°C，較好上手但有環保疑慮。'
  },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;

const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PROGRESS_KEY_S = 'solder_progress_v1';
function loadSolderProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_S)) || { module1_seen: [] }; }
  catch { return { module1_seen: [] }; }
}
function saveSolderProgress(p) {
  localStorage.setItem(PROGRESS_KEY_S, JSON.stringify(p));
}

const savedProg = loadSolderProgress();
if (savedProg.module1_seen) savedProg.module1_seen.forEach(id => seenSet.add(id));

Object.entries(PARTS).forEach(([id, p], i) => {
  const chip = document.createElement('span');
  chip.className = 'part-chip';
  if (seenSet.has(id)) chip.classList.add('seen');
  chip.dataset.id = id;
  chip.textContent = `${i + 1}. ${p.name.split('（')[0]}`;
  checklistEl.appendChild(chip);
});

function syncSeenUI() {
  document.querySelectorAll('.hotspot-group').forEach(g => {
    const seen = seenSet.has(g.dataset.id);
    g.querySelector('.hotspot').classList.toggle('seen', seen);
  });
  progressEl.textContent = `已認識 ${seenSet.size} / ${totalParts} 個項目`;
  if (seenSet.size === totalParts) {
    nextBtn.style.opacity = 1;
    nextBtn.style.pointerEvents = 'auto';
  }
}
syncSeenUI();

function render(id) {
  const p = PARTS[id];
  if (!p) return;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  infoEl.innerHTML = `
    <h3>${p.name}</h3>
    <p class="role">${p.role}</p>
    <p class="desc">${p.desc}</p>
    <div style="margin-top:18px;padding:14px;background:var(--accent-light);border-radius:10px;border-left:4px solid var(--accent);font-size:13px;color:var(--text-soft)">
      <strong style="color:var(--accent)">💡 冷知識：</strong>${p.fact}
    </div>
  `;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncSeenUI();
    const prog = loadSolderProgress();
    prog.module1_seen = Array.from(seenSet);
    if (seenSet.size === totalParts) {
      prog.module1 = true;
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 所有部件都認識完畢！可以前往下一關', 'good');
    }
    saveSolderProgress(prog);
  }
  document.querySelectorAll('.hotspot-group').forEach(g => {
    g.querySelector('.hotspot').classList.toggle('active', g.dataset.id === id);
  });
}

document.querySelectorAll('.hotspot-group').forEach(g => {
  g.addEventListener('click', () => render(g.dataset.id));
});
document.querySelectorAll('.part-chip').forEach(c => {
  c.addEventListener('click', () => render(c.dataset.id));
});

// ========================
// 焊點品質放大鏡（模組 1 延伸互動）
// ========================
(function() {
  const JOINTS = [
    {
      id: 'good', name: '好焊點（理想）', badge: '✓', color: '#16a34a',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Soldering-PCB-good.jpg/280px-Soldering-PCB-good.jpg', caption: 'PCB 上的標準好焊點：表面光亮、錐形飽滿', page: 'https://commons.wikimedia.org/wiki/File:Soldering-PCB-good.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="55" y="94" width="190" height="12" fill="#16a34a"/>
        <ellipse cx="150" cy="92" rx="44" ry="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse cx="150" cy="85" rx="32" ry="9" fill="#e5e7eb" stroke="#6b7280" stroke-width="1"/>
        <ellipse cx="150" cy="83" rx="22" ry="6" fill="#d0d0d0"/>
        <ellipse cx="140" cy="79" rx="8" ry="5" fill="rgba(255,255,255,.75)"/>
        <ellipse cx="150" cy="93" rx="30" ry="7" fill="rgba(192,192,192,.3)"/>
        <text x="150" y="122" text-anchor="middle" font-size="11" fill="#16a34a" font-weight="700">錐形 · 表面光亮 · 接觸角 ≤ 45°</text>`,
      desc: '焊點呈「火山錐」形，表面光亮（低氧化），焊錫均勻包覆元件腳底部，接觸角 ≤ 45°。機械強度高、電氣可靠。這是每個焊點的目標。'
    },
    {
      id: 'cold', name: '冷焊（虛焊）', badge: '△', color: '#d97706',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Cold_solder_joint.jpg/280px-Cold_solder_joint.jpg', caption: '冷焊實物照：表面顆粒粗糙、無金屬光澤', page: 'https://commons.wikimedia.org/wiki/File:Cold_solder_joint.jpg', license: 'CC BY-SA 3.0 · Coronium / Wikimedia Commons' },
      svg: `<rect x="55" y="94" width="190" height="12" fill="#16a34a"/>
        <ellipse cx="150" cy="92" rx="38" ry="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse cx="150" cy="84" rx="28" ry="8" fill="#888" stroke="#666" stroke-width="1"/>
        <ellipse cx="150" cy="83" rx="22" ry="5" fill="#999"/>
        <g fill="#555" opacity=".8">
          <circle cx="138" cy="81" r="1.5"/><circle cx="146" cy="79" r="1"/>
          <circle cx="155" cy="81" r="2"/><circle cx="161" cy="80" r="1.2"/>
          <circle cx="143" cy="76" r="1"/><circle cx="158" cy="78" r="1.5"/>
        </g>
        <text x="150" y="122" text-anchor="middle" font-size="11" fill="#d97706" font-weight="700">霧面 · 顆粒狀 · 接觸不良</text>`,
      desc: '表面呈「霧面」或顆粒狀，因焊錫未完全熔融即冷卻。常見原因：加熱時間不足（＜ 1 秒）或送錫太早。導電電阻高，振動下容易斷路，是最常見的焊接失敗。'
    },
    {
      id: 'over', name: '過焊（錫球）', badge: '●', color: '#7c3aed',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Soldering-bad.jpg/280px-Soldering-bad.jpg', caption: '過量焊錫示例：錫料堆積過多、形態不規則', page: 'https://commons.wikimedia.org/wiki/File:Soldering-bad.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="55" y="94" width="190" height="12" fill="#16a34a"/>
        <ellipse cx="150" cy="95" rx="50" ry="14" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <circle cx="150" cy="70" r="28" fill="#d0d0d0" stroke="#606060" stroke-width="1.5"/>
        <ellipse cx="140" cy="62" rx="10" ry="6" fill="rgba(255,255,255,.65)"/>
        <ellipse cx="162" cy="76" rx="5" ry="3" fill="rgba(255,255,255,.3)"/>
        <text x="150" y="122" text-anchor="middle" font-size="11" fill="#7c3aed" font-weight="700">球形隆起 · 可能橋接鄰腳短路</text>`,
      desc: '送錫過多，焊錫因表面張力堆積成球形。可能碰觸相鄰腳造成短路。修復方式：用吸錫帶或吸錫器去除多餘焊錫，再重新加熱整形成錐形。'
    },
    {
      id: 'bridge', name: '橋接連錫', badge: '✗', color: '#dc2626',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/L%C3%B6tbr%C3%BCcke.jpg/280px-L%C3%B6tbr%C3%BCcke.jpg', caption: '橋接連錫（Lötbrücke）實物：兩個接腳被錫料短路', page: 'https://commons.wikimedia.org/wiki/File:L%C3%B6tbr%C3%BCcke.jpg', license: 'CC BY-SA · Wikimedia Commons' },
      svg: `<rect x="55" y="94" width="190" height="12" fill="#16a34a"/>
        <ellipse cx="110" cy="92" rx="25" ry="11" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse cx="190" cy="92" rx="25" ry="11" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
        <ellipse cx="110" cy="85" rx="20" ry="7" fill="#d0d0d0" stroke="#888" stroke-width="1"/>
        <ellipse cx="190" cy="85" rx="20" ry="7" fill="#d0d0d0" stroke="#888" stroke-width="1"/>
        <path d="M 130 87 Q 150 80 170 87" fill="#b0b0b0" stroke="#808080" stroke-width="1.5"/>
        <line x1="110" y1="65" x2="110" y2="94" stroke="#6b7280" stroke-width="3"/>
        <line x1="190" y1="65" x2="190" y2="94" stroke="#6b7280" stroke-width="3"/>
        <text x="150" y="122" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="800">⚡ 兩腳相連 — 短路！</text>`,
      desc: '焊錫連接了兩個不應相連的接腳，造成「短路」。這是最嚴重的焊接缺陷，可能燒毀元件或電路板。必須用吸錫帶完整清除後分別重焊。'
    }
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'solder-quality';
  sec.innerHTML = `
    <h3>🔬 焊點品質放大鏡</h3>
    <p class="muted" style="margin-bottom:16px">點擊四種焊點類型，查看截面示意圖與診斷說明。能辨識焊點品質是焊接技術進步的第一步。</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px">
      ${JOINTS.map(j => `<button data-joint="${j.id}" style="padding:12px 8px;border:2px solid #e2e8f0;border-radius:12px;cursor:pointer;background:#fff;text-align:center;font-size:12px;font-weight:700;font-family:inherit;transition:all .2s;color:#374151">
        <div style="font-size:20px;font-weight:900;margin-bottom:5px;color:${j.color}">${j.badge}</div>
        <div>${j.name}</div>
      </button>`).join('')}
    </div>
    <div id="joint-detail" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;min-height:120px">
      <p style="text-align:center;color:#94a3b8;margin:20px 0">👆 點選焊點類型查看截面圖與診斷</p>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  sec.querySelectorAll('[data-joint]').forEach(btn => {
    btn.addEventListener('click', () => {
      sec.querySelectorAll('[data-joint]').forEach(b => { b.style.background='#fff'; b.style.borderColor='#e2e8f0'; b.style.color='#374151'; });
      const j = JOINTS.find(x => x.id === btn.dataset.joint);
      btn.style.background = j.color; btn.style.borderColor = j.color; btn.style.color = '#fff';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      document.getElementById('joint-detail').innerHTML = `
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
          <svg viewBox="0 0 300 135" style="width:240px;height:108px;flex-shrink:0;background:#0b2818;border-radius:8px">${j.svg}</svg>
          <div style="flex:1;min-width:180px">
            <h4 style="margin:0 0 8px;font-size:15px;color:${j.color}">${j.name}</h4>
            <p style="font-size:13px;line-height:1.7;margin:0;color:#374151">${j.desc}</p>
          </div>
        </div>
        <div style="margin-top:14px;display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;background:#f1f5f9;border-radius:10px;padding:12px">
          <img src="${j.photo.url}" alt="${j.photo.caption}" style="width:140px;height:auto;border-radius:6px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">
          <div style="flex:1;min-width:120px">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#374151">📷 實物對照</p>
            <p style="margin:0 0 6px;font-size:12px;color:#64748b">${j.photo.caption}</p>
            <a href="${j.photo.page}" target="_blank" rel="noopener" style="font-size:11px;color:#6366f1">🔗 ${j.photo.license}</a>
          </div>
        </div>`;
    });
  });
})();

/* ── 烙鐵頭形狀圖鑑 ───────────────────────────────────── */
;(function () {
  const TIPS = [
    {
      id: 'conical', name: '圓錐尖頭', en: 'Conical / Pencil Tip',
      color: '#dc2626', temp: '300–360°C',
      best: '精細通孔元件、IC 腳、小型貼片',
      avoid: '大焊盤、線材接頭（接觸面積太小）',
      note: '最常見的初學者教學用頭。接觸點集中，適合練習定點加熱。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Soldering_iron_tip_types.jpg/320px-Soldering_iron_tip_types.jpg', cap: '各種烙鐵頭形狀對比圖', page: 'https://commons.wikimedia.org/wiki/File:Soldering_iron_tip_types.jpg', lic: 'CC BY-SA · Wikimedia Commons' },
      svg: `<line x1="30" y1="50" x2="130" y2="50" stroke="#9ca3af" stroke-width="12" stroke-linecap="round"/>
        <polygon points="130,42 160,50 130,58" fill="#dc2626"/>
        <circle cx="159" cy="50" r="3" fill="#fbbf24"/>`,
    },
    {
      id: 'chisel', name: '扁頭（馬蹄形）', en: 'Chisel / Screwdriver Tip',
      color: '#ea580c', temp: '320–380°C',
      best: '通孔焊接、大焊盤、電線接頭、最常用',
      avoid: '密集 SMD 腳（太寬容易橋接）',
      note: '接觸面積大，傳熱效率最高。絕大多數初學者課程首選。新手從這裡開始。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Soldering_iron_tip_types.jpg/320px-Soldering_iron_tip_types.jpg', cap: '扁頭烙鐵頭（最常用）', page: 'https://commons.wikimedia.org/wiki/File:Soldering_iron_tip_types.jpg', lic: 'CC BY-SA · Wikimedia Commons' },
      svg: `<line x1="30" y1="50" x2="140" y2="50" stroke="#9ca3af" stroke-width="12" stroke-linecap="round"/>
        <rect x="140" y="38" width="22" height="24" rx="2" fill="#ea580c"/>`,
    },
    {
      id: 'bevel', name: '斜切頭（刀形）', en: 'Bevel / Hoof Tip',
      color: '#d97706', temp: '320–370°C',
      best: 'SMD 拖焊（Drag Soldering）、IC 陣腳快速焊',
      avoid: '通孔單點精細焊',
      note: '拖焊技術：把大量錫倒在 IC 腳上，再用這個頭一次拖過去帶走多餘錫，速度極快。進階技巧。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Soldering_iron_tip_types.jpg/320px-Soldering_iron_tip_types.jpg', cap: '斜切頭（拖焊專用）', page: 'https://commons.wikimedia.org/wiki/File:Soldering_iron_tip_types.jpg', lic: 'CC BY-SA · Wikimedia Commons' },
      svg: `<line x1="30" y1="50" x2="140" y2="50" stroke="#9ca3af" stroke-width="12" stroke-linecap="round"/>
        <polygon points="140,38 165,50 140,62" fill="#d97706"/>
        <line x1="148" y1="42" x2="165" y2="58" stroke="#92400e" stroke-width="2"/>`,
    },
    {
      id: 'knife', name: '刀型頭', en: 'Knife Tip',
      color: '#7c3aed', temp: '340–400°C',
      best: '切斷橋接連錫、SMD 大型元件拆焊',
      avoid: '精細通孔、密集排腳',
      note: '用刃部「刮」過連錫就能切斷。也可用來清除舊錫或拆除損壞的連接器。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Soldering_iron_tip_types.jpg/320px-Soldering_iron_tip_types.jpg', cap: '刀型烙鐵頭', page: 'https://commons.wikimedia.org/wiki/File:Soldering_iron_tip_types.jpg', lic: 'CC BY-SA · Wikimedia Commons' },
      svg: `<line x1="30" y1="50" x2="140" y2="50" stroke="#9ca3af" stroke-width="12" stroke-linecap="round"/>
        <polygon points="140,35 170,48 170,52 140,65" fill="#7c3aed"/>
        <line x1="140" y1="35" x2="170" y2="65" stroke="#5b21b6" stroke-width="1.5"/>`,
    },
    {
      id: 'micro', name: '微型尖頭（0.2mm）', en: 'Micro / Needle Tip',
      color: '#0369a1', temp: '280–330°C',
      best: '0402 以下 SMD、手機主板維修、精密修補',
      avoid: '一般通孔焊接（太慢）',
      note: '超細尖端導熱緩慢，需要較長接觸時間。不適合新手，用錯容易冷焊或燒壞元件。',
      photo: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Soldering_iron_tip_types.jpg/320px-Soldering_iron_tip_types.jpg', cap: '微型針頭（精密維修）', page: 'https://commons.wikimedia.org/wiki/File:Soldering_iron_tip_types.jpg', lic: 'CC BY-SA · Wikimedia Commons' },
      svg: `<line x1="30" y1="50" x2="145" y2="50" stroke="#9ca3af" stroke-width="12" stroke-linecap="round"/>
        <polygon points="145,47 175,50 145,53" fill="#0369a1"/>`,
    },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🔧 烙鐵頭形狀圖鑑 <span style="font-size:13px;font-weight:500;color:#64748b;margin-left:8px">點選查看用途與建議</span></h3>
    <p class="muted" style="margin-bottom:14px">烙鐵頭形狀決定了傳熱效率與適用場景。課堂新手建議從<strong>扁頭（馬蹄形）</strong>開始。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px" id="tip-tabs">
      ${TIPS.map(t => `<button data-tip="${t.id}" style="padding:9px 13px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;font-weight:700;font-size:12px;transition:all .2s;color:#374151;line-height:1.3">${t.name}</button>`).join('')}
    </div>
    <div id="tip-detail" style="background:#f8fafc;border-radius:12px;padding:18px;min-height:120px">
      <p style="text-align:center;color:#94a3b8;margin:20px 0">👆 點選烙鐵頭類型查看詳細說明</p>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  document.querySelectorAll('#tip-tabs [data-tip]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#tip-tabs [data-tip]').forEach(b => {
        b.style.background = '#fff'; b.style.borderColor = '#e2e8f0'; b.style.color = '#374151';
      });
      const t = TIPS.find(x => x.id === btn.dataset.tip);
      btn.style.background = t.color; btn.style.borderColor = t.color; btn.style.color = '#fff';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      document.getElementById('tip-detail').innerHTML = `
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
          <div style="flex:1;min-width:220px">
            <h4 style="margin:0 0 2px;color:${t.color}">${t.name}</h4>
            <p style="margin:0 0 10px;font-size:11px;color:#94a3b8;font-style:italic">${t.en}</p>
            <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
              <span style="background:#0f172a;color:#fff;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;font-family:Inter">🌡 ${t.temp}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
              <div style="background:#dcfce7;border-radius:8px;padding:8px 10px;font-size:12px"><strong style="color:#15803d">✓ 適合</strong><br>${t.best}</div>
              <div style="background:#fef2f2;border-radius:8px;padding:8px 10px;font-size:12px"><strong style="color:#dc2626">✗ 避免</strong><br>${t.avoid}</div>
            </div>
            <div style="background:#eff6ff;border-left:3px solid #3b82f6;border-radius:6px;padding:8px 12px;font-size:12px;color:#1e40af">${t.note}</div>
          </div>
          <div style="width:200px;flex-shrink:0">
            <svg viewBox="0 0 200 100" style="width:100%;background:#1e293b;border-radius:8px">${t.svg}</svg>
            <img src="${t.photo.url}" alt="${t.photo.cap}" style="width:100%;border-radius:8px;margin-top:8px;max-height:100px;object-fit:cover" onerror="this.style.display='none'">
            <p style="font-size:10px;color:#94a3b8;margin:4px 0 0"><a href="${t.photo.page}" target="_blank" rel="noopener" style="color:#3b82f6">${t.photo.lic}</a></p>
          </div>
        </div>`;
    });
  });
  // Auto-select chisel (recommended for beginners)
  document.querySelector('#tip-tabs [data-tip="chisel"]')?.click();
})();

/* ── 焊錫耗材 + 助焊劑圖鑑 ──────────────────────────── */
;(function () {
  const nav = document.querySelector('.module-nav-bottom');
  if (!nav) return;

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🧪 焊接耗材全圖鑑</h3>
    <p class="muted" style="margin-bottom:16px">焊錫絲、助焊劑、去錫工具——認識耗材才能買對用對。</p>

    <!-- 焊錫種類 -->
    <h4 style="font-size:14px;font-weight:700;color:#374151;margin:0 0 10px">① 焊錫絲種類</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">
      ${[
        { name: '有鉛錫（Sn63Pb37）', badge:'🟡', color:'#d97706',
          mp:'183°C', temp:'320°C', skill:'⭐ 新手首選',
          pro:'熔點低、流動性佳、焊點光亮、好學習',
          con:'含鉛（對人體有毒，學後洗手）',
          note:'國中課堂標準用錫。焊完務必洗手，不要用手摸口鼻。',
          photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Solder_wire.jpg/320px-Solder_wire.jpg' },
        { name: '無鉛錫（SAC305）', badge:'🟢', color:'#16a34a',
          mp:'217°C', temp:'360–380°C', skill:'⭐⭐ 進階',
          pro:'符合 RoHS 環保法規，無鉛安全',
          con:'熔點高、流動性差、焊點較霧，新手易冷焊',
          note:'工廠量產標準。需要較高溫度，操作不熟練容易冷焊。',
          photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Solder_wire.jpg/320px-Solder_wire.jpg' },
        { name: '錫膏（Solder Paste）', badge:'⬜', color:'#475569',
          mp:'183–217°C', temp:'回流爐 230°C+', skill:'⭐⭐⭐ 專業',
          pro:'SMD 表面貼裝必用，自動印刷機友善',
          con:'需要搭配鋼板印刷 + 回流焊爐或熱風槍',
          note:'用於 SMD 貼片元件。課堂一般不使用，了解概念即可。',
          photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Solder_paste_stencil.jpg/320px-Solder_paste_stencil.jpg' },
      ].map(s => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;border-top:4px solid ${s.color}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:20px">${s.badge}</span>
          <div><div style="font-weight:700;font-size:14px">${s.name}</div><div style="font-size:11px;color:#94a3b8">${s.skill}</div></div>
        </div>
        <img src="${s.photo}" style="width:100%;height:60px;object-fit:cover;border-radius:6px;margin-bottom:8px" onerror="this.style.display='none'">
        <div style="display:flex;gap:6px;margin-bottom:8px;font-size:11px">
          <span style="background:#0f172a;color:#fff;padding:2px 8px;border-radius:4px;font-family:Inter">熔點 ${s.mp}</span>
          <span style="background:${s.color};color:#fff;padding:2px 8px;border-radius:4px;font-family:Inter">操作 ${s.temp}</span>
        </div>
        <div style="font-size:12px;color:#374151;margin-bottom:4px"><span style="color:#16a34a">✓</span> ${s.pro}</div>
        <div style="font-size:12px;color:#374151;margin-bottom:8px"><span style="color:#dc2626">✗</span> ${s.con}</div>
        <div style="background:#f1f5f9;border-radius:6px;padding:6px 8px;font-size:11px;color:#64748b">${s.note}</div>
      </div>`).join('')}
    </div>

    <!-- 助焊劑 -->
    <h4 style="font-size:14px;font-weight:700;color:#374151;margin:0 0 10px">② 助焊劑（Flux）</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:20px">
      ${[
        { name:'松香助焊劑', en:'Rosin Flux', color:'#b45309', badge:'🍂',
          use:'焊後有松香殘留，黃褐色，無腐蝕性（可不清除）',
          best:'通孔元件 / 標準焊接', warn:'電路板外觀較髒，影響美觀' },
        { name:'免洗助焊劑', en:'No-Clean Flux', color:'#0891b2', badge:'💧',
          use:'殘留量極少，符合免清洗需求，工廠量產標準',
          best:'SMD / 大量生產', warn:'仍有微量殘留，高頻電路要清洗' },
        { name:'水溶性助焊劑', en:'Water-Soluble / OA', color:'#16a34a', badge:'🌊',
          use:'活性最強、焊點最好，但焊後「必須」用去離子水清洗',
          best:'銅鋁等難焊金屬', warn:'48 小時內沒清洗會腐蝕銅箔' },
      ].map(f => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;border-left:4px solid ${f.color}">
        <div style="font-size:18px;margin-bottom:6px">${f.badge}</div>
        <div style="font-weight:700;font-size:13px;margin-bottom:2px">${f.name}</div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;font-style:italic">${f.en}</div>
        <div style="font-size:12px;color:#374151;margin-bottom:6px">${f.use}</div>
        <div style="font-size:11px;color:#16a34a;margin-bottom:3px">✓ 最適合：${f.best}</div>
        <div style="font-size:11px;color:#dc2626">⚠ 注意：${f.warn}</div>
      </div>`).join('')}
    </div>

    <!-- 去錫工具 -->
    <h4 style="font-size:14px;font-weight:700;color:#374151;margin:0 0 10px">③ 去錫 / 拆焊工具</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
      ${[
        { name:'吸錫器（Desoldering Pump）', badge:'🔫', color:'#dc2626',
          how:'按下彈簧 → 烙鐵加熱錫到熔融 → 對準瞬間按下吸嘴 → 錫被吸入',
          best:'通孔大量吸錫，速度快', warn:'需要雙手協調，一手烙鐵一手吸',
          photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Desoldering_pump.jpg/320px-Desoldering_pump.jpg' },
        { name:'吸錫線（銅辮子 Desoldering Braid）', badge:'🧵', color:'#7c3aed',
          how:'把銅辮子壓在焊點上 → 烙鐵加熱辮子 → 毛細管效應把錫吸進辮子',
          best:'SMD 連錫、細密間距清理，不需吸力', warn:'單次使用段要剪掉，費料較多',
          photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Desoldering_braid.jpg/320px-Desoldering_braid.jpg' },
      ].map(d => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;border-top:4px solid ${d.color}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:22px">${d.badge}</span>
          <div style="font-weight:700;font-size:13px">${d.name}</div>
        </div>
        <img src="${d.photo}" style="width:100%;height:70px;object-fit:cover;border-radius:6px;margin-bottom:8px" onerror="this.style.display='none'">
        <div style="font-size:12px;color:#374151;margin-bottom:6px"><strong>使用方式：</strong>${d.how}</div>
        <div style="font-size:11px;color:#16a34a;margin-bottom:3px">✓ ${d.best}</div>
        <div style="font-size:11px;color:#dc2626">⚠ ${d.warn}</div>
      </div>`).join('')}
    </div>`;

  nav.parentNode.insertBefore(sec, nav);
})();

/* ── 烙鐵頭保養四步驟互動 ─────────────────────────────── */
;(function () {
  const nav = document.querySelector('.module-nav-bottom');
  if (!nav) return;

  const STEPS = [
    {
      label: '① 發現氧化', color: '#6b7280',
      svg: `<rect x="60" y="44" width="140" height="12" rx="2" fill="#6b7280"/>
        <polygon points="200,40 228,50 200,60" fill="#374151"/>
        <g fill="#1a1a1a" opacity=".8">
          <circle cx="210" cy="46" r="3"/><circle cx="218" cy="50" r="4"/><circle cx="212" cy="55" r="2.5"/>
          <circle cx="222" cy="53" r="3"/><circle cx="206" cy="52" r="2"/>
        </g>
        <text x="150" y="85" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700" font-family="Inter,sans-serif">氧化層 = 黑色顆粒，不沾錫</text>`,
      title: '烙鐵頭氧化了！',
      desc: '烙鐵頭長時間高溫暴露在空氣中會形成氧化層——外觀呈黑褐色、顆粒狀。這層氧化物幾乎不導熱，會讓焊接困難。每次焊接前後都要確認烙鐵頭狀態。',
      tip: '判斷方式：把烙鐵頭輕輕點一下焊錫絲，如果錫立刻縮成球不沾，就是氧化了。',
    },
    {
      label: '② 海綿清潔', color: '#0891b2',
      svg: `<rect x="60" y="44" width="140" height="12" rx="2" fill="#9ca3af"/>
        <polygon points="200,40 228,50 200,60" fill="#374151"/>
        <rect x="60" y="70" width="120" height="20" rx="3" fill="#fbbf24"/>
        <text x="120" y="84" text-anchor="middle" font-size="10" fill="#374151" font-weight="700">濕海綿</text>
        <path d="M 210 70 Q 200 100 180 85" stroke="#0891b2" stroke-width="2" fill="none" marker-end="url(#arrow-c)"/>
        <defs><marker id="arrow-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0891b2"/></marker></defs>
        <text x="150" y="108" text-anchor="middle" font-size="11" fill="#0891b2" font-weight="700" font-family="Inter,sans-serif">烙鐵頭在海綿上擦 2–3 次</text>`,
      title: '海綿擦除氧化物',
      desc: '沾濕並擰乾的清潔海綿（不能太濕）能用溫差讓氧化物從金屬表面剝離。把烙鐵頭在海綿上快速橫向擦拭 2–3 次。另一種方式是用「黃銅球清潔器」——溫差更小，對烙鐵頭更溫和。',
      tip: '海綿太濕會讓烙鐵頭因驟冷而熱衝擊裂開；太乾則無法清潔。測試：用手指輕壓，濕潤但不滴水。',
    },
    {
      label: '③ 上錫（Tinning）', color: '#d97706',
      svg: `<rect x="60" y="44" width="140" height="12" rx="2" fill="#9ca3af"/>
        <polygon points="200,40 228,50 200,60" fill="#e5e7eb"/>
        <line x1="270" y1="20" x2="215" y2="50" stroke="#9ca3af" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="216" cy="50" rx="0" ry="0" fill="rgba(192,192,192,.9)">
          <animate attributeName="rx" values="0;10;10;0" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="0;7;7;0" dur="2.5s" repeatCount="indefinite"/>
        </ellipse>
        <text x="150" y="100" text-anchor="middle" font-size="11" fill="#d97706" font-weight="700" font-family="Inter,sans-serif">焊錫均勻包覆 → 亮銀色！</text>`,
      title: '上錫（Tinning）',
      desc: '烙鐵頭清潔後，立刻將焊錫絲點到烙鐵頭各個面，讓薄薄一層錫均勻包覆整個接觸區域。這層「鍍錫」能隔絕空氣、防止再次氧化，同時大幅提升傳熱效率。',
      tip: '正確的上錫後烙鐵頭應該是「亮銀色」並帶有流動光澤。如果還是偏暗，再重複一次清潔和上錫。',
    },
    {
      label: '④ 保養完成！', color: '#16a34a',
      svg: `<rect x="60" y="44" width="140" height="12" rx="2" fill="#9ca3af"/>
        <polygon points="200,40 228,50 200,60" fill="#e5e7eb"/>
        <ellipse cx="218" cy="50" rx="16" ry="10" fill="rgba(192,192,192,.85)" stroke="#888" stroke-width=".5"/>
        <ellipse cx="213" cy="46" rx="5" ry="3" fill="rgba(255,255,255,.8)"/>
        <circle cx="200" cy="8" r="12" fill="#16a34a"/>
        <text x="200" y="13" text-anchor="middle" font-size="16" fill="#fff">✓</text>
        <text x="150" y="100" text-anchor="middle" font-size="11" fill="#16a34a" font-weight="700" font-family="Inter,sans-serif">亮銀色 · 傳熱效率 100% · 可以焊接！</text>`,
      title: '保養完成，可以開始焊接！',
      desc: '養護好的烙鐵頭呈現亮銀色，錫在接觸點形成良好的橋接層。每次焊接結束後，在存放前也要上錫保護（避免隔夜氧化）。養成習慣：「開機先上錫，收機先上錫」。',
      tip: '烙鐵頭壽命的長短幾乎完全取決於養護習慣。正確養護的頭可以用 2–3 年，忽視養護的頭可能一個月就「死頭」。',
    },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'tinning-practice';
  let cur = 0;

  function buildUI() {
    sec.innerHTML = `
      <h3>🔧 烙鐵頭保養互動教學</h3>
      <p class="muted" style="margin-bottom:14px">每次開機前後都要做的例行保養。點擊進行每個步驟。</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
        ${STEPS.map((s, i) => `<span style="padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${i <= cur ? s.color : '#e2e8f0'};color:${i <= cur ? '#fff' : '#94a3b8'};transition:all .3s">${s.label}</span>`).join('')}
      </div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        <svg viewBox="0 0 300 120" style="width:240px;height:96px;flex-shrink:0;background:#1e293b;border-radius:10px">${STEPS[cur].svg}</svg>
        <div style="flex:1;min-width:200px">
          <h4 style="margin:0 0 8px;font-size:16px;color:${STEPS[cur].color}">${STEPS[cur].title}</h4>
          <p style="font-size:13px;line-height:1.7;margin:0 0 10px;color:#374151">${STEPS[cur].desc}</p>
          <div style="background:#eff6ff;border-left:3px solid #3b82f6;border-radius:6px;padding:8px 12px;font-size:12px;color:#1e40af;margin-bottom:14px">💡 ${STEPS[cur].tip}</div>
          <div style="display:flex;gap:8px">
            ${cur > 0 ? `<button onclick="window._tinningPrev()" style="padding:8px 16px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;font-weight:600;font-size:13px">← 上一步</button>` : ''}
            ${cur < STEPS.length - 1
              ? `<button onclick="window._tinningNext()" style="padding:8px 20px;border:none;border-radius:8px;cursor:pointer;background:${STEPS[cur].color};color:#fff;font-weight:700;font-size:13px">繼續 →</button>`
              : `<button onclick="window._tinningReset()" style="padding:8px 20px;border:none;border-radius:8px;cursor:pointer;background:#16a34a;color:#fff;font-weight:700;font-size:13px">重新練習 ↺</button>`}
          </div>
        </div>
      </div>`;
  }

  window._tinningNext = () => { if (cur < STEPS.length - 1) { cur++; if (typeof SoundFX !== 'undefined') SoundFX.success(); buildUI(); } };
  window._tinningPrev = () => { if (cur > 0) { cur--; buildUI(); } };
  window._tinningReset = () => { cur = 0; buildUI(); };

  nav.parentNode.insertBefore(sec, nav);
  buildUI();
})();

/* ══════════════════════════════════════════════════════════
   🅱  Layer B — 3D 互動模型平台（素材待上傳）
   ─────────────────────────────────────────────────────────
   上傳素材步驟：
   1. 用 Polycam / Scaniverse 掃描烙鐵，匯出為 .glb
   2. 將檔案命名為 iron.glb 並放置到：
      solder/assets/3d/iron.glb
   3. (選用) 建立封面截圖: solder/assets/3d/iron-poster.jpg
   4. 調整下方 HOTSPOTS 陣列的座標（點擊模型查看位置）
   完成後移除「素材準備中」提示，model-viewer 自動生效。
   ════════════════════════════════════════════════════════ */
;(function () {
  const nav = document.querySelector('.module-nav-bottom');
  if (!nav) return;

  // ── 熱點定義（AI 生成模型座標與掃描件不同，暫清空；之後可用 model-viewer 點位校正後填回） ──
  const HOTSPOTS = [];

  // 確認 GLB 檔案是否已上傳
  const glbPath = '../../solder/assets/3d/iron.glb';
  const hasAsset = true; // ← 已放入 Tripo 生成的 iron.glb（2MB，已減面+Draco）

  const sec = document.createElement('section');
  sec.className = 'panel';

  if (hasAsset) {
    // ── 真實 3D 模型模式 ──
    if (!customElements.get('model-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.head.appendChild(s);
    }
    sec.innerHTML = `
      <h3>🔭 烙鐵 3D 互動模型 <span style="font-size:12px;font-weight:500;color:#64748b;margin-left:6px">旋轉 · 縮放</span></h3>
      <p class="muted" style="margin-bottom:14px">拖曳可旋轉、滾輪縮放，從各角度認識電烙鐵與支架的構造。<span style="font-size:12px;color:#94a3b8">（AI 生成的示意模型）</span></p>
      <div style="background:#1e293b;border-radius:14px;overflow:hidden">
        <model-viewer
          src="${glbPath}"
          auto-rotate auto-rotate-delay="0" rotation-per-second="15deg"
          camera-controls min-camera-orbit="auto auto 5%" max-camera-orbit="auto auto 200%"
          environment-image="neutral" shadow-intensity="1"
          style="width:100%;height:360px;--poster-color:#1e293b">
          ${HOTSPOTS.map(h => `
            <button class="hotspot" slot="hotspot-${h.id}"
              data-position="${h.pos}" data-normal="${h.norm}"
              style="background:#f97316;border:2px solid #fff;border-radius:50%;width:20px;height:20px;cursor:pointer"
              title="${h.label}">
              <div class="annotation" style="background:#0f172a;color:#fff;padding:8px 12px;border-radius:8px;width:160px;font-size:12px;position:absolute;bottom:24px;left:50%;transform:translateX(-50%);white-space:normal;text-align:left;pointer-events:none">
                <strong style="color:#f97316">${h.label}</strong><br>${h.desc}
              </div>
            </button>`).join('')}
          <div slot="progress-bar" style="background:linear-gradient(90deg,#0891b2,#22c55e);height:3px"></div>
        </model-viewer>
      </div>`;
  } else {
    // ── 佔位模式（素材待上傳）──
    sec.innerHTML = `
      <h3>🔭 烙鐵 3D 互動模型 <span style="font-size:12px;padding:2px 8px;background:#fef3c7;color:#92400e;border-radius:4px;margin-left:8px">素材準備中</span></h3>
      <div style="background:#1e293b;border-radius:14px;padding:36px;text-align:center;border:2px dashed #334155">
        <div style="font-size:48px;margin-bottom:12px">🔧</div>
        <p style="color:#94a3b8;font-size:14px;margin:0 0 8px">3D 互動烙鐵模型即將上線</p>
        <p style="color:#64748b;font-size:12px;margin:0">素材準備好後，將掃描的 <code style="background:#0f172a;padding:2px 6px;border-radius:4px;color:#22c55e">iron.glb</code> 放入 <code style="background:#0f172a;padding:2px 6px;border-radius:4px;color:#22c55e">solder/assets/3d/</code> 即可</p>
      </div>
      <div style="margin-top:12px;background:#eff6ff;border-radius:8px;padding:12px 16px;font-size:12px;color:#1e40af">
        <strong>📱 拍攝提示：</strong>使用 iPhone 12 Pro 以上（含 LiDAR）的 <strong>Polycam</strong> 或 <strong>Scaniverse</strong> App 掃描烙鐵，匯出 .glb 格式後提供給我即可部署。學生將能在網頁上旋轉、放大，並點擊各零件查看說明。
      </div>`;
  }

  nav.parentNode.insertBefore(sec, nav);
})();
