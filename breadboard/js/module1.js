// 麵包板平台 模組 1：認識麵包板與元件
const PARTS = {
  'rail-pos': {
    name: '正電源軌（+）',
    role: 'POSITIVE POWER RAIL',
    desc: '麵包板上下緣紅色標記的長條，整條金屬條相連。連到電池正極後，整條都是 + 5V 或 + 9V。一塊板有 2 條（上下）正電源軌。',
    fact: '中間通常有「斷點」標示，意思是整條其實分成兩段，跨段連通要拉跳線。'
  },
  'rail-neg': {
    name: '負電源軌（−）',
    role: 'GROUND RAIL',
    desc: '正電源軌旁的黑色標記長條，又稱「地」（GND）。連到電池負極，整條都是 0V。所有元件的「回流」都接到這裡。',
    fact: '在電子電路中，地（GND）是所有電壓的參考點。'
  },
  'middle-rows': {
    name: '中間區（行 a–e、f–j）',
    role: 'TIE POINTS GRID',
    desc: '麵包板中央的元件區，分成上半（a-e）與下半（f-j）。<strong>同一行（橫向 5 個洞）金屬條連通</strong>，例如 a1-b1-c1-d1-e1 是相連的，但 a1-a2 不相連。',
    fact: '元件腳插同一行就是「連在一起」；插不同行就是「分開」。理解這點是麵包板的核心。'
  },
  gap: {
    name: '中央溝槽（Gap）',
    role: 'MIDDLE DIVIDER',
    desc: '麵包板中央的橫向溝槽，<strong>把上半（a-e）和下半（f-j）分開</strong>。a 行不會連到 f 行。這個設計是為了讓 IC 晶片可以橫跨溝槽插入。',
    fact: 'IC 晶片的接腳會跨溝插下去，左右兩排腳分別連到不同行。'
  },
  led: {
    name: 'LED（發光二極體）',
    role: 'LIGHT EMITTING DIODE',
    desc: '會發光的二極體，常見紅、綠、藍、黃。<strong>有方向性</strong>：長腳是正極（陽極/anode），短腳是負極（陰極/cathode）。電流必須從長腳進、短腳出才會發光。',
    fact: '插反不會壞但不會亮。電壓超過時會燒掉，所以一定要搭配電阻使用。'
  },
  resistor: {
    name: '電阻（Resistor）',
    role: 'CURRENT LIMITER',
    desc: '限制電流流量，避免 LED、IC 燒毀。沒有方向性。常見規格 220Ω、330Ω、1kΩ、10kΩ。色環標示阻值（紅紅棕 = 220Ω）。',
    fact: '驅動 LED 一般用 220Ω–1kΩ。沒有電阻直接接 LED 到 5V 電池，LED 會在 1 秒內燒掉。'
  },
  battery: {
    name: '電池盒 / 電源',
    role: 'POWER SOURCE',
    desc: '提供電路電力。常見規格：3V（兩顆 AA）、4.5V（三顆 AA）、9V（方形電池）。紅色線是正極（+），黑色線是負極（−）。',
    fact: '不要用超過 5V 直接驅動 LED，即使加了電阻也容易過熱。教學常用 4.5V 或 USB 5V。'
  },
  jumper: {
    name: '跳線（Jumper Wires）',
    role: 'JUMPER WIRE',
    desc: '不同顏色的彩色硬芯線，兩端有金屬針可插入麵包板洞。用來連接不同行、或跨接電源軌。<strong>顏色慣例</strong>：紅色 = 正電源、黑色 = 地、其他顏色 = 訊號線。',
    fact: '養成「紅+黑−」的習慣，未來除錯時看顏色就知道哪條線是電源。'
  },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;

const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PROGRESS_KEY_BB = 'breadboard_progress_v1';
function loadBBProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_BB)) || { module1_seen: [] }; }
  catch { return { module1_seen: [] }; }
}
function saveBBProgress(p) {
  localStorage.setItem(PROGRESS_KEY_BB, JSON.stringify(p));
}

const savedProg = loadBBProgress();
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
    g.querySelector('.hotspot').classList.toggle('seen', seenSet.has(g.dataset.id));
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
      <strong style="color:#92400e">💡 冷知識：</strong>${p.fact}
    </div>
  `;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncSeenUI();
    const prog = loadBBProgress();
    prog.module1_seen = Array.from(seenSet);
    if (seenSet.size === totalParts) {
      prog.module1 = true;
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 所有元件都認識完畢！可以前往下一關', 'good');
    }
    saveBBProgress(prog);
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
