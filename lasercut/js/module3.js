// 雷射切割 模組 3：圖層與加工方式
const PK = 'laser_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const OPS = [
  { id: 'cut', ico: '✂️', name: '切割 Cut', col: '#DC2626', sw: '#DC2626',
    what: '雷射沿著線走，能量足以<strong>穿透整塊板材</strong>，把件切下來。',
    param: '慢速 × 高功率（3 mm 合板約 20 mm/s、65%）',
    use: '外框、內部挖空、卡榫孔。',
    note: '線條必須是<strong>向量路徑</strong>；點陣圖無法切割。' },
  { id: 'score', ico: '✏️', name: '刻線 Score', col: '#2563EB', sw: '#2563EB',
    what: '同樣沿線走，但能量<strong>只在表面留下痕跡</strong>，不切斷。',
    param: '中速 × 低功率（約 100 mm/s、10～15%）',
    use: '摺線、對位記號、需要保留連接的裝飾線。',
    note: '刻線深度會隨材料變化很大，務必先試切。' },
  { id: 'engrave', ico: '🖌️', name: '雕刻 Scan', col: '#111827', sw: '#111827',
    what: '雷射像印表機一樣<strong>來回掃描填滿</strong>整個區域，燒掉表層。',
    param: '高速 × 低功率（約 300 mm/s、18～25%）',
    use: '文字、logo、圖片、大面積紋理。',
    note: '需要<strong>封閉圖形</strong>才能填滿；面積越大越花時間。' },
];

const PARTS = [
  { id: 'frame', name: '外框輪廓', desc: '鑰匙圈的外形，要能拿下來', ans: 'cut' },
  { id: 'fold',  name: '中間摺線', desc: '要能沿線折彎，但不能斷', ans: 'score' },
  { id: 'text',  name: '姓名文字', desc: '填滿的黑色字，要看得清楚', ans: 'engrave' },
];

const assign = new Map(Object.entries(loadP().m3_assign || {}));
const seen = new Set(loadP().m3_seen || []);
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

function renderOps() {
  document.getElementById('opPick').innerHTML = OPS.map(o =>
    `<div class="pick ${seen.has(o.id) ? 'on' : ''}" data-o="${o.id}">
      <span class="pick-ico">${o.ico}</span><div class="pick-name">${o.name}</div>
      <div class="pick-meta">${seen.has(o.id) ? '✓ 已看過' : '點我看細節'}</div></div>`).join('');
}

function renderAssign() {
  document.getElementById('assign').innerHTML = PARTS.map(p => {
    const cur = assign.get(p.id);
    return `<div style="background:#f8fafc;border-radius:10px;padding:12px 14px">
      <div style="font-weight:700;font-size:14px">${p.name}</div>
      <div style="font-size:12.5px;color:#64748b;margin-bottom:8px">${p.desc}</div>
      <div class="layer-row" style="margin:0">
        ${OPS.map(o => `<div class="layer-chip ${cur === o.id ? 'on' : ''}" data-p="${p.id}" data-o="${o.id}">
          <span class="layer-sw" style="background:${o.sw}"></span>${o.name.split(' ')[0]}</div>`).join('')}
      </div></div>`;
  }).join('');
}

function draw() {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, H);

  const bx = 70, by = 70, bw = 280, bh = 190;
  // 板材
  ctx.fillStyle = '#B45309'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(bx, by, bw, 6);

  const of = assign.get('frame'), os = assign.get('fold'), ot = assign.get('text');

  // 外框
  if (of === 'cut') {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(bx - 4, by - 4, bw + 8, 5); ctx.fillRect(bx - 4, by + bh - 1, bw + 8, 5);
    ctx.fillRect(bx - 4, by - 4, 5, bh + 8); ctx.fillRect(bx + bw - 1, by - 4, 5, bh + 8);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.strokeRect(bx - 10, by - 10, bw + 20, bh + 20); ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e'; ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('✓ 已切斷，可取下', bx - 10, by - 16);
  } else if (of) {
    ctx.strokeStyle = of === 'score' ? '#2563EB' : '#111827';
    ctx.lineWidth = of === 'engrave' ? 8 : 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#ef4444'; ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(of === 'score' ? '✗ 只有痕跡，拿不下來' : '✗ 邊界被燒成一條粗溝', bx - 10, by - 16);
  }

  // 摺線
  const my = by + bh / 2;
  if (os === 'score') {
    ctx.strokeStyle = '#7C2D12'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(bx + 12, my); ctx.lineTo(bx + bw - 12, my); ctx.stroke(); ctx.setLineDash([]);
  } else if (os === 'cut') {
    ctx.fillStyle = '#0b1220'; ctx.fillRect(bx + 12, my - 2, bw - 24, 5);
    ctx.fillStyle = '#ef4444'; ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✗ 斷成兩半了', bx + bw / 2, my - 10);
  } else if (os === 'engrave') {
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(bx + 12, my - 7, bw - 24, 14);
  }

  // 文字
  ctx.textAlign = 'center';
  if (ot === 'engrave') {
    ctx.fillStyle = '#2A1608'; ctx.font = '900 34px "Noto Sans TC", sans-serif';
    ctx.fillText('珩宇', bx + bw / 2, by + 52);
  } else if (ot === 'score') {
    ctx.strokeStyle = '#7C2D12'; ctx.lineWidth = 1.2;
    ctx.font = '900 34px "Noto Sans TC", sans-serif'; ctx.strokeText('珩宇', bx + bw / 2, by + 52);
    ctx.fillStyle = '#eab308'; ctx.font = '700 11px Inter, sans-serif';
    ctx.fillText('△ 只有輪廓線，沒填滿', bx + bw / 2, by + 66);
  } else if (ot === 'cut') {
    ctx.fillStyle = '#0b1220'; ctx.font = '900 34px "Noto Sans TC", sans-serif';
    ctx.fillText('珩宇', bx + bw / 2, by + 52);
    ctx.fillStyle = '#ef4444'; ctx.font = '700 11px Inter, sans-serif';
    ctx.fillText('✗ 字被切掉、掉出來了', bx + bw / 2, by + 68);
  }

  ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('加工結果預覽', W - 12, H - 10);
}

function update() {
  draw();
  const allSet = PARTS.every(p => assign.has(p.id));
  const allRight = PARTS.every(p => assign.get(p.id) === p.ans);
  const v = document.getElementById('verdict');
  if (!allSet) { v.className = 'verdict warn'; v.textContent = '幫三個元素都選好加工方式'; }
  else if (allRight) { v.className = 'verdict good'; v.textContent = '✅ 全部正確！外框切斷、摺線留痕、文字填滿——這就是一份可以直接送出去的圖層設定。'; }
  else {
    const wrong = PARTS.filter(p => assign.get(p.id) !== p.ans).map(p => p.name).join('、');
    v.className = 'verdict bad'; v.textContent = `❌ ${wrong} 的設定不對，看看右邊預覽發生了什麼事。`;
  }
  const parts = (seen.size === OPS.length ? 1 : 0) + (allRight ? 1 : 0);
  progEl.textContent = `進度 ${parts} / 2`;
  if (parts === 2) {
    const p = loadP(); p.module3 = true; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    return true;
  }
  return false;
}

document.getElementById('opPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  const o = OPS.find(x => x.id === el.dataset.o);
  if (!seen.has(o.id)) { seen.add(o.id); const p = loadP(); p.m3_seen = Array.from(seen); saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.pop(); }
  document.getElementById('opDetail').innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:16px;border-left:4px solid ${o.col}">
      <div style="font-weight:800;color:${o.col};margin-bottom:8px;font-size:16px">${o.ico} ${o.name}</div>
      <p style="font-size:14px;margin:5px 0"><strong>做什麼：</strong>${o.what}</p>
      <p style="font-size:14px;margin:5px 0"><strong>參數方向：</strong>${o.param}</p>
      <p style="font-size:14px;margin:5px 0"><strong>用在哪：</strong>${o.use}</p>
      <p style="font-size:13.5px;color:#475569;margin-top:8px">💡 ${o.note}</p>
    </div>`;
  renderOps(); update();
});

document.getElementById('assign').addEventListener('click', e => {
  const c = e.target.closest('.layer-chip'); if (!c) return;
  assign.set(c.dataset.p, c.dataset.o);
  const p = loadP(); p.m3_assign = Object.fromEntries(assign); saveP(p);
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  renderAssign();
  if (update() && typeof showToast === 'function') showToast('🎉 模組 3 完成！', 'good');
});

renderOps(); renderAssign();
if (update()) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
