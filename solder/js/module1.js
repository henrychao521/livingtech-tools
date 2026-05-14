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
        </div>`;
    });
  });
})();
