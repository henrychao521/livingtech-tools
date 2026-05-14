// 液壓手臂 模組 2：4 軸結構
const AXES = [
  { id: 'base', iso: 'arm-base', name: '軸 1：基座旋轉', icon: '🔄', desc: '手臂繞垂直軸 360° 旋轉。控制方式：兩個針筒交替推/拉，透過齒條把直線運動轉成旋轉。', range: '0° ~ 360°', diff: '可用旋轉接頭（rotary joint）+ 雙針筒，學生實作較難。' },
  { id: 'shoulder', iso: 'arm-upper', name: '軸 2：大臂上下', icon: '⬆', desc: '大臂繞肩關節上下擺動。控制方式：大針筒一端固定底座，另一端固定大臂中段。推針筒 → 大臂抬起。', range: '0° ~ 90°', diff: '油壓缸越遠離關節，槓桿放大力越多。' },
  { id: 'elbow', iso: 'arm-lower', name: '軸 3：小臂彎曲', icon: '↗', desc: '小臂繞肘關節彎曲。控制方式：油壓缸接在大臂下方，推動小臂。', range: '-30° ~ 120°', diff: '小臂太長重心問題大，建議比大臂略短。' },
  { id: 'gripper', iso: 'arm-gripper', name: '軸 4：夾爪開合', icon: '🦞', desc: '兩個夾爪開合抓物體。控制方式：油壓缸推動夾爪鉸接點，靠連桿傳動兩夾爪同步開合。', range: '0 ~ 60mm 開合', diff: '夾爪過硬會把脆物體壓碎；過軟抓不住。實作可用彈簧調軟硬。' },
];

const PK = 'ha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module2_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

AXES.forEach(a => {
  const c = document.createElement('div');
  c.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #0284C7;${seen.has(a.id) ? 'background:#E0F2FE' : ''}`;
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
    <img src="../../models/hydraulic-arm/${a.iso}-iso.png" alt="${a.name}" style="width:64px;height:64px;object-fit:contain;background:#1E293B;border-radius:6px;flex-shrink:0" loading="lazy">
    <h4 style="margin:0;color:#075985">${a.name}</h4>
  </div>
    <p style="font-size:13px;color:#0284C7;font-weight:700;background:#E0F2FE;padding:5px 10px;border-radius:5px;display:inline-block">${a.range}</p>
    <p style="font-size:13px;color:#444;margin:8px 0">${a.desc}</p>
    <p style="font-size:12.5px;color:#dc2626"><strong>難點：</strong>${a.diff}</p>`;
  c.addEventListener('click', () => {
    if (!seen.has(a.id)) {
      seen.add(a.id); c.style.background = '#E0F2FE';
      progEl.textContent = `已認識 ${seen.size} / 4 軸`;
      const p = loadP(); p.module2_seen = Array.from(seen);
      if (seen.size === 4) { p.module2 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 4 軸都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(c);
});
progEl.textContent = `已認識 ${seen.size} / 4 軸`;
if (seen.size === 4) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
