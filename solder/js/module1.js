// 焊接平台 模組 1：認識電烙鐵與焊接耗材
const PARTS = {
  tip: {
    name: '烙鐵頭（Tip）',
    role: '傳熱核心',
    desc: '直接接觸接點與焊錫、把熱傳過去的部分。形狀有圓錐、一字（扁平）、斜切、刀型等，見下方「烙鐵頭形狀圖鑑」。',
    fact: '烙鐵頭表面要保持「上錫」（tinning）才能有效傳熱；做法見模組 3 步驟 3。'
  },
  heating: {
    name: '加熱元件（Heating Element）',
    role: '內部發熱',
    desc: '位於烙鐵頭內部的陶瓷電阻發熱體，把電能轉為熱能。功率常見 30W、40W、60W。功率越大加熱越快，但學生用建議 30–40W 就夠。',
    fact: '從冷態加熱到 350°C 約需 30–60 秒，這也是為什麼上課要先開電源讓它預熱。'
  },
  handle: {
    photo: '../assets/livingtech-photos/iron.jpg',
    name: '隔熱握柄（Handle）',
    role: '隔熱握持',
    desc: '由耐高溫塑膠或軟木製成的握把，避免操作者燙傷。手持時應像握筆一樣握在握柄前段（不接觸金屬段為原則）以提高精度。',
    fact: '握柄如果發燙、變形、裂痕，就是危險警訊，要立即停用並通報老師。'
  },
  display: {
    name: '溫控與顯示器（Temp Display）',
    role: '溫度控制',
    desc: '可調溫烙鐵會顯示當前溫度與設定溫度。設定多少依焊錫種類而定，見下方「焊錫絲種類」。',
    fact: '指示燈閃爍代表加熱中，恆亮代表已達設定溫度可以開始焊接。'
  },
  cord: {
    name: '電源線（Power Cord）',
    role: '供電線路',
    desc: '矽膠或耐熱橡膠材質，避免被自身高溫熔毀。要確保電線不會纏繞、不會被烙鐵頭碰到。',
    fact: '電源線若有破皮、銅絲外露、發燙等狀況，必須立即停用更換。'
  },
  stand: {
    photo: '../assets/livingtech-photos/iron-stand.jpeg',
    name: '烙鐵架（Stand）',
    role: '安全擺放',
    desc: '金屬底座 + 螺旋彈簧，讓加熱中的烙鐵有安全停放處。烙鐵離手必須立刻放架上，**絕對不可以**直接放桌面或紙上。',
    fact: '直接放桌面是焊接最常見的火災與燙傷成因之一（依 Illinois DRS、MIT EHS 等安全教材）。'
  },
  sponge: {
    photo: '../assets/livingtech-photos/sponge.png',
    name: '清潔海綿（Cleaning Sponge）',
    role: '烙鐵頭清潔',
    desc: '使用前要先用水沾濕並擰乾。焊接過程中烙鐵頭容易黏上焊渣，每幾次焊接要在海綿上擦一下。',
    fact: '進階款用「黃銅球」清潔器，比海綿溫和不會驟冷烙鐵頭。'
  },
  'solder-wire': {
    photo: '../assets/livingtech-photos/solder-wire.jpg',
    name: '焊錫絲（Solder Wire）',
    role: '填充金屬',
    desc: '中空管狀，內含助焊劑（flux）。常見直徑 0.6mm（精細）、0.8mm（一般）、1.0mm（粗）。課堂常用 0.8mm 含鉛錫（Sn63Pb37）；若使用無鉛錫（例如 SAC305），熔點較高，可對照比較。',
    fact: '含鉛錫熔點 183°C、較好上手，但焊完一定要洗手；無鉛錫熔點較高，比較見下方「焊錫絲種類」。'
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
    ${p.photo ? `<div class="part-photo"><img src="${p.photo}" alt="${p.name.split('（')[0]}實物照片"><span>實物照片<br>來源：<a href="https://livingtech.education/2017/03/30/%e5%9f%ba%e6%9c%ac%e9%9b%bb%e5%ad%90%e9%8a%b2%e6%8e%a5%ef%bc%88%e7%b7%a8%e8%bc%af%e4%b8%ad%ef%bc%89/" target="_blank" rel="noopener">珩宇老師「基本電子銲接」</a></span></div>` : ''}
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

// 焊點好壞（好焊點、冷焊、過量、連錫）在模組 5「焊點品質鑑定」完整介紹，本模組不重複（2026-10 精簡）

/* ── 烙鐵頭形狀圖鑑 ───────────────────────────────────── */
;(function () {
  const TIPS = [
    {
      id: 'conical', name: '圓錐尖頭（B 型）', en: 'Conical Tip',
      color: '#dc2626',
      best: '精細通孔元件、IC 腳、小型表面黏著元件',
      avoid: '大焊墊、線材接頭（接觸面積太小）',
      note: '接觸點集中，適合細小焊點的定點加熱；接觸面積小，焊大焊墊時熱傳不夠。',
    },
    {
      id: 'chisel', name: '一字扁頭（D 型）', en: 'Chisel / Screwdriver Tip',
      color: '#ea580c',
      best: '通孔焊接、大焊墊、電線接頭、最常用',
      avoid: '密集 SMD 腳（太寬容易橋接）',
      note: '平面接觸面積大、熱傳得快，一般通孔焊接最好用，新手從這裡開始。',
    },
    {
      id: 'bevel', name: '斜切頭（C 型，馬蹄形）', en: 'Bevel Tip',
      color: '#d97706',
      best: 'SMD 拖焊（Drag Soldering）、IC 接腳快速焊',
      avoid: '通孔單點精細焊',
      note: '拖焊技術：把大量錫倒在 IC 腳上，再用這個頭一次拖過去帶走多餘錫，速度極快。進階技巧。',
    },
    {
      id: 'knife', name: '刀型頭（K 型）', en: 'Knife Tip',
      color: '#7c3aed',
      best: '切斷橋接連錫、SMD 大型元件拆焊',
      avoid: '精細通孔、密集排腳',
      note: '用刃部「刮」過連錫就能切斷。也可用來清除舊錫或拆除損壞的連接器。',
    },
    {
      id: 'micro', name: '細針尖頭（I 型）', en: 'Needle Tip',
      color: '#0369a1',
      best: '0402 以下 SMD、手機主機板維修、精密修補',
      avoid: '一般通孔焊接（太慢）',
      note: '超細尖端導熱緩慢，需要較長接觸時間。不適合新手，用錯容易冷焊或燒壞元件。',
    },
  ];

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🔧 烙鐵頭形狀圖鑑 <span style="font-size:13px;font-weight:500;color:#64748b;margin-left:8px">點選查看用途</span></h3>
    <p class="muted" style="margin-bottom:14px">外形依白光 HAKKO T18 系列型錄的型號與比例繪製（B／I／D／C／K 是型錄的型號代碼）。課堂新手建議從<strong>一字扁頭</strong>開始。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px" id="tip-tabs">
      ${TIPS.map(t => `<button data-tip="${t.id}" style="padding:9px 13px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:#fff;font-weight:700;font-size:12px;transition:all .2s;color:#374151;line-height:1.3">${t.name}</button>`).join('')}
    </div>
    <div id="tip-detail" style="background:#f8fafc;border-radius:12px;padding:18px;min-height:120px">
      <p style="text-align:center;color:#94a3b8;margin:20px 0">👆 點選烙鐵頭類型查看詳細說明</p>
    </div>
    <div style="margin-top:12px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:10px 14px;font-size:13px;color:#78350f;line-height:1.7">
      <strong>烙鐵頭保養：</strong>烙鐵頭發黑代表氧化，用沾濕擰乾的海綿擦拭後立刻上錫；收工前也要上錫保護。判斷方式：輕點焊錫絲，錫縮成球不沾就是氧化了。完整步驟與動畫見<a href="module3.html" style="color:#b45309">模組 3</a> 步驟 2、3。
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
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
              <div style="background:#dcfce7;border-radius:8px;padding:8px 10px;font-size:12px"><strong style="color:#15803d">✓ 適合</strong><br>${t.best}</div>
              <div style="background:#fef2f2;border-radius:8px;padding:8px 10px;font-size:12px"><strong style="color:#dc2626">✗ 避免</strong><br>${t.avoid}</div>
            </div>
            <div style="background:#eff6ff;border-left:3px solid #3b82f6;border-radius:6px;padding:8px 12px;font-size:12px;color:#1e40af">${t.note}</div>
          </div>
          <div style="flex:1 1 240px;max-width:360px">
            ${window.SolderTips ? SolderTips.tipSvg(t.id).replace('<svg ', '<svg class="tip-figure" ') : ''}
            <p style="font-size:11px;color:#94a3b8;margin:4px 0 0">示意圖，本站依 HAKKO 型錄外形繪製</p>
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
          mp:'183°C', temp:'315–343°C', skill:'⭐ 新手首選',
          pro:'熔點低、流動性佳、焊點光亮、好學習',
          con:'含鉛（對人體有毒，學後洗手）',
          note:'課堂常用這一種。焊完務必洗手，不要用手摸口鼻，焊接區不飲食。' },
        { name: '無鉛錫（SAC305）', badge:'🟢', color:'#16a34a',
          mp:'約 217–221°C', temp:'371–400°C', skill:'⭐⭐ 進階',
          pro:'符合 RoHS 環保法規，無鉛安全',
          con:'熔點高、流動性差、焊點較霧，新手易冷焊',
          note:'工廠量產標準，老師會用這一卷示範比較：同樣溫度下熔得比較慢，需要把烙鐵調高，操作不熟練容易冷焊。' },
        { name: '錫膏（Solder Paste）', badge:'⬜', color:'#475569',
          mp:'依合金', temp:'迴焊爐／熱風槍', skill:'⭐⭐⭐ 專業',
          pro:'SMD 表面黏著必用，自動印刷機友善',
          con:'需要搭配鋼板印刷 + 迴焊爐或熱風槍',
          note:'用於 SMD 表面黏著元件。課堂一般不使用，了解概念即可。' },
      ].map(s => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;border-top:4px solid ${s.color}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:20px">${s.badge}</span>
          <div><div style="font-weight:700;font-size:14px">${s.name}</div><div style="font-size:11px;color:#94a3b8">${s.skill}</div></div>
        </div>
        ${s.photo ? `<img class="tool-photo" src="${s.photo}" alt="${s.name}" onerror="this.style.display='none'">` : ''}
        <div style="display:flex;gap:6px;margin-bottom:8px;font-size:11px">
          <span style="background:#0f172a;color:#fff;padding:2px 8px;border-radius:4px;font-family:Inter">熔點 ${s.mp}</span>
          <span style="background:${s.color};color:#fff;padding:2px 8px;border-radius:4px;font-family:Inter">烙鐵頭 ${s.temp}</span>
        </div>
        <div style="font-size:12px;color:#374151;margin-bottom:4px"><span style="color:#16a34a">✓</span> ${s.pro}</div>
        <div style="font-size:12px;color:#374151;margin-bottom:8px"><span style="color:#dc2626">✗</span> ${s.con}</div>
        <div style="background:#f1f5f9;border-radius:6px;padding:6px 8px;font-size:11px;color:#64748b">${s.note}</div>
      </div>`).join('')}
    </div>

    <p style="font-size:11px;color:#94a3b8;margin:-12px 0 18px">烙鐵頭溫度出處：Kester〈44 Flux-Cored Wire〉技術資料（含鉛合金最常用 315–343°C、無鉛合金 371–400°C）。</p>
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
          best:'氧化較嚴重的銅、黃銅、鍍鎳腳等難潤濕的接點', warn:'48 小時內沒清洗會腐蝕銅箔' },
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
          how:'按下彈簧 → 烙鐵加熱錫到熔融 → 吸嘴貼緊焊點 → 按下釋放鈕 → 錫被吸入',
          best:'通孔大量吸錫，速度快', warn:'需要雙手協調，一手烙鐵一手吸',
          photo:'../assets/wiki-photos/desoldering-pump.webp', credit:'照片：Desoldering pump.jpg｜Ansgar Hellwig｜CC BY-SA 2.0 de｜<a href="https://commons.wikimedia.org/wiki/File:Desoldering_pump.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>' },
        { name:'吸錫線（Desoldering Braid，銅編織線）', badge:'🧵', color:'#7c3aed',
          how:'把吸錫線壓在焊點上 → 烙鐵隔著吸錫線加熱 → 毛細作用把錫吸進編織線',
          best:'SMD 連錫、細密間距清理，不需吸力', warn:'單次使用段要剪掉，費料較多' },
      ].map(d => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;border-top:4px solid ${d.color}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:22px">${d.badge}</span>
          <div style="font-weight:700;font-size:13px">${d.name}</div>
        </div>
        ${d.photo ? `<img class="tool-photo" src="${d.photo}" alt="${d.name}" onerror="this.style.display='none'">` : ''}
        ${d.credit ? `<div style="font-size:11px;color:#94a3b8;margin:-4px 0 8px">${d.credit}</div>` : ''}
        <div style="font-size:12px;color:#374151;margin-bottom:6px"><strong>使用方式：</strong>${d.how}</div>
        <div style="font-size:11px;color:#16a34a;margin-bottom:3px">✓ ${d.best}</div>
        <div style="font-size:11px;color:#dc2626">⚠ ${d.warn}</div>
      </div>`).join('')}
    </div>`;

  nav.parentNode.insertBefore(sec, nav);
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
