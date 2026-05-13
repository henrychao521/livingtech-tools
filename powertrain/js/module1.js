// 動力與運輸 模組 1：4 種動力系統
const POWERS = [
  { id: 'ice', name: '內燃機 Internal Combustion', icon: '🛢', eff: 25, desc: '燃料（汽油/柴油）在汽缸內燃燒，推動活塞 → 曲軸 → 變速箱 → 車輪。技術成熟 100+ 年。', pros: '加油快、續航長、技術成熟', cons: '效率低（25-30%）、CO₂ 排放、噪音、震動', use: '汽油車、機車、卡車、發電機' },
  { id: 'em', name: '電動機 Electric Motor', icon: '⚡', eff: 90, desc: '電池供電給馬達 → 直接驅動車輪（無需變速箱）。BLDC 無刷馬達是主流。', pros: '效率極高（90%+）、零排放、瞬間扭力大', cons: '電池貴、續航短、充電慢、寒冷耗電', use: '電動車、電動機車、電動巴士、高鐵' },
  { id: 'fc', name: '燃料電池 Fuel Cell', icon: '⛽', eff: 60, desc: '氫氣 + 氧氣化學反應 → 直接產生電能（副產物是純水）。加氫 3 分鐘可跑 600 公里。', pros: '加氫快、零排放、續航長', cons: '氫氣製造耗電、儲存運輸難、加氫站少', use: 'Toyota Mirai、燃料電池巴士、未來航空' },
  { id: 'hyd', name: '液壓動力 Hydraulic', icon: '💪', eff: 60, desc: '高壓液壓油推動油壓缸做直線運動。重型機械標配——力大、控制精準。', pros: '力極大（數十噸）、運動穩定、可精確定位', cons: '管路漏油、效率不如電動、需液壓站', use: '挖土機、堆高機、剎車系統、椅子升降' },
];

const PK = 'pt_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

POWERS.forEach(p => {
  const c = document.createElement('div');
  c.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #EA580C;${seen.has(p.id) ? 'background:#FFEDD5' : ''}`;
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:32px">${p.icon}</span><h4 style="margin:0;color:#9A3412">${p.name}</h4></div>
    <p style="font-size:12.5px;color:#EA580C;font-weight:700;background:#FFEDD5;padding:5px 10px;border-radius:5px;display:inline-block">效率 ${p.eff}%</p>
    <p style="font-size:13px;color:#444;margin:8px 0">${p.desc}</p>
    <p style="font-size:12.5px;color:#16A34A"><strong>優：</strong>${p.pros}</p>
    <p style="font-size:12.5px;color:#dc2626"><strong>缺：</strong>${p.cons}</p>
    <p style="font-size:12.5px;color:#666"><strong>應用：</strong>${p.use}</p>`;
  c.addEventListener('click', () => {
    if (!seen.has(p.id)) {
      seen.add(p.id); c.style.background = '#FFEDD5';
      progEl.textContent = `已認識 ${seen.size} / 4 種`;
      const pr = loadP(); pr.module1_seen = Array.from(seen);
      if (seen.size === 4) { pr.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 4 種動力都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(pr);
    }
  });
  grid.appendChild(c);
});
progEl.textContent = `已認識 ${seen.size} / 4 種`;
if (seen.size === 4) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
