// 雷射切割 模組 5：保養與故障排除
// 影片為作者本人拍攝（趙珩宇 YouTube 頻道），以官方 youtube-nocookie 嵌入。
const PK = 'laser_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const VIDEOS = [
  { id: 'iBp47FV4dGg', t: '永春高中雷射切割機使用教學',
    d: '從開機、放料到開始切割的完整流程示範。第一次用機器的人先看這支。' },
  { id: '-J0RtHISlTI', t: '雷射切割操作 RDworks',
    d: 'RDWorks 軟體端的實際操作：匯入、圖層、參數、Preview 與 Download。搭配模組 2、3 一起看效果最好。' },
  { id: 'G6x1QGS82aE', t: '雷切機基本保養與維修',
    d: '鏡片清潔、皮帶與導軌保養的實機示範。切不斷、切歪的時候先看這支。' },
];

const CASES = [
  { sym: '昨天用同樣的參數切 3 mm 合板都很順，今天同一批板材卻切不斷。',
    opts: [
      { t: '先確認焦距是否跑掉，再檢查鏡片是否有髒污', ok: true },
      { t: '直接把功率從 65% 調到 95%', ok: false },
      { t: '換一台機器切', ok: false },
    ],
    why: '參數沒變、材料沒變，變的一定是機器狀態。焦距與鏡片是最常見也最便宜的兩個原因。先加功率會掩蓋真正的問題，還會加速雷射管老化。' },
  { sym: '切出來的線條一邊乾淨、另一邊有明顯斜角，件裝不進卡榫。',
    opts: [
      { t: '檢查焦點高度與雷射頭是否垂直（含反射鏡對位）', ok: true },
      { t: '降低速度讓它切慢一點', ok: false },
      { t: '在圖面上把尺寸改大 0.5 mm', ok: false },
    ],
    why: '切面呈斜角代表光路沒有垂直入射，通常是焦距不對或鏡片對位偏了。改圖面尺寸只是掩蓋症狀，下次換件又會錯。' },
  { sym: '雕刻文字時，字的邊緣糊糊的、深淺不均勻。',
    opts: [
      { t: '清潔聚焦鏡與反射鏡，並確認皮帶張力', ok: true },
      { t: '把雕刻功率調高一倍', ok: false },
      { t: '把文字放大就看不出來了', ok: false },
    ],
    why: '鏡片髒污會讓光點散開（邊緣糊），皮帶鬆掉會讓雷射頭定位飄移（深淺不均）。加功率只會讓糊掉的範圍更大更黑。' },
  { sym: '切割途中材料突然起火，火焰約手指大小。',
    opts: [
      { t: '立刻按急停，火未熄再用滅火器；不要先開蓋', ok: true },
      { t: '打開上蓋，用嘴吹熄', ok: false },
      { t: '暫停加工，等火自己熄掉', ok: false },
    ],
    why: '開蓋會灌入空氣使火勢變大，也可能讓雷射持續發射。正確順序是<strong>先切斷能量來源（急停）</strong>，再處理火勢。這也是為什麼加工全程不能離開機器。' },
];

const MAINT = [
  { when: '每次使用後', items: ['清除蜂巢台上的碎料與木屑（累積的碎屑是最常見的起火源）', '確認排煙管路沒有被堵住'] },
  { when: '每週', items: ['用擦鏡紙沾無水酒精清潔聚焦鏡與三面反射鏡（順同一方向擦，不要來回磨）', '檢查水冷機水位與水溫'] },
  { when: '每月', items: ['檢查 X／Y 軸皮帶張力，過鬆會讓定位飄移', '導軌清潔並補上適量潤滑', '檢查風扇與排風扇葉片積塵'] },
  { when: '每半年～一年', items: ['評估雷射管功率衰退（同參數切不斷、且焦距鏡片都正常時）', '全面檢查光路對位'] },
];

const answered = new Map(Object.entries(loadP().m5_ans || {}));
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

document.getElementById('videos').innerHTML = VIDEOS.map(v => `
  <div>
    <div class="vid-wrap">
      <iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="${v.t}"
        loading="lazy" allowfullscreen
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
    </div>
    <div style="font-weight:700;font-size:14.5px;margin-top:9px">${v.t}</div>
    <div style="font-size:13px;color:#64748b;line-height:1.65;margin-top:3px">${v.d}</div>
    <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener"
       style="font-size:12.5px;color:var(--primary-dark);font-weight:700;text-decoration:none">在 YouTube 開啟 ↗</a>
  </div>`).join('');

document.getElementById('maint').innerHTML = MAINT.map(m => `
  <div style="background:#f8fafc;border-radius:10px;padding:13px 15px;margin-bottom:9px;border-left:4px solid #E11D48">
    <div style="font-weight:800;font-size:14px;color:#9F1239">${m.when}</div>
    <ul style="margin:6px 0 0;padding-left:18px;font-size:13.5px;color:#475569;line-height:1.85">
      ${m.items.map(i => `<li>${i}</li>`).join('')}</ul>
  </div>`).join('');

function renderQuiz() {
  document.getElementById('quiz').innerHTML = CASES.map((c, i) => {
    const picked = answered.get(String(i));
    const correct = picked != null && c.opts[+picked].ok;
    return `<div style="background:#f8fafc;border-radius:12px;padding:15px 17px;margin-bottom:13px;
        border-left:4px solid ${picked != null ? (correct ? '#22c55e' : '#ef4444') : '#cbd5e1'}">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">
        <span style="color:var(--primary-dark)">症狀 ${i + 1}.</span> ${c.sym}</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${c.opts.map((o, j) => {
          const on = picked === String(j);
          let bg = '#fff', bd = '#e2e8f0', fg = '#334155';
          if (picked != null) {
            if (o.ok) { bg = '#dcfce7'; bd = '#22c55e'; fg = '#15803d'; }
            else if (on) { bg = '#fee2e2'; bd = '#ef4444'; fg = '#b91c1c'; }
          }
          return `<button data-c="${i}" data-o="${j}" ${picked != null ? 'disabled' : ''}
            style="text-align:left;padding:10px 13px;border-radius:9px;border:2px solid ${bd};background:${bg};
            color:${fg};font-weight:600;font-size:13.5px;cursor:${picked != null ? 'default' : 'pointer'}">${o.t}</button>`;
        }).join('')}
      </div>
      ${picked != null ? `<div style="margin-top:10px;font-size:13px;color:#475569;background:#fff;
        padding:10px 12px;border-radius:8px">${correct ? '✅ 正確。' : '❌ 再想想。'}${c.why}</div>` : ''}
    </div>`;
  }).join('');

  let right = 0;
  answered.forEach((v, k) => { if (CASES[+k].opts[+v].ok) right++; });
  progEl.textContent = `診斷 ${answered.size} / ${CASES.length}　答對 ${right}`;
  if (right === CASES.length) {
    const p = loadP(); p.module5 = true; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    return true;
  }
  return false;
}

document.getElementById('quiz').addEventListener('click', e => {
  const b = e.target.closest('button[data-c]'); if (!b || b.disabled) return;
  const ci = b.dataset.c; if (answered.has(ci)) return;
  answered.set(ci, b.dataset.o);
  const p = loadP(); p.m5_ans = Object.fromEntries(answered); saveP(p);
  const ok = CASES[+ci].opts[+b.dataset.o].ok;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  if (typeof showToast === 'function') showToast(ok ? '✅ 診斷正確' : '❌ 看看下面的說明', ok ? 'good' : '');
  if (renderQuiz()) {
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 五個模組全部完成！', 'good');
  }
});

if (renderQuiz()) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
