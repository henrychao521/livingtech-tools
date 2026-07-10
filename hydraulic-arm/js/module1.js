// 液壓手臂 模組 1：液壓原理
const CONCEPTS = [
  { id: 'pascal', name: '帕斯卡定律 Pascal\'s Law', formula: 'P = F/A（壓力 = 力 ÷ 面積）',
    desc: '封閉液體中任一點的壓力會等量傳遞到液體各處。1653 年 Blaise Pascal 提出。\n→ 推一邊的針筒，另一邊也會以「等壓力」被推出。',
    example: '推小針筒 10N、其截面積 1cm² → 整管液體壓力 = 10 N/cm²。傳到大針筒（截面積 9cm²）→ 推力 = 10 × 9 = 90N。' },
  { id: 'cylinder', name: '油壓缸 Hydraulic Cylinder', formula: 'F = P × A',
    desc: '油壓缸是把壓力轉換成「直線運動」的關鍵元件。內部活塞被高壓油推動，向外輸出力與位移。\n針筒就是最簡單的油壓缸——學生實作用針筒當油壓缸。',
    example: '工業油壓缸常見壓力 70-210 bar（700-2100 N/cm²）。汽車千斤頂可頂 2 噸的車。' },
  { id: 'ma', name: '液壓機械利益 Mechanical Advantage', formula: 'MA = A_大 ÷ A_小',
    desc: '兩個不同直徑的油壓缸組合 = 液壓的「槓桿」。MA = 大油壓缸面積 ÷ 小油壓缸面積。\n面積比 = 直徑比的平方！直徑 3 倍 = 面積 9 倍 = 力放大 9 倍。',
    example: '汽車煞車：腳踩踏板（小活塞 1cm²）→ 卡鉗推墊片（大活塞 16cm²）→ 力放大 16 倍。腳踩 50N 變成 800N 夾住碟盤。' },
  { id: 'transmission', name: '靜壓傳動 Static Transmission', formula: '能量守恆：F₁ × D₁ = F₂ × D₂',
    desc: '液壓系統的能量遵守「能量守恆」——省力一定走更遠的距離。\n小推 9cm × 10N = 大推 1cm × 90N = 0.9 焦耳（90 N·cm）。',
    example: '挖土機操作員推小桿一段距離，巨大鏟臂卻只動小距離但力量爆增。' },
];

const PK = 'ha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

CONCEPTS.forEach(c => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #0284C7;${seen.has(c.id) ? 'background:#E0F2FE' : ''}`;
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
    <img src="../../models/hydraulic-arm/syringe-iso.png" alt="針筒" style="width:56px;height:56px;object-fit:contain;background:#1E293B;border-radius:6px;flex-shrink:0" loading="lazy">
    <h4 style="margin:0;color:#075985">${c.name}</h4>
  </div>
    <p style="font-family:var(--font-mono);color:#0284C7;font-weight:700;background:#E0F2FE;padding:6px 10px;border-radius:5px;margin:6px 0">${c.formula}</p>
    <p style="font-size:13px;color:#444">${c.desc.replace(/\n/g, '<br>')}</p>
    <p style="font-size:12.5px;color:#666;margin-top:8px"><strong>範例：</strong>${c.example}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(c.id)) {
      seen.add(c.id); card.style.background = '#E0F2FE';
      progEl.textContent = `已認識 ${seen.size} / 4 項`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 4) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 4 個概念都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 4 項`;
if (seen.size === 4) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
