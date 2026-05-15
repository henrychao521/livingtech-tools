// 鑽床 模組 3：操作流程
const STEPS = [
  { title: '穿戴護具、整理服儀', desc: '護目鏡（防鐵屑彈飛）、口罩（防粉塵）。長髮綁起、寬鬆袖口塞好、項鍊摘下。\n⚠ 鑽床操作禁戴布手套——手套會被夾頭捲入比沒戴更危險。', tip: '護目鏡要選包覆型，普通眼鏡擋不住側面飛屑。', warn: '禁戴布手套是鑽床操作鐵則。', anim: 'ppe' },
  { title: '選鑽頭、裝入夾頭', desc: '依材料選對鑽頭：木 → 木工螺旋；金屬 → HSS。鑽頭直徑不能超過夾頭規格。\n把鑽頭插入夾頭三爪中心約 70–80% 深，用「鑰匙」鎖三個齒輪孔各一次（讓夾爪平均施力）。', tip: '夾頭三個孔都要鎖一遍，只鎖一個會偏心。', warn: null, anim: 'install' },
  { title: '⚠ 拔下夾頭鑰匙', desc: '裝完鑽頭、鎖緊後，**必須**把夾頭鑰匙拔下並放回工具盒。沒拔下鑰匙就開機，鑰匙會以高速甩飛——是鑽床最常見的傷害事故。', tip: '養成「鎖完馬上拔」的肌肉記憶，不要分心。', warn: '沒拔鑰匙絕對不能開機。', anim: 'key' },
  { title: '依直徑與材料設定轉速', desc: '打開皮帶箱蓋（先確認電源在 OFF）→ 把皮帶移到對應的皮帶輪段位 → 蓋回。\n通則：直徑越大、材料越硬 → 轉速越慢。\n參考：木材 8mm 約 2000 RPM、鋼板 8mm 約 600 RPM。', tip: '機台側邊或皮帶箱蓋內常印有「轉速表」可以對照。', warn: '皮帶換位前一定要拔插頭或斷電。', anim: 'speed' },
  { title: '工件夾上工作檯', desc: '把工件放在工作檯上，**必須**用以下方式之一固定：\n• 機台老虎鉗（machine vise）\n• C 型夾固定到 T 槽\n• 大型工件直接螺絲鎖工作檯\n\n工件下方墊「廢木板」當犧牲層，避免鑽穿工作檯。', tip: '小工件絕對不能徒手按——一定要夾住。', warn: '徒手按工件是鑽床最常見事故來源。', anim: 'clamp' },
  { title: '調整工作檯高度', desc: '鬆開工作檯後方的鎖具，搖動高度調整桿讓鑽頭尖距工件約 5cm（足夠下降鑽孔的空間）。調好再鎖緊。\n大型工件可能需要把工作檯轉到旁邊、用基座當工作面。', tip: '鑽頭與工件接觸時，主軸應該還能再下降至少 5–8cm。', warn: null, anim: 'height' },
  { title: '開機 → 對位 → 進刀鑽孔', desc: '1. 開電源、主軸開始轉動\n2. 觀察是否有異常震動或聲音\n3. 順時針旋轉進刀手柄，鑽頭緩慢下降\n4. 鑽頭接觸工件後輕推進刀（不要猛力）\n5. 深孔或硬料每鑽 5mm 退鑽一次排屑', tip: '聽聲音判斷：穩定的「呼呼聲」= 正常；「咯咯聲」或「叫聲」= 進刀太猛或鑽頭鈍。', warn: null, anim: 'drill' },
  { title: '退鑽 → 停機 → 清理收工', desc: '1. 鑽穿後逆時針旋轉手柄，鑽頭完全上升\n2. 關電源、等主軸完全停止（約 5–10 秒）\n3. 用毛刷清掉鐵屑（不可徒手撥）\n4. 鬆夾頭、取下鑽頭歸位\n5. 把夾頭鑰匙放回工具盒\n6. 工作檯擦乾淨', tip: '剛鑽完的金屬鑽頭很燙（200°C+），冷卻 1 分鐘再徒手摸。', warn: '主軸停止前不可伸手清理。', anim: 'finish' },
];

function renderAnim(type) {
  const anims = {
    ppe: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <ellipse cx="200" cy="200" rx="80" ry="8" fill="rgba(0,0,0,.1)"/>
      <circle cx="200" cy="100" r="50" fill="#fde68a"/>
      <rect x="160" y="85" width="80" height="20" rx="4" fill="rgba(100,200,255,.4)" stroke="#0891b2" stroke-width="2"/>
      <path d="M 165 115 Q 200 130 235 115 L 230 135 Q 200 142 170 135 Z" fill="#fff" stroke="#aaa"/>
      <g transform="translate(80,150)">
        <rect x="-20" y="0" width="40" height="50" rx="5" fill="#fff" stroke="#dc2626" stroke-width="2"/>
        <text x="0" y="32" text-anchor="middle" font-size="22" font-weight="900" fill="#dc2626">✗</text>
        <text x="0" y="68" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="700">禁戴手套</text>
      </g>
      <text x="200" y="210" text-anchor="middle" font-size="11" fill="#444">護目鏡、口罩、綁頭髮，禁戴手套</text>
    </svg>`,
    install: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g transform="translate(200,110)">
        <rect x="-30" y="-30" width="60" height="60" rx="3" fill="#9ca3af"/>
        <circle cx="-20" cy="-22" r="4" fill="#0f172a"/>
        <circle cx="20" cy="-22" r="4" fill="#0f172a"/>
        <circle cx="0" cy="22" r="4" fill="#0f172a"/>
        <polygon points="-22,30 22,30 12,55 -12,55" fill="#6b7280"/>
        <rect x="-3" y="55" width="6" height="40" fill="#6b7280"/>
        <polygon points="-3,95 3,95 0,105" fill="#374151"/>
        <!-- 鑰匙 -->
        <g transform="translate(45,-22) rotate(15)">
          <rect x="0" y="-2" width="30" height="4" fill="#fbbf24"/>
          <circle cx="32" cy="0" r="4" fill="#fbbf24"/>
        </g>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">三個齒輪孔各鎖一遍，平均施力</text>
    </svg>`,
    key: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <g transform="translate(200,110)">
        <rect x="-25" y="-30" width="50" height="50" rx="3" fill="#9ca3af"/>
        <circle cx="-15" cy="-22" r="3" fill="#0f172a"/>
        <!-- 鑰匙拔下、放到旁邊 -->
        <g transform="translate(80,-10)">
          <rect x="-15" y="-2" width="30" height="4" fill="#fbbf24"/>
          <circle cx="-18" cy="0" r="4" fill="#fbbf24"/>
        </g>
        <!-- 箭頭 -->
        <path d="M 35 -22 Q 55 -10 70 -10" stroke="#22c55e" stroke-width="2.5" fill="none"/>
        <polygon points="70,-10 64,-14 64,-6" fill="#22c55e"/>
        <text x="50" y="-30" text-anchor="middle" font-size="9" fill="#22c55e" font-weight="700">拔下歸位</text>
      </g>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444" font-weight="700" fill="#dc2626">⚠ 開機前必拔！</text>
    </svg>`,
    speed: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="100" y="60" width="200" height="120" rx="6" fill="#1e293b"/>
      <g transform="translate(150,120)"><circle r="22" fill="#9ca3af"/><circle r="6" fill="#0f172a"/></g>
      <g transform="translate(250,120)"><circle r="18" fill="#9ca3af"/><circle r="5" fill="#0f172a"/></g>
      <path d="M 172 100 L 232 100 M 172 140 L 232 140" stroke="#0f172a" stroke-width="4"/>
      <g font-size="9" font-family="Inter" font-weight="700">
        <text x="305" y="90" fill="#22c55e">2400 RPM (木)</text>
        <text x="305" y="110" fill="#22c55e">1700 RPM</text>
        <text x="305" y="130" fill="#22c55e">1100 RPM</text>
        <text x="305" y="150" fill="#22c55e">720 RPM</text>
        <text x="305" y="170" fill="#dc2626">500 RPM (鋼)</text>
      </g>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">皮帶位置決定主軸轉速</text>
    </svg>`,
    clamp: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="60" y="120" width="280" height="50" fill="#14532D"/>
      <rect x="60" y="118" width="280" height="6" fill="#22c55e"/>
      <rect x="130" y="100" width="140" height="22" fill="#a16207"/>
      <!-- 機台老虎鉗 -->
      <g>
        <rect x="100" y="100" width="30" height="40" fill="#475569"/>
        <rect x="270" y="100" width="30" height="40" fill="#475569"/>
        <circle cx="115" cy="120" r="6" fill="#0f172a"/>
        <circle cx="285" cy="120" r="6" fill="#0f172a"/>
      </g>
      <!-- 廢木板 -->
      <rect x="130" y="122" width="140" height="8" fill="#92400e" opacity=".7"/>
      <text x="200" y="200" text-anchor="middle" font-size="11" fill="#444">工件鎖入機台老虎鉗，下墊犧牲層</text>
    </svg>`,
    height: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="190" y="20" width="20" height="180" fill="#9ca3af"/>
      <rect x="120" y="80" width="160" height="20" fill="#14532D"/>
      <path d="M 280 90 L 300 90 L 295 75 M 280 90 L 300 90 L 295 105" stroke="#22c55e" stroke-width="2" fill="none"/>
      <text x="310" y="93" font-size="11" fill="#22c55e" font-weight="700">調高度</text>
      <rect x="170" y="50" width="60" height="20" fill="#6b7280"/>
      <polygon points="195,70 205,70 200,80" fill="#374151"/>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">鑽頭尖距工件約 5cm</text>
    </svg>`,
    drill: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="80" y="120" width="240" height="50" fill="#a16207"/>
      <ellipse cx="200" cy="140" rx="6" ry="3" fill="#000"/>
      <rect x="194" y="80" width="12" height="50" fill="#6b7280"/>
      <polygon points="194,130 206,130 200,140" fill="#374151"/>
      <line x1="200" y1="60" x2="200" y2="80" stroke="#22c55e" stroke-width="3" marker-end="url(#arrd)"/>
      <defs><marker id="arrd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/></marker></defs>
      <text x="200" y="50" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="700">穩定進刀</text>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">緩慢進刀、每 5mm 退屑</text>
    </svg>`,
    finish: `<svg viewBox="0 0 400 220" style="width:90%;max-width:380px">
      <rect x="80" y="120" width="240" height="50" fill="#a16207"/>
      <ellipse cx="200" cy="145" rx="8" ry="4" fill="#1e293b"/>
      <rect x="194" y="40" width="12" height="40" fill="#6b7280"/>
      <polygon points="194,80 206,80 200,90" fill="#374151"/>
      <path d="M 180 60 Q 200 50 220 60" stroke="#0891b2" stroke-width="2" fill="none"/>
      <text x="200" y="45" text-anchor="middle" font-size="10" fill="#0891b2" font-weight="700">退鑽</text>
      <text x="320" y="160" font-size="20" fill="#22c55e">✓</text>
      <text x="200" y="205" text-anchor="middle" font-size="11" fill="#444">退鑽 → 停機 → 清理 → 拔鑰匙歸位</text>
    </svg>`,
  };
  return anims[type] || '';
}

const PK = 'dpress_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const nextBtn = document.getElementById('next-btn');
const seenSteps = new Set((loadP().module3_seen) || []);
let current = 0;

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item' + (i === 0 ? ' active' : '') + (seenSteps.has(i) ? ' seen' : '');
  item.innerHTML = `<div class="step-num">${i + 1}</div><div class="step-info"><h5>${s.title}</h5></div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  current = i;
  const s = STEPS[i];
  document.querySelectorAll('.step-item').forEach((el, k) => el.classList.toggle('active', k === i));
  stepDetailEl.innerHTML = `
    <span class="step-step">STEP ${i + 1} / ${STEPS.length}</span>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>
    ${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}
    ${s.warn ? `<div class="step-warn"><strong>⚠ 注意：</strong>${s.warn}</div>` : ''}
    <div style="display:flex;gap:8px;margin-top:18px">
      ${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}
      ${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成全部步驟 ✓</span>'}
    </div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP();
    p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) {
      p.module3 = true;
      nextBtn.style.opacity = 1;
      nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 8 步驟全部完成！', 'good');
    }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;

if (typeof SequencePuzzle === 'function') {
  SequencePuzzle({
    mountId: 'seq-puzzle',
    items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })),
    onPass: () => {
      const p = loadP(); p.module3_puzzle = true; saveP(p);
      showToast('🧩 排序測驗通過！', 'good');
    }
  });
}

/* ── 夾頭鑰匙危機模擬器 ──────────────────────────────── */
;(function () {
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>🗝️ 夾頭鑰匙危機模擬器</h3>
    <p class="muted" style="margin-bottom:14px">鑽床第一守則：開機前必拔夾頭鑰匙。選擇你的操作——看看會發生什麼？</p>
    <div style="position:relative;max-width:540px;margin:0 auto">
      <canvas id="ck-canvas" width="520" height="300" style="width:100%;border-radius:12px;display:block;background:#1e293b"></canvas>
      <div id="ck-start-wrap" style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:14px">
        <p id="ck-label" style="font-size:14px;font-weight:700;color:#374151;text-align:center">裝好鑽頭後，準備開機...</p>
        <div id="ck-decision" style="display:none;gap:12px;flex-wrap:wrap;justify-content:center">
          <button id="ck-correct" style="padding:12px 20px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">✅ 先確認鑰匙已拔下，再開機</button>
          <button id="ck-wrong" style="padding:12px 20px;background:#dc2626;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">⚡ 直接開機</button>
        </div>
        <button id="ck-start" style="padding:12px 24px;background:var(--accent,#0891b2);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">🔑 檢查完畢，準備開機 →</button>
      </div>
      <div id="ck-result" style="margin-top:12px"></div>
    </div>
    <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px;color:#92400e">
      <strong>🔑 操作鐵則：</strong>夾頭鑰匙甩飛是鑽床最常見的傷害事故之一。養成「鎖完立刻拔」的肌肉記憶，鑰匙永遠放回工具盒，永遠不留在夾頭上。
    </div>`;

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);

  const cv = document.getElementById('ck-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // ─── State ──────────────────────────────
  let stage = 'idle'; // idle | decision | wrong_anim | correct_anim | done_wrong | done_correct
  let keyAngle = 0;     // key fly rotation
  let keyPos   = { x: 336, y: 150 }; // key current position
  let keyTrail = [];    // trail dots
  let spindleAngle = 0; // spindle rotation (correct)
  let flashAlpha   = 0; // red flash (wrong)
  let animId = null;

  const KEY_HOME = { x: 336, y: 150 }; // key in chuck
  const KEY_TOOLBOX = { x: 460, y: 258 }; // tool box
  let keyTarget = { ...KEY_HOME };

  // ─── Draw ────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, W, H);

    // ── Column (立柱) ──
    ctx.fillStyle = '#334155';
    ctx.fillRect(W - 60, 0, 30, H);

    // ── Machine head ──
    ctx.fillStyle = '#475569';
    rr(ctx, W - 180, 20, 150, 80, 8); ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(W - 155, 100, 100, 8); // base of head

    // ── Spindle ──
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(W - 120, 108, 20, 60 + (stage === 'idle' ? 0 : 10));

    // ── Chuck (夾頭) ──
    const chuckY = 168;
    ctx.fillStyle = '#6b7280';
    rr(ctx, W - 128, chuckY, 36, 28, 5); ctx.fill();
    // Chuck jaw lines
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(W - 125 + i * 12, chuckY + 4);
      ctx.lineTo(W - 125 + i * 12, chuckY + 22);
      ctx.stroke();
    }

    // ── Drill bit ──
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(W - 112, chuckY + 28, 4, 30);
    ctx.beginPath();
    ctx.moveTo(W - 112, chuckY + 58);
    ctx.lineTo(W - 108, chuckY + 58);
    ctx.lineTo(W - 110, chuckY + 68);
    ctx.closePath();
    ctx.fill();

    // ── Spindle rotation indicator (correct anim) ──
    if (stage === 'correct_anim' || stage === 'done_correct') {
      ctx.save();
      ctx.translate(W - 110, 138);
      ctx.rotate(spindleAngle);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const ang = (i / 4) * Math.PI * 2;
        ctx.lineTo(Math.cos(ang) * 14, Math.sin(ang) * 14);
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#22c55e';
      ctx.font = '700 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('RUNNING', W - 110, 165);
    }

    // ── Table ──
    ctx.fillStyle = '#14532d';
    ctx.fillRect(40, 240, W - 100, 22);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(40, 238, W - 100, 5);

    // ── Workpiece ──
    ctx.fillStyle = '#a16207';
    ctx.fillRect(220, 218, 140, 22);

    // ── Toolbox (工具盒) ──
    ctx.fillStyle = '#f97316';
    rr(ctx, 440, 248, 52, 32, 4); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('TOOL', 466, 261);
    ctx.fillText('BOX', 466, 272);

    // ── Chuck Key ──
    if (stage !== 'done_correct') {
      ctx.save();
      ctx.translate(keyPos.x, keyPos.y);
      ctx.rotate(keyAngle);

      // Key trail
      if (stage === 'wrong_anim') {
        keyTrail.forEach((t, i) => {
          ctx.globalAlpha = (i / keyTrail.length) * 0.6;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(t.x - keyPos.x, t.y - keyPos.y, 4, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // T-shape key body
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-3, -18, 6, 36);   // vertical shaft
      ctx.fillRect(-14, -20, 28, 6);  // horizontal bar
      // grip ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -24, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ── Red flash overlay (wrong) ──
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(220,38,38,${flashAlpha})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = '900 32px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('DANGER!', W / 2, H / 2);
    }

    // ── Labels ──
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Noto Sans TC, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('夾頭', W - 132, chuckY + 44);
    ctx.fillText('鑽頭', W - 132, chuckY + 72);

    if (stage === 'idle' || stage === 'decision') {
      // Key label indicator
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(keyPos.x - 20, keyPos.y);
      ctx.lineTo(keyPos.x - 60, keyPos.y - 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('夾頭鑰匙', keyPos.x - 62, keyPos.y - 16);
    }
  }

  // ─── Animation loop ──────────────────────
  function tick() {
    if (stage === 'wrong_anim') {
      keyTrail.push({ x: keyPos.x, y: keyPos.y });
      if (keyTrail.length > 20) keyTrail.shift();
      // fly in arc
      keyPos.x -= 4.5;
      keyPos.y -= 2 + keyPos.x * 0.002;
      keyAngle += 0.28;
      flashAlpha = Math.max(0, flashAlpha - 0.015);
      if (keyPos.x < -60) {
        stage = 'done_wrong';
        document.getElementById('ck-decision').style.display = 'none';
        document.getElementById('ck-result').innerHTML = `
          <div class="feedback error" style="margin-top:8px">
            <strong>💥 夾頭鑰匙以高速甩飛！</strong><br>
            鑽床主軸瞬間轉動，鑰匙被離心力甩出，成為高速飛射物。擊中眼部可造成失明，擊中頭部可造成嚴重外傷。<br>
            <strong>記住：裝完鑽頭、鎖緊後，第一件事就是把鑰匙拔下來放回工具盒！</strong>
          </div>`;
        document.getElementById('ck-start').style.display = 'inline-block';
        document.getElementById('ck-label').textContent = '再試一次？';
        cancelAnimationFrame(animId);
        draw();
        return;
      }
    } else if (stage === 'correct_anim') {
      // key slides to toolbox
      const dx = KEY_TOOLBOX.x - keyPos.x;
      const dy = KEY_TOOLBOX.y - keyPos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 5) {
        stage = 'done_correct';
        document.getElementById('ck-result').innerHTML = `
          <div class="feedback success" style="margin-top:8px">
            <strong>✅ 鑰匙已拔下歸位，安全開機！</strong><br>
            主軸開始旋轉，鑽頭平穩運作。沒有飛射物，操作安全。<br>
            記住這個習慣：<strong>鑽床鑰匙 → 鎖完立刻拔 → 放回工具盒</strong>。
          </div>`;
        const p = loadP(); p.module3_chuckkey = true; saveP(p);
        if (typeof showToast === 'function') showToast('🗝️ 夾頭鑰匙處置正確！', 'good');
        document.getElementById('ck-start').style.display = 'inline-block';
        document.getElementById('ck-label').textContent = '再試一次？';
        cancelAnimationFrame(animId);
        draw();
        return;
      }
      keyPos.x += dx / dist * 4;
      keyPos.y += dy / dist * 4;
      spindleAngle += 0.12;
    }
    draw();
    animId = requestAnimationFrame(tick);
  }

  // ─── Buttons ────────────────────────────
  document.getElementById('ck-start')?.addEventListener('click', () => {
    stage = 'decision';
    keyPos = { ...KEY_HOME };
    keyAngle = 0; keyTrail = []; flashAlpha = 0; spindleAngle = 0;
    document.getElementById('ck-start').style.display = 'none';
    document.getElementById('ck-decision').style.display = 'flex';
    document.getElementById('ck-result').innerHTML = '';
    document.getElementById('ck-label').textContent = '注意：夾頭鑰匙還插著！你的選擇是？';
    draw();
  });

  document.getElementById('ck-wrong')?.addEventListener('click', () => {
    stage = 'wrong_anim';
    flashAlpha = 0.6;
    document.getElementById('ck-decision').style.display = 'none';
    document.getElementById('ck-label').textContent = '⚡ 直接開機...';
    if (typeof SoundFX !== 'undefined') SoundFX.error?.() ?? null;
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(tick);
  });

  document.getElementById('ck-correct')?.addEventListener('click', () => {
    stage = 'correct_anim';
    document.getElementById('ck-decision').style.display = 'none';
    document.getElementById('ck-label').textContent = '✅ 拔下鑰匙，放回工具盒...';
    if (typeof SoundFX !== 'undefined') SoundFX.success?.() ?? null;
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(tick);
  });

  draw();
})();

/* ── 進刀深度限位環設定練習 ───────────────────────────── */
;(function () {
  const PROBLEMS = [
    {
      q: '木板厚度 18mm，需要<strong>鑽穿</strong>（通孔），深度限位環應設在幾 mm？',
      correct: 20, range: [19, 22],
      explain: '鑽穿孔要在材料厚度（18mm）加上 2–4mm 餘量，確保鑽頭完全穿透、孔邊整潔，並讓鑽尖進入犧牲層。正確答案：<strong>20mm（18+2）</strong>。',
      hint: '穿透孔 = 材料厚度 + 2–4mm 餘量',
    },
    {
      q: '木板厚度 20mm，需要鑽一個 12mm 深的<strong>盲孔</strong>（鉸鏈座，不鑽穿），深度應設在？',
      correct: 12, range: [11, 13],
      explain: '盲孔的深度就是想要的孔深——不加餘量，否則會鑽穿。12mm 盲孔就直接設 12mm。Forstner 平底鑽加上精確的限位環是這類加工的標準做法。',
      hint: '盲孔 = 目標深度（不加餘量，否則鑽穿）',
    },
    {
      q: '鋼板厚度 6mm，需要<strong>鑽穿</strong>（通孔），深度限位環應設在幾 mm？',
      correct: 8, range: [7, 10],
      explain: '金屬穿透孔同樣需要餘量，確保鑽尖完全穿出。6mm 鋼板建議設 8mm（6+2）。若工作台下已墊犧牲層，餘量不影響台面。',
      hint: '鋼板穿透孔 = 板厚 + 2–4mm',
    },
  ];

  let currentProb = 0;
  let answered = [false, false, false];
  let userDepth = [null, null, null];

  const MAX_DEPTH = 30;
  const SVG_H = 220;
  const RULER_X = 80, RULER_W = 40, RULER_TOP = 20, RULER_BOT = SVG_H - 20;
  const RULER_LEN = RULER_BOT - RULER_TOP;

  function depthToY(d) { return RULER_TOP + (d / MAX_DEPTH) * RULER_LEN; }

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3>📏 進刀深度限位環設定練習</h3>
    <p class="muted" style="margin-bottom:14px">鑽床的深度限位環能精確控制孔深，是鑽床最重要的優勢之一。點選刻度尺設定深度，再按「確認」。</p>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap" id="ds-tabs">
      ${PROBLEMS.map((p, i) => `<button data-idx="${i}" style="padding:8px 16px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;background:${i===0?'var(--accent,#0891b2)':'#fff'};color:${i===0?'#fff':'#374151'};font-weight:700;font-size:13px;transition:all .2s">題目 ${i+1}</button>`).join('')}
    </div>
    <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:1;min-width:240px">
        <div id="ds-question" style="background:#f1f5f9;border-radius:10px;padding:14px;font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px"></div>
        <div id="ds-hint" style="background:#eff6ff;border-left:3px solid #3b82f6;border-radius:6px;padding:8px 12px;font-size:12px;color:#1e40af;margin-bottom:12px"></div>
        <p style="font-size:13px;color:#374151;font-weight:700;margin-bottom:6px">目前設定深度：<span id="ds-cur-val" style="font-size:22px;font-family:Inter;color:var(--accent,#0891b2);font-weight:900">—</span> mm</p>
        <button id="ds-confirm" style="padding:10px 24px;background:var(--accent,#0891b2);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;opacity:.4;pointer-events:none">確認設定 →</button>
        <div id="ds-feedback" style="margin-top:10px"></div>
      </div>
      <div style="width:180px;flex-shrink:0">
        <p style="font-size:12px;font-weight:700;color:#374151;margin:0 0 6px;text-align:center">點選刻度設定深度</p>
        <svg id="ds-svg" viewBox="0 0 160 ${SVG_H}" style="width:100%;cursor:pointer;border-radius:8px;background:#f8fafc;display:block" role="img" aria-label="深度刻度尺"></svg>
      </div>
    </div>`;

  if (nav) nav.parentNode.insertBefore(sec, nav);

  function buildSVG(selDepth) {
    const svg = document.getElementById('ds-svg');
    if (!svg) return;
    let content = `
      <!-- Ruler background -->
      <rect x="${RULER_X}" y="${RULER_TOP}" width="${RULER_W}" height="${RULER_LEN}" rx="3" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Ruler ticks and labels -->`;
    for (let d = 0; d <= MAX_DEPTH; d += 2) {
      const y = depthToY(d);
      const major = d % 5 === 0;
      content += `<line x1="${RULER_X - (major ? 10 : 5)}" y1="${y}" x2="${RULER_X}" y2="${y}" stroke="#64748b" stroke-width="${major ? 1.5 : 1}"/>`;
      if (major) content += `<text x="${RULER_X - 14}" y="${y + 4}" text-anchor="end" font-size="10" fill="#374151" font-family="Inter,monospace">${d}</text>`;
      // clickable hot zone
      content += `<rect x="${RULER_X}" y="${y - 4}" width="${RULER_W}" height="8" fill="transparent" data-d="${d}" class="ds-tick" style="cursor:pointer"/>`;
    }
    content += `<text x="${RULER_X + RULER_W / 2}" y="${RULER_BOT + 14}" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="Inter">mm</text>`;
    // Selected marker
    if (selDepth !== null) {
      const sy = depthToY(selDepth);
      content += `
        <rect x="${RULER_X}" y="${RULER_TOP}" width="${RULER_W}" height="${sy - RULER_TOP}" rx="2" fill="rgba(8,145,178,.18)"/>
        <rect x="${RULER_X - 6}" y="${sy - 6}" width="${RULER_W + 12}" height="12" rx="4" fill="#f97316"/>
        <text x="${RULER_X + RULER_W / 2}" y="${sy + 4}" text-anchor="middle" font-size="10" fill="#fff" font-weight="700" font-family="Inter">${selDepth}mm</text>`;
    }
    svg.innerHTML = content;
    // Re-attach click events
    svg.querySelectorAll('.ds-tick').forEach(el => {
      el.addEventListener('click', () => {
        const d = parseInt(el.dataset.d);
        userDepth[currentProb] = d;
        document.getElementById('ds-cur-val').textContent = d;
        const btn = document.getElementById('ds-confirm');
        if (btn && !answered[currentProb]) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
        buildSVG(d);
      });
    });
  }

  function showProblem(idx) {
    currentProb = idx;
    const p = PROBLEMS[idx];
    document.querySelectorAll('#ds-tabs [data-idx]').forEach(b => {
      b.style.background = parseInt(b.dataset.idx) === idx ? 'var(--accent,#0891b2)' : '#fff';
      b.style.color = parseInt(b.dataset.idx) === idx ? '#fff' : '#374151';
    });
    document.getElementById('ds-question').innerHTML = `<strong>題目 ${idx + 1}：</strong>${p.q}`;
    document.getElementById('ds-hint').innerHTML = `💡 提示：${p.hint}`;
    document.getElementById('ds-cur-val').textContent = userDepth[idx] !== null ? userDepth[idx] : '—';
    const fb = document.getElementById('ds-feedback');
    if (answered[idx]) {
      const ud = userDepth[idx];
      const ok = ud >= p.range[0] && ud <= p.range[1];
      fb.innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✓' : '✗'} 你設定了 ${ud}mm。${p.explain}</div>`;
      const btn = document.getElementById('ds-confirm');
      if (btn) { btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
    } else {
      fb.innerHTML = '';
      const btn = document.getElementById('ds-confirm');
      if (btn) {
        const hasVal = userDepth[idx] !== null;
        btn.style.opacity = hasVal ? '1' : '.4';
        btn.style.pointerEvents = hasVal ? 'auto' : 'none';
      }
    }
    buildSVG(userDepth[idx]);
  }

  document.querySelectorAll('#ds-tabs [data-idx]').forEach(btn => {
    btn.addEventListener('click', () => showProblem(parseInt(btn.dataset.idx)));
  });

  document.getElementById('ds-confirm')?.addEventListener('click', () => {
    if (answered[currentProb]) return;
    const ud = userDepth[currentProb];
    if (ud === null) return;
    answered[currentProb] = true;
    const p = PROBLEMS[currentProb];
    const ok = ud >= p.range[0] && ud <= p.range[1];
    if (typeof SoundFX !== 'undefined') (ok ? SoundFX.success?.() : SoundFX.error?.());
    const fb = document.getElementById('ds-feedback');
    fb.innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✓ 正確！' : '✗ 不對。'} 你設定了 ${ud}mm。${p.explain}</div>`;
    const btn = document.getElementById('ds-confirm');
    if (btn) { btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
    buildSVG(ud);
    if (answered.every(Boolean)) {
      const p2 = loadP(); p2.module3_depthstop = true; saveP(p2);
      if (typeof showToast === 'function') showToast('📏 深度設定練習完成！', 'good');
    }
  });

  showProblem(0);
})();
