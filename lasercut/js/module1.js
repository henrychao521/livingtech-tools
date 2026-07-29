// 雷射切割 模組 1：認識機器與安全
const PK = 'laser_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const BANNED = [
  { id: 'pvc', ico: '🚫', name: 'PVC／人造皮革', color: '#DC2626',
    why: '含氯。雷射高溫會分解出<strong>氯化氫氣體</strong>，遇水氣變鹽酸——不只傷肺，還會從內部腐蝕機器的導軌、鏡片與電路板。',
    tell: '常見於：水管、透明軟墊、部分「皮革」其實是 PVC 貼皮。分辨方式：PVC 燃燒會有刺鼻酸味（<strong>不要真的去點火測試</strong>，改查材質標示或問供應商）。',
    alt: '改用：真皮、壓克力、木質板材。' },
  { id: 'pc', ico: '🚫', name: '聚碳酸酯 PC',   color: '#EA580C',
    why: 'PC 會吸收 CO₂ 雷射的波長但<strong>不會乾淨汽化</strong>，只會焦黑、冒黃煙、切面糊在一起，而且極易起火。',
    tell: '常見於：防碎「壓克力」板、安全眼鏡、光碟盒。注意——很多標示「壓克力」的便宜板材其實是 PC。',
    alt: '改用：真正的壓克力（PMMA），切面會呈現漂亮的透明拋光。' },
  { id: 'metal', ico: '🚫', name: '金屬／鏡面材質', color: '#7C3AED',
    why: 'CO₂ 雷射（80 W 等級）切不動金屬，光會被<strong>直接反射回去</strong>，可能打壞聚焦鏡甚至雷射管——這是最貴的一種事故。',
    tell: '包含：鋁板、鐵板、鏡面壓克力的鏡面那側、貼了鋁箔的板材。',
    alt: '金屬雕刻需要光纖雷射機；本機只處理非金屬。' },
];

const CHECKS = [
  '排煙／抽風系統已開啟，管路沒有被壓扁或堵住',
  '滅火器就在機器旁，而且知道怎麼用',
  '水冷機運轉正常、水位足夠（雷射管沒水會燒毀）',
  '確認今天要切的材料<strong>不在禁用清單</strong>上',
  '工作區內沒有堆放紙屑、木屑等易燃物',
  '上蓋確實蓋好（開蓋運轉會有雷射外洩風險）',
  '已用 Frame 掃框確認加工範圍沒有超出板材',
  '加工全程有人在旁邊看著，不離開機器',
];

const QUIZ = [
  { q: '同學帶了一塊「透明壓克力」要切，但板子上沒有任何材質標示，摸起來比一般壓克力軟。',
    opts: [
      { t: '先問來源與材質，問不出來就不切', ok: true },
      { t: '先用小塊試切看看會不會冒黃煙', ok: false },
      { t: '降低功率就可以安全切', ok: false },
    ],
    why: '看起來像壓克力的板材可能是 PC 或 PVC。試切等於已經把有毒氣體放出來了，降功率也不會改變材料成分。<strong>材質不明就是不切</strong>。' },
  { q: '切割進行到一半，你發現板材邊緣冒出小火焰。',
    opts: [
      { t: '立刻按下急停，火勢未熄再用滅火器', ok: true },
      { t: '打開上蓋把材料拿出來', ok: false },
      { t: '等它自己燒完，反正在機器裡面', ok: false },
    ],
    why: '開蓋會灌入大量空氣讓火變大，也可能讓雷射持續發射。正確順序是<strong>先急停停止能量來源</strong>，再處理火勢。' },
  { q: '為什麼切完的件會比電腦畫的圖小一點點？',
    opts: [
      { t: '雷射本身有寬度，會吃掉約半條切縫', ok: true },
      { t: '因為材料受熱收縮', ok: false },
      { t: '因為機器精度不夠', ok: false },
    ],
    why: '這叫切縫（kerf），約 0.1～0.3 mm。做卡榫等需要密合的件時要在畫圖階段就補償進去。' },
];

const seen = new Set(loadP().m1_seen || []);
const checked = new Set(loadP().m1_check || []);
const answered = new Map(Object.entries(loadP().m1_ans || {}));
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

function renderBan() {
  document.getElementById('banPick').innerHTML = BANNED.map(b =>
    `<div class="pick ${seen.has(b.id) ? 'on' : ''}" data-b="${b.id}">
      <span class="pick-ico">${b.ico}</span><div class="pick-name">${b.name}</div>
      <div class="pick-meta">${seen.has(b.id) ? '✓ 已了解' : '點我看原因'}</div></div>`).join('');
}

function renderCheck() {
  document.getElementById('checklist').innerHTML = CHECKS.map((t, i) => {
    const on = checked.has(String(i));
    return `<label style="display:flex;gap:11px;align-items:flex-start;padding:11px 14px;border-radius:10px;
      background:${on ? '#ecfdf5' : '#f8fafc'};border-left:4px solid ${on ? '#10b981' : '#cbd5e1'};cursor:pointer">
      <input type="checkbox" data-k="${i}" ${on ? 'checked' : ''} style="margin-top:2px;width:18px;height:18px">
      <span style="font-size:14px;font-weight:600;color:${on ? '#065f46' : '#334155'}">${t}</span></label>`;
  }).join('');
  const el = document.getElementById('checkStat');
  el.textContent = `已完成 ${checked.size} / ${CHECKS.length} 項`;
  el.className = checked.size === CHECKS.length ? 'verdict good' : checked.size >= 4 ? 'verdict warn' : 'verdict bad';
  if (checked.size === CHECKS.length) el.textContent = '✅ 安全檢查全部完成，可以開機了';
}

function renderQuiz() {
  document.getElementById('quiz').innerHTML = QUIZ.map((item, i) => {
    const picked = answered.get(String(i));
    const correct = picked != null && item.opts[+picked].ok;
    return `<div style="background:#f8fafc;border-radius:12px;padding:15px 17px;margin-bottom:13px;
        border-left:4px solid ${picked != null ? (correct ? '#22c55e' : '#ef4444') : '#cbd5e1'}">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px">
        <span style="color:var(--primary-dark)">情境 ${i + 1}.</span> ${item.q}</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${item.opts.map((o, j) => {
          const on = picked === String(j);
          let bg = '#fff', bd = '#e2e8f0', fg = '#334155';
          if (picked != null) {
            if (o.ok) { bg = '#dcfce7'; bd = '#22c55e'; fg = '#15803d'; }
            else if (on) { bg = '#fee2e2'; bd = '#ef4444'; fg = '#b91c1c'; }
          }
          return `<button data-q="${i}" data-o="${j}" ${picked != null ? 'disabled' : ''}
            style="text-align:left;padding:10px 13px;border-radius:9px;border:2px solid ${bd};background:${bg};
            color:${fg};font-weight:600;font-size:13.5px;cursor:${picked != null ? 'default' : 'pointer'}">${o.t}</button>`;
        }).join('')}
      </div>
      ${picked != null ? `<div style="margin-top:10px;font-size:13px;color:#475569;background:#fff;
        padding:10px 12px;border-radius:8px">${correct ? '✅ 正確。' : '❌ 再想想。'}${item.why}</div>` : ''}
    </div>`;
  }).join('');
}

function updateProg() {
  let right = 0;
  answered.forEach((v, k) => { if (QUIZ[+k].opts[+v].ok) right++; });
  const parts = (seen.size === BANNED.length ? 1 : 0) + (checked.size === CHECKS.length ? 1 : 0) + (right === QUIZ.length ? 1 : 0);
  progEl.textContent = `進度 ${parts} / 3`;
  if (parts === 3) {
    const p = loadP(); p.module1 = true; saveP(p);
    nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    return true;
  }
  return false;
}

document.getElementById('banPick').addEventListener('click', e => {
  const el = e.target.closest('.pick'); if (!el) return;
  const b = BANNED.find(x => x.id === el.dataset.b);
  if (!seen.has(b.id)) { seen.add(b.id); const p = loadP(); p.m1_seen = Array.from(seen); saveP(p);
    if (typeof SoundFX !== 'undefined') SoundFX.pop(); }
  document.getElementById('banDetail').innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:16px;border-left:4px solid ${b.color}">
      <div style="font-weight:800;color:${b.color};margin-bottom:8px;font-size:16px">${b.ico} ${b.name}</div>
      <p style="font-size:14px;margin:6px 0"><strong>為什麼不行：</strong>${b.why}</p>
      <p style="font-size:14px;margin:6px 0"><strong>怎麼認出來：</strong>${b.tell}</p>
      <p style="font-size:13.5px;color:#15803d;margin-top:8px"><strong>${b.alt}</strong></p>
    </div>`;
  renderBan(); updateProg();
});

document.getElementById('checklist').addEventListener('change', e => {
  const cb = e.target.closest('input[data-k]'); if (!cb) return;
  cb.checked ? checked.add(cb.dataset.k) : checked.delete(cb.dataset.k);
  const p = loadP(); p.m1_check = Array.from(checked); saveP(p);
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  renderCheck();
  if (updateProg() && typeof showToast === 'function') showToast('🎉 模組 1 完成！', 'good');
});

document.getElementById('quiz').addEventListener('click', e => {
  const b = e.target.closest('button[data-q]'); if (!b || b.disabled) return;
  const qi = b.dataset.q; if (answered.has(qi)) return;
  answered.set(qi, b.dataset.o);
  const p = loadP(); p.m1_ans = Object.fromEntries(answered); saveP(p);
  const ok = QUIZ[+qi].opts[+b.dataset.o].ok;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  if (typeof showToast === 'function') showToast(ok ? '✅ 判斷正確' : '❌ 看看下面的說明', ok ? 'good' : '');
  renderQuiz();
  if (updateProg() && typeof showToast === 'function') showToast('🎉 模組 1 完成！', 'good');
});

renderBan(); renderCheck(); renderQuiz();
if (updateProg()) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
