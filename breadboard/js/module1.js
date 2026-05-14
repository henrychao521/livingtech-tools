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
    desc: '麵包板中央的元件區，分成上半（a-e）與下半（f-j）。<strong>同一直行 5 個洞（如 a1-b1-c1-d1-e1）內部金屬條相連</strong>，但 a1-a2 不相連（不同直行）。',
    fact: '元件腳插「同一數字、不同字母」就是相連；插不同數字就是分開。理解這點是麵包板的核心。'
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
    fact: '插反 LED 不會亮；3V 電池下通常不會壞，但 5V 以上（USB、9V 電池）會超過反向擊穿電壓而損壞。一定要搭配限流電阻使用。'
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

// ========================
// X 光透視圖（模組 1 延伸互動）
// ========================
(function() {
  const COLS = 12;
  const HALF = 5;         // rows per half (a-e / f-j)
  const GAP = 20;         // px per hole
  const HR = 5;           // hole radius
  const OX = 32;          // left margin for holes
  const RAIL_P_Y  = 22;   // top + rail
  const RAIL_N_Y  = 40;   // top − rail
  const MAIN_T_Y  = 66;   // row a top
  const GROOVE_Y  = MAIN_T_Y + HALF * GAP + 4;
  const MAIN_B_Y  = GROOVE_Y + 20; // row f bottom
  const BRAIL_N_Y = MAIN_B_Y + HALF * GAP + 10;
  const BRAIL_P_Y = BRAIL_N_Y + 18;
  const BREAK_AT  = 6;    // break between col 5 and 6
  const ROWS = ['a','b','c','d','e','f','g','h','i','j'];

  const CANVAS_W = OX + COLS * GAP + 24;
  const CANVAS_H = BRAIL_P_Y + 22;

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.id = 'bb-xray';
  sec.innerHTML = `
    <h3>🔬 麵包板 X 光透視圖</h3>
    <p class="muted" style="margin-bottom:12px">點擊任一個洞，亮起所有在同一條<strong>內部金屬條</strong>上相連的洞。理解連接關係是電路設計的核心。</p>
    <div style="display:flex;justify-content:center;margin-bottom:10px;overflow-x:auto">
      <canvas id="bb-xray-cv" width="${CANVAS_W}" height="${CANVAS_H}" style="border-radius:10px;cursor:pointer;max-width:100%;touch-action:manipulation"></canvas>
    </div>
    <div id="bb-xray-msg" style="text-align:center;font-size:13px;color:#64748b;min-height:22px;margin-bottom:10px"></div>
    <div style="display:flex;gap:14px;justify-content:center;font-size:12px;flex-wrap:wrap;margin-top:4px">
      <span style="display:flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:3px;background:#fbbf24;display:inline-block"></span>點擊的洞</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:3px;background:#fde68a;display:inline-block"></span>相連的洞</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:3px;background:#fca5a5;display:inline-block"></span>正電源軌</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:3px;background:#93c5fd;display:inline-block"></span>接地軌</span>
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const cv = document.getElementById('bb-xray-cv');
  const ctx = cv.getContext('2d');

  // Build hole list
  const holes = [];
  function addH(x, y, group, label) { holes.push({ x, y, group, label }); }

  for (let c = 0; c < COLS; c++) {
    const g = c < BREAK_AT;
    addH(OX + c * GAP, RAIL_P_Y, `rtp_${g?'L':'R'}`, `+${c+1}`);
    addH(OX + c * GAP, RAIL_N_Y, `rtn_${g?'L':'R'}`, `−${c+1}`);
  }
  for (let r = 0; r < HALF; r++) {
    for (let c = 0; c < COLS; c++) {
      addH(OX + c * GAP, MAIN_T_Y + r * GAP, `ct_${c}`, `${ROWS[r]}${c+1}`);
    }
  }
  for (let r = 0; r < HALF; r++) {
    for (let c = 0; c < COLS; c++) {
      addH(OX + c * GAP, MAIN_B_Y + r * GAP, `cb_${c}`, `${ROWS[r+5]}${c+1}`);
    }
  }
  for (let c = 0; c < COLS; c++) {
    const g = c < BREAK_AT;
    addH(OX + c * GAP, BRAIL_N_Y, `rbn_${g?'L':'R'}`, `−${c+1}`);
    addH(OX + c * GAP, BRAIL_P_Y, `rbp_${g?'L':'R'}`, `+${c+1}`);
  }

  let selGroup = null, selHole = null;

  function holeColor(h) {
    if (selHole && h.x === selHole.x && h.y === selHole.y) return '#fbbf24';
    if (selGroup && h.group === selGroup) return '#fde68a';
    if (h.group.startsWith('rtp') || h.group.startsWith('rbp')) return '#fca5a5';
    if (h.group.startsWith('rtn') || h.group.startsWith('rbn')) return '#93c5fd';
    return '#c8b89a';
  }

  function draw() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    // Board
    ctx.fillStyle = '#e8dcc8';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(4, 4, CANVAS_W - 8, CANVAS_H - 8, 8);
    else ctx.rect(4, 4, CANVAS_W - 8, CANVAS_H - 8);
    ctx.fill();

    // Rail tint
    ctx.fillStyle = 'rgba(255,80,80,.1)';
    ctx.fillRect(4, RAIL_P_Y - 10, CANVAS_W - 8, 26);
    ctx.fillStyle = 'rgba(80,80,255,.07)';
    ctx.fillRect(4, RAIL_N_Y + 6, CANVAS_W - 8, 10);
    ctx.fillStyle = 'rgba(80,80,255,.07)';
    ctx.fillRect(4, BRAIL_N_Y - 6, CANVAS_W - 8, 10);
    ctx.fillStyle = 'rgba(255,80,80,.1)';
    ctx.fillRect(4, BRAIL_P_Y - 8, CANVAS_W - 8, 24);

    // Center groove
    ctx.fillStyle = '#c9b8a2';
    ctx.fillRect(4, GROOVE_Y, CANVAS_W - 8, 18);
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fillRect(4, GROOVE_Y + 6, CANVAS_W - 8, 5);

    // Break dotted line
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    const bx = OX + (BREAK_AT - 0.5) * GAP;
    ctx.beginPath(); ctx.moveTo(bx, 8); ctx.lineTo(bx, RAIL_N_Y + 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, BRAIL_N_Y - 8); ctx.lineTo(bx, BRAIL_P_Y + 10); ctx.stroke();
    ctx.setLineDash([]);

    // Group highlight strip
    if (selGroup) {
      ctx.fillStyle = 'rgba(251,191,36,.25)';
      if (selGroup.startsWith('ct_')) {
        const c = parseInt(selGroup.split('_')[1]);
        ctx.fillRect(OX + c * GAP - 4, MAIN_T_Y - 6, 8, HALF * GAP + 4);
      } else if (selGroup.startsWith('cb_')) {
        const c = parseInt(selGroup.split('_')[1]);
        ctx.fillRect(OX + c * GAP - 4, MAIN_B_Y - 6, 8, HALF * GAP + 4);
      } else {
        // rail group — find all holes
        const gHoles = holes.filter(h => h.group === selGroup);
        if (gHoles.length > 0) {
          const minX = Math.min(...gHoles.map(h => h.x));
          const maxX = Math.max(...gHoles.map(h => h.x));
          ctx.fillRect(minX - 4, gHoles[0].y - 6, maxX - minX + 8, 12);
        }
      }
    }

    // Row / rail labels
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillStyle = '#ef4444'; ctx.fillText('+', 10, RAIL_P_Y + 3);
    ctx.fillStyle = '#3b82f6'; ctx.fillText('−', 10, RAIL_N_Y + 3);
    ctx.fillStyle = '#3b82f6'; ctx.fillText('−', 10, BRAIL_N_Y + 3);
    ctx.fillStyle = '#ef4444'; ctx.fillText('+', 10, BRAIL_P_Y + 3);
    ctx.fillStyle = '#78716c';
    for (let r = 0; r < 5; r++) {
      ctx.fillText(ROWS[r],   14, MAIN_T_Y + r * GAP + 3);
      ctx.fillText(ROWS[r+5], 14, MAIN_B_Y + r * GAP + 3);
    }

    // Holes
    holes.forEach(h => {
      ctx.beginPath(); ctx.arc(h.x, h.y, HR, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a'; ctx.fill();
      ctx.beginPath(); ctx.arc(h.x, h.y, HR - 1, 0, Math.PI * 2);
      ctx.fillStyle = holeColor(h); ctx.fill();
    });
  }

  function descGroup(g, cnt) {
    if (g.startsWith('ct_')) return `上半區第 ${parseInt(g.split('_')[1])+1} 行（a–e）：${cnt} 洞相連 ✓`;
    if (g.startsWith('cb_')) return `下半區第 ${parseInt(g.split('_')[1])+1} 行（f–j）：${cnt} 洞相連 ✓`;
    const side = g.endsWith('L') ? '左段' : '右段（斷點後）';
    if (g.startsWith('rtp') || g.startsWith('rbp')) return `正電源軌（+） ${side}：${cnt} 洞相連`;
    return `接地軌（−） ${side}：${cnt} 洞相連`;
  }

  cv.addEventListener('click', e => {
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (CANVAS_W / rect.width);
    const my = (e.clientY - rect.top) * (CANVAS_H / rect.height);
    let best = null, bestD = Infinity;
    holes.forEach(h => { const d = Math.hypot(mx - h.x, my - h.y); if (d < bestD) { bestD = d; best = h; } });
    if (best && bestD < 14) {
      selHole = best; selGroup = best.group;
      const cnt = holes.filter(h => h.group === selGroup).length;
      document.getElementById('bb-xray-msg').innerHTML =
        `<strong style="color:#f59e0b">${best.label}</strong> — ${descGroup(selGroup, cnt)}`;
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
      draw();
    }
  });

  draw();
})();
