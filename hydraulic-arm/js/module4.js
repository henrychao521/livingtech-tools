// 液壓手臂 模組 4：多軸操控模擬（2026-10 重寫）
// 物理全部在 ha-model.js：推主動針筒 → 水被擠過水管 → 從動針筒伸出 → 三角形連桿讓關節轉動。
// 這支只負責畫面與操作。
const PK = 'ha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { try { localStorage.setItem(PK, JSON.stringify(p)); } catch {} }
const $ = id => document.getElementById(id);
const H = window.HAModel;
const D = H.DEG;
const cv = $('ha-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, HH = cv.height;

const AXIS_UI = [
  { icon: '🔄', color: '#f87171', short: '基座', read: v => `轉向 ${v >= 0 ? '左' : '右'} ${Math.abs(v).toFixed(0)}°` },
  { icon: '⬆', color: '#fb923c', short: '大臂', read: v => `仰角 ${v.toFixed(0)}°` },
  { icon: '↪', color: '#38bdf8', short: '小臂', read: v => `下彎 ${v.toFixed(0)}°` },
  { icon: '🦞', color: '#4ade80', short: '夾爪', read: (v, p) => `張開 ${Math.max(0, p.gap).toFixed(0)} mm` },
];

// 任務：瓶子（直徑 30、高 60）在右前方，目標區在左前方，兩者離底座軸心都是 230 mm
const BOTTLE = { d: 30, h: 60 };
const START = { yaw: -35, r: 230 };
const TARGET = { yaw: 35, r: 230, tol: 18 };
let bottle, held, arm, done = false, openAround = false;

function rebuild() {
  const ml = parseInt($('sel-master').value, 10);
  const air = $('chk-air').checked ? 1500 : 0; // 1.5 ml 空氣
  arm = H.createArm({ masterMl: ml, air });
  // 起始姿勢：基座朝正前方、大臂 30°、小臂下彎 95°、夾爪全開
  const init = [H.extForAngle(0, 0), H.extForAngle(1, 30), H.extForAngle(2, 95), 0];
  init.forEach((xs, i) => arm.place(i, xs));
  bottle = { yaw: START.yaw, r: START.r, z: 0 };
  held = false; openAround = false;
  arm.setGripStop(null);
  syncSliders();
  updateCtlText();
}

// ---------- 控制台 ----------
function buildControls() {
  const box = $('axis-controls');
  box.innerHTML = H.JOINTS.map((j, i) => `
    <div class="ax-row" style="border-left:5px solid ${AXIS_UI[i].color}">
      <div class="ax-head"><b>${AXIS_UI[i].icon} 第 ${i + 1} 對：${j.name}</b><span class="v" id="rd${i}"></span></div>
      <svg class="ax-pair" id="pair${i}" viewBox="0 0 300 46" aria-hidden="true"></svg>
      <div class="ax-slider"><span>拉</span><input type="range" id="s${i}" min="0" step="0.1" aria-label="第 ${i + 1} 對主動針筒推入量"><span>推</span></div>
      <div class="ax-note" id="nt${i}">${j.dir}</div>
    </div>`).join('');
  H.JOINTS.forEach((j, i) => {
    $('s' + i).addEventListener('input', e => {
      const want = parseFloat(e.target.value);
      const r = arm.setPush(i, want);
      if (r.limited) e.target.value = r.push.toFixed(1);
      const masterEnd = !r.limited && r.push >= arm.master.stroke - 0.05 && arm.fill < arm.slave.area * arm.slave.stroke - 1;
      $('nt' + i).className = 'ax-note' + (r.limited || masterEnd ? ' warn' : '');
      $('nt' + i).textContent = r.limited ? limitText(i, want > r.push) : masterEnd ? limitText(i, true) : j.dir;
      updateCtlText();
    });
  });
}
function limitText(i, pushing) {
  const ax = arm.axes[i];
  if (pushing) {
    if (i === 3 && (held || openAround)) return '爪碰到瓶身、夾住了：水推不進從動針筒，所以主動針筒推不動';
    if (i === 3 && ax.xsMax < arm.slave.stroke - 0.01) return '兩片爪尖已經碰在一起，推不動了';
    if (arm.fill < arm.slave.area * arm.slave.stroke - 1 && ax.push >= arm.master.stroke - 0.06)
      return `主動針筒（${arm.masterMl} ml）已推到底，水量只夠從動針筒走一部分行程`;
    return '從動針筒已伸到行程上限：水不可壓縮，主動端推不動';
  }
  return '從動針筒已縮到底（主動端拉到這裡就拉不回來了）';
}
function syncSliders() {
  H.JOINTS.forEach((j, i) => {
    const s = $('s' + i);
    s.max = arm.master.stroke.toFixed(1);
    s.min = arm.p0.toFixed(1);
    s.value = arm.axes[i].push.toFixed(1);
    $('nt' + i).className = 'ax-note';
    $('nt' + i).textContent = j.dir;
  });
  $('spec-note').textContent = specText();
}
function specText() {
  const M = arm.master, S = arm.slave;
  const ratio = S.area / M.area;
  return `主動 ${M.ml} ml（內徑約 ${M.id} mm）→ 從動 ${S.ml} ml（內徑約 ${S.id} mm）：主動端推 1 mm，從動端伸出 ${(1 / ratio).toFixed(2)} mm` +
    (M.area * M.stroke < S.area * S.stroke - 1 ? `；主動針筒的水只夠從動端走 ${(M.area * M.stroke / S.area).toFixed(0)} / ${S.stroke.toFixed(0)} mm，有些動作做不到（例如基座轉不到左邊的目標）——主動針筒容量要不小於從動針筒` : '') +
    (arm.air ? '；管內有 1.5 ml 空氣（簡化：只模擬換方向時的空推，沒有模擬受力時的回彈）' : '');
}
function updateCtlText() {
  const p = arm.pose();
  const vals = [p.yaw, p.shoulder, p.bend, p.alpha];
  H.JOINTS.forEach((j, i) => {
    const ax = arm.axes[i];
    $('rd' + i).textContent = AXIS_UI[i].read(vals[i], p);
    drawPair(i, ax);
  });
}
// 一對針筒的小圖：左＝主動（在手上）、右＝從動（在手臂上），藍色＝水、白泡泡＝空氣
function drawPair(i, ax) {
  const M = arm.master, S = arm.slave;
  const mLen = 110 * M.stroke / 70, sLen = 110 * S.stroke / 70;
  const mH = 8 + M.id * 0.9, sH = 8 + S.id * 0.9;
  const mx0 = 6, sx1 = 294;
  const waterM = (M.stroke - ax.push) / M.stroke;          // 主動針筒裡剩下的水
  const waterS = ax.xs / S.stroke;                          // 從動針筒裡的水
  const mPlunger = mx0 + mLen * (1 - waterM);
  const sPlunger = sx1 - sLen * (1 - waterS);
  const y = 23, c = AXIS_UI[i].color;
  const airW = arm.air ? Math.max(4, 10 + ax.vAir / 120) : 0;
  $('pair' + i).innerHTML = `
    <rect x="${mx0}" y="${y - mH / 2}" width="${mLen}" height="${mH}" rx="3" fill="#f8fafc" stroke="#475569"/>
    <rect x="${mPlunger}" y="${y - mH / 2 + 2}" width="${mx0 + mLen - mPlunger}" height="${mH - 4}" fill="#60a5fa"/>
    <rect x="${mPlunger - 4}" y="${y - mH / 2 + 1}" width="4" height="${mH - 2}" fill="#334155"/>
    <line x1="${mx0}" y1="${y}" x2="${mPlunger - 4}" y2="${y}" stroke="#334155" stroke-width="2.5"/>
    <path d="M${mx0 + mLen} ${y} C ${mx0 + mLen + 30} ${y + 18}, ${sx1 - sLen - 30} ${y + 18}, ${sx1 - sLen} ${y}" fill="none" stroke="#60a5fa" stroke-width="4"/>
    ${airW ? `<circle cx="150" cy="${y + 13}" r="${Math.min(9, airW / 2)}" fill="#fff" stroke="#94a3b8"/>` : ''}
    <rect x="${sx1 - sLen}" y="${y - sH / 2}" width="${sLen}" height="${sH}" rx="3" fill="#f8fafc" stroke="${c}" stroke-width="1.5"/>
    <rect x="${sx1 - sLen}" y="${y - sH / 2 + 2}" width="${sPlunger - (sx1 - sLen)}" height="${sH - 4}" fill="#60a5fa"/>
    <rect x="${sPlunger}" y="${y - sH / 2 + 1}" width="4" height="${sH - 2}" fill="#334155"/>
    <line x1="${sPlunger + 4}" y1="${y}" x2="${sx1}" y2="${y}" stroke="#334155" stroke-width="2.5"/>
    <text x="${mx0}" y="9" font-size="9" fill="#64748b">主動（手上）</text>
    <text x="${sx1}" y="9" font-size="9" fill="#64748b" text-anchor="end">從動（手臂上）</text>`;
}

// ---------- 抓取判斷 ----------
// 夾爪要朝下（小臂與水平夾角 ≥ 45°），兩爪中間的抓取點要落在瓶身裡
function gripInfo(p) {
  const u = { r: Math.cos(p.foreAbs * D), z: Math.sin(p.foreAbs * D) };
  const G = { r: p.W.r + 38 * u.r, z: p.W.z + 38 * u.z };
  const width = BOTTLE.d / Math.max(0.2, Math.abs(u.z)); // 兩爪合起方向上的瓶身寬
  return { G, u, width, downward: p.foreAbs <= -45 };
}
function bottleLateral(p) { return (bottle.r) * Math.sin((p.yaw - bottle.yaw) * D); }

function physics() {
  const p = arm.pose();
  const gi = gripInfo(p);
  if (!held) {
    const lat = bottleLateral(p);
    const inside = Math.abs(lat) <= 8 && Math.abs(gi.G.r - bottle.r * Math.cos((p.yaw - bottle.yaw) * D)) <= 8 &&
      gi.G.z >= bottle.z + 12 && gi.G.z <= bottle.z + BOTTLE.h - 6 && gi.downward;
    const aContact = H.alphaForGap(Math.min(gi.width, 2 * (H.JAW.halfGap + H.JAW.len) - 1));
    if (inside && openAround && p.gap <= gi.width + 1.5) {
      held = true;                       // 爪已經碰到瓶身（上限就停在接觸點）
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
    } else if (inside && p.gap > gi.width + 1.5) {
      // 夾爪張開罩住瓶身：上限設在「爪碰到瓶子」的位置，再推就會剛好夾住、然後推不動
      openAround = true;
      arm.setGripStop(H.extForAngle(3, aContact));
    } else if (!inside) {
      openAround = false;
      arm.setGripStop(null);
    }
  } else {
    if (p.gap > gi.width + 3) { held = false; openAround = false; arm.setGripStop(null); }
    else { bottle.yaw = p.yaw; bottle.r = gi.G.r; bottle.z = Math.max(0, gi.G.z - BOTTLE.h / 2); }
  }
  if (!held && bottle.z > 0) bottle.z = Math.max(0, bottle.z - 8); // 放開就掉回桌面
  return { p, gi };
}

// ---------- 繪圖 ----------
const SV = { x0: 120, y0: 455, s: 1.0 };          // 側視：r=0 在 x0、桌面 z=0 在 y0
const sx = r => SV.x0 + r * SV.s, sy = z => SV.y0 - z * SV.s;
const TV = { cx: 590, cy: 175, s: 0.42 };         // 俯視小圖
const tx = (yaw, r) => TV.cx - r * Math.sin(yaw * D) * TV.s;
const ty = (yaw, r) => TV.cy - r * Math.cos(yaw * D) * TV.s;

function seg(a, b, w, color, cap = 'round') {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = cap;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}
function pin(x, y, r = 6) { ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 7); ctx.fill(); }
// 從動針筒：筒身（粗、半透明、裡面有水）＋推桿（細）
function cylinder(P, Q, j, xs, color) {
  const L = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const ux = (Q[0] - P[0]) / L, uy = (Q[1] - P[1]) / L;
  const barrel = (j.L0 - 8) * SV.s;
  const B = [P[0] + ux * barrel, P[1] + uy * barrel];
  seg(P, B, 13, 'rgba(226,232,240,.35)', 'butt');
  const water = Math.max(0, Math.min(barrel, 6 + xs / arm.slave.stroke * (barrel - 8)));
  seg([P[0] + ux * 2, P[1] + uy * 2], [P[0] + ux * water, P[1] + uy * water], 8, 'rgba(96,165,250,.9)', 'butt');
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(P[0] - uy * 6.5, P[1] + ux * 6.5); ctx.lineTo(B[0] - uy * 6.5, B[1] + ux * 6.5);
  ctx.moveTo(P[0] + uy * 6.5, P[1] - ux * 6.5); ctx.lineTo(B[0] + uy * 6.5, B[1] - ux * 6.5); ctx.stroke();
  const pl = [P[0] + ux * water, P[1] + uy * water];
  seg(pl, Q, 3, '#e2e8f0');
  pin(P[0], P[1], 4); pin(Q[0], Q[1], 4);
}
function rot(v, a) { const c = Math.cos(a * D), s = Math.sin(a * D); return { r: v.r * c - v.z * s, z: v.r * s + v.z * c }; }
function addv(A, v, k) { return { r: A.r + v.r * k, z: A.z + v.z * k }; }
const P2 = A => [sx(A.r), sy(A.z)];

function draw() {
  const { p, gi } = physics();
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, HH);
  // 桌面
  ctx.fillStyle = '#3f2a14'; ctx.fillRect(0, SV.y0, W, HH - SV.y0);
  ctx.fillStyle = '#94a3b8'; ctx.font = '700 20px "Noto Sans TC", sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('側視（沿手臂方向看）', 14, 30);

  // 目標區、瓶子（側視只畫在手臂正前方 ±4° 內的東西；其他畫淡）
  const dT = p.yaw - TARGET.yaw, dB = p.yaw - bottle.yaw;
  ctx.globalAlpha = Math.abs(dT) <= 4 ? 1 : 0.25;
  ctx.fillStyle = 'rgba(34,197,94,.35)'; ctx.fillRect(sx(TARGET.r - TARGET.tol), SV.y0 - 5, 2 * TARGET.tol * SV.s, 5);
  ctx.fillStyle = '#4ade80'; ctx.textAlign = 'center'; ctx.font = '700 18px "Noto Sans TC", sans-serif';
  ctx.fillText('目標', sx(TARGET.r), SV.y0 + 24);
  ctx.globalAlpha = Math.abs(dB) <= 4 || held ? 1 : 0.25;
  const br = held ? bottle.r : bottle.r * Math.cos(dB * D);
  ctx.fillStyle = '#84cc16'; ctx.fillRect(sx(br - BOTTLE.d / 2), sy(bottle.z + BOTTLE.h), BOTTLE.d * SV.s, BOTTLE.h * SV.s);
  ctx.fillStyle = '#16a34a'; ctx.fillRect(sx(br - 7), sy(bottle.z + BOTTLE.h + 8), 14 * SV.s, 8 * SV.s);
  ctx.globalAlpha = 1;

  // 底座立柱＋轉盤
  ctx.fillStyle = '#075985'; ctx.fillRect(sx(-40), sy(14), 80 * SV.s, 14 * SV.s);
  ctx.fillStyle = '#0369a1'; ctx.fillRect(sx(-14), sy(H.ARM.shoulderH), 28 * SV.s, (H.ARM.shoulderH - 14) * SV.s);

  const S = p.S, E = p.E, Wr = p.W;
  const uA = { r: Math.cos(p.shoulder * D), z: Math.sin(p.shoulder * D) };
  const uF = { r: Math.cos(p.foreAbs * D), z: Math.sin(p.foreAbs * D) };
  // 大臂、小臂（紙板條）
  seg(P2(S), P2(E), 16, '#d6b98c'); seg(P2(E), P2(Wr), 14, '#c9a46b');
  // 夾爪：兩片爪對稱張開 α
  const n = { r: -uF.z, z: uF.r };
  [1, -1].forEach(sg => {
    const hinge = addv(Wr, n, sg * H.JAW.halfGap);
    const dir = rot(uF, sg * p.alpha);
    seg(P2(hinge), P2(addv(hinge, dir, H.JAW.len)), 6, '#a3e635');
  });
  // 從動針筒（三角形連桿）
  const xs = arm.axes.map(a => a.xs);
  // 肩：前一節銷釘在肩關節正下方 75 mm，後一節在大臂上 95 mm
  cylinder(P2({ r: S.r, z: S.z - H.JOINTS[1].a }), P2(addv(S, uA, H.JOINTS[1].b)), H.JOINTS[1], xs[1], AXIS_UI[1].color);
  // 肘：前一節在大臂上離肘 80 mm，後一節在小臂上 60 mm
  cylinder(P2(addv(E, uA, -H.JOINTS[2].a)), P2(addv(E, uF, H.JOINTS[2].b)), H.JOINTS[2], xs[2], AXIS_UI[2].color);
  // 夾爪：前一節在小臂上離鉸鏈 70 mm，後一節是上爪的槓桿（40 mm，與爪一體）
  const phiG = H.phiFromLength(H.JOINTS[3], H.JOINTS[3].L0 + xs[3]);
  const lever = rot({ r: -uF.r, z: -uF.z }, -phiG);
  cylinder(P2(addv(Wr, uF, -H.JOINTS[3].a)), P2(addv(addv(Wr, n, H.JAW.halfGap), lever, H.JOINTS[3].b)), H.JOINTS[3], xs[3], AXIS_UI[3].color);
  pin(...P2(S), 8); pin(...P2(E), 7); pin(...P2(Wr), 5);

  // 撞桌面警告
  const tipZ = Math.min(addv(addv(Wr, n, H.JAW.halfGap), rot(uF, p.alpha), H.JAW.len).z,
    addv(addv(Wr, n, -H.JAW.halfGap), rot(uF, -p.alpha), H.JAW.len).z);
  if (tipZ < 0) { ctx.fillStyle = '#f87171'; ctx.textAlign = 'left'; ctx.font = '700 20px "Noto Sans TC", sans-serif'; ctx.fillText('⚠ 夾爪撞到桌面了', 14, 60); }

  drawTop(p);
  verdict(p, gi);
}

function drawTop(p) {
  ctx.save();
  ctx.fillStyle = 'rgba(15,23,42,.85)'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(TV.cx - 125, 8, 250, 230, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.font = '700 18px "Noto Sans TC", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('俯視（看基座轉向）', TV.cx, 32);
  // 可轉範圍扇形
  const yMin = H.jointAngle(0, 0), yMax = H.jointAngle(0, arm.slave.stroke);
  ctx.fillStyle = 'rgba(148,163,184,.12)'; ctx.beginPath(); ctx.moveTo(TV.cx, TV.cy);
  for (let a = yMin; a <= yMax + 0.1; a += 2) ctx.lineTo(tx(a, 260), ty(a, 260));
  ctx.closePath(); ctx.fill();
  // 目標、瓶子
  ctx.fillStyle = 'rgba(34,197,94,.45)'; ctx.beginPath(); ctx.arc(tx(TARGET.yaw, TARGET.r), ty(TARGET.yaw, TARGET.r), TARGET.tol * TV.s + 3, 0, 7); ctx.fill();
  ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(tx(bottle.yaw, bottle.r), ty(bottle.yaw, bottle.r), BOTTLE.d / 2 * TV.s + 2, 0, 7); ctx.fill();
  // 轉盤＋槓桿＋從動針筒（P 固定在底板，Q 在轉盤槓桿上）
  const j = H.JOINTS[0];
  const phi = H.phiFromLength(j, j.L0 + arm.axes[0].xs);
  const Pang = -170, leverAng = Pang + phi;           // 角度：從正前方逆時針量
  const Pp = [tx(Pang, j.a), ty(Pang, j.a)], Qp = [tx(leverAng, j.b), ty(leverAng, j.b)];
  ctx.fillStyle = '#075985'; ctx.beginPath(); ctx.arc(TV.cx, TV.cy, 46 * TV.s, 0, 7); ctx.fill();
  seg([TV.cx, TV.cy], Qp, 5, '#0ea5e9');
  ctx.strokeStyle = AXIS_UI[0].color; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(...Pp); ctx.lineTo(...Qp); ctx.stroke();
  pin(...Pp, 4); pin(...Qp, 4);
  // 手臂方向（長度＝夾爪中心的水平距離）
  const r = Math.max(30, gripInfo(p).G.r);
  seg([TV.cx, TV.cy], [tx(p.yaw, r), ty(p.yaw, r)], 6, '#d6b98c');
  pin(TV.cx, TV.cy, 5);
  ctx.fillStyle = '#cbd5e1'; ctx.font = '600 15px "Noto Sans TC", sans-serif';
  ctx.fillText('瓶子', tx(bottle.yaw, bottle.r) + 4, ty(bottle.yaw, bottle.r) - 14);
  ctx.fillText('目標', tx(TARGET.yaw, TARGET.r), ty(TARGET.yaw, TARGET.r) - 14);
  ctx.restore();
}

const nextBtn = $('next-btn');
function unlockNext(silent) {
  if (nextBtn.style.pointerEvents === 'auto') return;
  nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
  if (!silent && typeof SoundFX !== 'undefined') SoundFX.unlock();
}
if (loadP().module4_target) unlockNext(true);

let lastMsg = '';
function verdict(p, gi) {
  let cls = 'warn', msg;
  const onTarget = !held && bottle.z === 0 && Math.abs(bottle.yaw - TARGET.yaw) <= 4 && Math.abs(bottle.r - TARGET.r) <= TARGET.tol;
  if (onTarget) {
    cls = 'good'; msg = '🏆 成功！瓶子放在目標區了。';
    if (!done) { done = true; const s = loadP(); s.module4 = true; s.module4_target = true; saveP(s); unlockNext(); }
  } else if (held) { cls = 'good'; msg = '✓ 夾住了！先用第 2、3 對把瓶子抬高，再轉基座到目標上方放下。'; }
  else if (Math.abs(p.yaw - bottle.yaw) > 4) msg = `先用第 1 對把基座轉到瓶子方向（還差 ${(p.yaw - bottle.yaw).toFixed(0)}°）`;
  else if (!gi.downward) msg = '夾爪要朝下才夾得住：把小臂往下彎（第 3 對拉回）';
  else msg = '用第 2、3 對讓夾爪中心對準瓶身，再推第 4 對合起夾爪';
  if (msg !== lastMsg) { $('verdict').className = 'verdict ' + cls; $('verdict').textContent = msg; lastMsg = msg; }
}

function loop() {
  if (document.hidden) { window.__rafPaused = true; return; }
  draw();
  requestAnimationFrame(loop);
}

buildControls();
rebuild();
$('sel-master').addEventListener('change', () => { rebuild(); lastMsg = ''; });
$('chk-air').addEventListener('change', () => { rebuild(); lastMsg = ''; });
$('btn-reset').addEventListener('click', () => { rebuild(); done = false; lastMsg = ''; });
loop();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; loop(); }
});
