// 跨領域 STEAM 模組 4：薄透鏡成像
// 依薄透鏡公式 1/f = 1/do + 1/di 與放大率 m = -di/do（凸透鏡，f > 0）。
// di > 0：實像（在透鏡另一側，倒立）；di < 0：虛像（與物同側，正立放大）。

const PK = 'steam_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const PRESETS = [
  { id: 'mag',  ico: '🔎', name: '放大鏡', dobj: 6,  f: 10, h: 6, meta: '物體在焦點內 → 正立放大虛像' },
  { id: 'cam',  ico: '📷', name: '相機', dobj: 60, f: 10, h: 8, meta: '物體很遠 → 縮小倒立實像' },
  { id: 'proj', ico: '📽️', name: '投影機', dobj: 12, f: 10, h: 4, meta: '物體略在焦點外 → 放大倒立實像' },
  { id: 'eq',   ico: '⚖️', name: '等大成像', dobj: 20, f: 10, h: 6, meta: 'do = 2f → 等大倒立實像' },
];

const state = { dobj: 30, f: 10, h: 6 };
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');

function solve() {
  const { dobj, f, h } = state;
  const denom = (1 / f) - (1 / dobj);
  if (Math.abs(denom) < 1e-9) return { di: Infinity, m: Infinity, type: '無法成像', real: false };
  const di = 1 / denom;
  const m = -di / dobj;
  const real = di > 0;
  let type;
  if (!isFinite(di)) type = '無法成像（平行光）';
  else if (real) type = Math.abs(m) > 1.02 ? '倒立放大實像' : (Math.abs(m) < 0.98 ? '倒立縮小實像' : '倒立等大實像');
  else type = '正立放大虛像';
  return { di, m, type, real };
}

function draw(r) {
  const W = cv.width, H = cv.height, ax = H / 2, lensX = W * 0.46;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  // 以「畫面可容納」為原則決定比例尺
  const span = Math.max(state.dobj, Math.abs(isFinite(r.di) ? r.di : 0), state.f * 2) * 1.15;
  const S = Math.min(lensX / Math.max(span, 1), (W - lensX) / Math.max(span, 1));
  const HS = Math.min(6, (H / 2 - 30) / Math.max(state.h, Math.abs(state.h * (isFinite(r.m) ? r.m : 1)), 1));

  // 主軸
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, ax); ctx.lineTo(W, ax); ctx.stroke();

  // 透鏡
  ctx.fillStyle = 'rgba(56,189,248,.35)'; ctx.strokeStyle = '#0EA5E9'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(lensX, ax, 15, H / 2 - 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // 焦點
  ctx.fillStyle = '#22c55e';
  [-1, 1].forEach(s => {
    const fx = lensX + s * state.f * S;
    ctx.beginPath(); ctx.arc(fx, ax, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(s > 0 ? 'F' : 'F', fx, ax + 18);
  });

  // 物體
  const ox = lensX - state.dobj * S, oh = state.h * HS;
  ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ox, ax); ctx.lineTo(ox, ax - oh); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox, ax - oh); ctx.lineTo(ox - 5, ax - oh + 9); ctx.lineTo(ox + 5, ax - oh + 9); ctx.closePath();
  ctx.fillStyle = '#FDE047'; ctx.fill();
  ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#FDE047';
  ctx.fillText('物體', ox, ax - oh - 10);

  if (!isFinite(r.di)) {
    ctx.fillStyle = '#ef4444'; ctx.font = '900 18px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('物體正好在焦點上 → 折射後平行，不成像', W / 2, 34);
    return;
  }

  const ix = lensX + r.di * S, ih = oh * r.m;   // m 為負代表倒立

  // 光線 ①：平行入射 → 過焦點
  ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox, ax - oh); ctx.lineTo(lensX, ax - oh); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lensX, ax - oh);
  if (r.real) ctx.lineTo(ix, ax - ih); else ctx.lineTo(W, ax - oh + (ax - oh - (ax - ih)) / (ix - lensX) * (lensX - W) * -1);
  ctx.stroke();

  // 光線 ②：過透鏡中心
  ctx.beginPath(); ctx.moveTo(ox, ax - oh);
  ctx.lineTo(r.real ? ix : W, r.real ? ax - ih : ax - oh + (ax - (ax - oh)) * 0 + (ax - oh - ax) * ((W - ox) / (lensX - ox)) * -1 + 0);
  ctx.stroke();

  // 虛像的延長線
  if (!r.real) {
    ctx.setLineDash([7, 6]); ctx.strokeStyle = 'rgba(253,224,71,.55)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(lensX, ax - oh); ctx.lineTo(ix, ax - ih); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lensX, ax); ctx.lineTo(ix, ax - ih); ctx.stroke();
    ctx.setLineDash([]);
  }

  // 像
  ctx.strokeStyle = r.real ? '#22c55e' : '#a78bfa'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(ix, ax); ctx.lineTo(ix, ax - ih); ctx.stroke();
  const dir = ih >= 0 ? 1 : -1;
  ctx.beginPath(); ctx.moveTo(ix, ax - ih);
  ctx.lineTo(ix - 5, ax - ih + 9 * dir); ctx.lineTo(ix + 5, ax - ih + 9 * dir); ctx.closePath();
  ctx.fillStyle = r.real ? '#22c55e' : '#a78bfa'; ctx.fill();
  ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(r.real ? '實像' : '虛像', ix, ax - ih + (dir > 0 ? -12 : 24));

  // 圖例
  ctx.textAlign = 'left'; ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = '#94a3b8';
  ctx.fillText('黃＝光線　綠＝實像（可投影在屏幕上）　紫＝虛像（只能用眼睛看到）', 12, H - 10);
}

function update() {
  const r = solve();
  document.getElementById('vDo').textContent = state.dobj + ' cm';
  document.getElementById('vF').textContent = state.f + ' cm';
  document.getElementById('vH').textContent = state.h + ' cm';
  document.getElementById('diVal').textContent = isFinite(r.di) ? r.di.toFixed(1) + ' cm' : '∞';
  document.getElementById('mVal').textContent = isFinite(r.m) ? r.m.toFixed(2) + '×' : '—';
  document.getElementById('typeVal').textContent = r.type;

  const v = document.getElementById('verdict');
  if (!isFinite(r.di)) { v.className = 'verdict warn'; v.textContent = '⚠️ 物體正好在焦點上：折射後光線互相平行，不會會聚成像。'; }
  else if (!r.real) { v.className = 'verdict good'; v.textContent = `🔎 放大鏡模式：物體在焦距內（${state.dobj} < ${state.f}），成正立放大虛像，放大 ${Math.abs(r.m).toFixed(2)} 倍。像無法投影在屏幕上。`; }
  else if (Math.abs(r.m) > 1.02) { v.className = 'verdict good'; v.textContent = `📽️ 投影機模式：物體在 f 與 2f 之間，成倒立放大實像（${Math.abs(r.m).toFixed(2)} 倍）。`; }
  else if (Math.abs(r.m) < 0.98) { v.className = 'verdict good'; v.textContent = `📷 相機模式：物體在 2f 之外，成倒立縮小實像（${Math.abs(r.m).toFixed(2)} 倍）。`; }
  else { v.className = 'verdict good'; v.textContent = `⚖️ 物體剛好在 2f：成倒立等大實像，像距也等於 2f。`; }

  document.getElementById('calc').innerHTML =
    `1/f = 1/d<sub>o</sub> + 1/d<sub>i</sub><br>` +
    `1/${state.f} = 1/${state.dobj} + 1/d<sub>i</sub><br>` +
    `1/d<sub>i</sub> = ${(1 / state.f).toFixed(4)} − ${(1 / state.dobj).toFixed(4)} = ${((1 / state.f) - (1 / state.dobj)).toFixed(4)}<br>` +
    `<strong style="color:#6D28D9">d<sub>i</sub> = ${isFinite(r.di) ? r.di.toFixed(2) + ' cm' : '∞'}</strong>　` +
    `<strong style="color:#DB2777">m = −d<sub>i</sub>/d<sub>o</sub> = ${isFinite(r.m) ? r.m.toFixed(3) : '—'}</strong>` +
    (isFinite(r.di) && r.di < 0 ? '<br><span style="color:#a78bfa">d<sub>i</sub> 為負 → 像在物體同側 → 虛像</span>' : '');

  draw(r); check(r);
}

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_virt', text: '做出「放大鏡」：正立放大的虛像', hint: '把物距調到比焦距小',
    test: (r) => !r.real && isFinite(r.di) },
  { id: 'q_cam',  text: '做出「相機」：倒立縮小的實像', hint: '把物距調到大於 2 倍焦距',
    test: (r) => r.real && Math.abs(r.m) < 0.98 },
  { id: 'q_proj', text: '做出「投影機」：倒立放大的實像', hint: '物距介於 f 和 2f 之間',
    test: (r) => r.real && Math.abs(r.m) > 1.02 },
  { id: 'q_focal', text: '把物體放在焦點上，看它為什麼不成像', hint: '讓物距等於焦距',
    test: (r) => !isFinite(r.di) || Math.abs(state.dobj - state.f) < 0.5 },
];
const done = new Set(loadP().module4_quests || []);

function renderQuests() {
  document.getElementById('quests').innerHTML = QUESTS.map(q => {
    const d = done.has(q.id);
    return `<li style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;
      background:${d ? '#dcfce7' : '#f8fafc'};border-left:4px solid ${d ? '#22c55e' : '#cbd5e1'}">
      <span style="font-size:18px">${d ? '✅' : '⬜'}</span>
      <div><div style="font-weight:700;font-size:14px;color:${d ? '#15803d' : '#1e293b'}">${q.text}</div>
      <div style="font-size:12.5px;color:#64748b;margin-top:2px">💡 ${q.hint}</div></div></li>`;
  }).join('');
  document.getElementById('prog').textContent = `挑戰完成 ${done.size} / ${QUESTS.length}`;
}

function check(r) {
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test(r)) { done.add(q.id); newly = true; } });
  if (!newly) return;
  const p = loadP(); p.module4_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module4 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 四個模組全部完成！', 'good');
  } else if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  saveP(p); renderQuests();
}

// ---------- 綁定 ----------
document.getElementById('presetPick').innerHTML = PRESETS.map(p =>
  `<div class="pick" data-p="${p.id}"><span class="pick-ico">${p.ico}</span>
   <div class="pick-name" style="font-size:13px">${p.name}</div>
   <div class="pick-meta">${p.meta}</div></div>`).join('');

document.getElementById('presetPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  const p = PRESETS.find(x => x.id === el.dataset.p);
  state.dobj = p.dobj; state.f = p.f; state.h = p.h;
  document.getElementById('sDo').value = p.dobj;
  document.getElementById('sF').value = p.f;
  document.getElementById('sH').value = p.h;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  update();
});
document.getElementById('sDo').addEventListener('input', e => { state.dobj = +e.target.value; update(); });
document.getElementById('sF').addEventListener('input',  e => { state.f = +e.target.value; update(); });
document.getElementById('sH').addEventListener('input',  e => { state.h = +e.target.value; update(); });

renderQuests();
if (done.size === QUESTS.length) {
  document.getElementById('next-btn').style.opacity = 1;
  document.getElementById('next-btn').style.pointerEvents = 'auto';
}
update();
