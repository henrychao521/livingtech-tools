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
