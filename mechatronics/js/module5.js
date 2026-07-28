// 機電整合 模組 5：整車除錯與完賽檢核
const PK = 'mecha_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const CASES = [
  {
    sym: '按下開關後，控制板的電源燈有亮，但兩顆馬達完全不動，也沒有任何聲音。',
    opts: [
      { t: '檢查馬達驅動器的電源與 GND 是否接好（含共地）', ok: true },
      { t: '直接調高 Kp 讓修正力道變大', ok: false },
      { t: '重新校正循跡感測器的閾值', ok: false },
    ],
    why: '控制板有電不代表馬達那一路有電。驅動模組通常有獨立的電源輸入，且必須與控制板共地，訊號才有效。'
  },
  {
    sym: '車子會動，但兩顆馬達轉向相反，車子在原地打轉。',
    opts: [
      { t: '把其中一顆馬達的兩條電源線對調', ok: true },
      { t: '換一顆更大扭力的馬達', ok: false },
      { t: '把電池換成全新的', ok: false },
    ],
    why: '左右馬達實體上是鏡像安裝的，同樣的正轉指令會造成相反的前進方向。對調任一顆的兩條線即可。'
  },
  {
    sym: '在家裡調得很順，一到比賽場地就整台亂衝，感測器好像都讀不到線。',
    opts: [
      { t: '執行開機校正，重新取得該場地的黑白讀值與閾值', ok: true },
      { t: '把基礎速度調到最低慢慢走', ok: false },
      { t: '增加 Kd 讓它穩定一點', ok: false },
    ],
    why: '場地的燈光與地板材質不同，原本的閾值會失效。這就是為什麼校正要做成開機自動執行。'
  },
  {
    sym: '車子沿線走得還算穩，但每次進彎道就整台衝出去。',
    opts: [
      { t: '提高 Kp，或降低基礎速度', ok: true },
      { t: '把感測器排列改得更窄', ok: false },
      { t: '換更大容量的電池', ok: false },
    ],
    why: '直線穩定代表感測與接線都正常，問題出在轉彎時修正力道不足——這是控制參數的問題。'
  },
  {
    sym: '車子一路左右劇烈搖擺，走一段就脫線；電池充飽、感測器讀值也正常。',
    opts: [
      { t: '加入 Kd（微分項），或略為降低 Kp', ok: true },
      { t: '提高 Kp 讓它修得更快', ok: false },
      { t: '把超音波感測器拆掉', ok: false },
    ],
    why: '劇烈搖擺是「修正過頭」。微分項會看誤差變化的速度提前減緩修正，把振盪壓下來。'
  },
];

const CHECKLIST = [
  '電池已充飽，且量測電壓在正常範圍',
  '所有接線牢固，無鬆脫或裸線互碰',
  '控制板與馬達驅動器已共地（GND 相接）',
  '車輪架高測試：兩輪轉向正確（同時前進）',
  '循跡感測器離地高度一致，且已固定',
  '已在「比賽場地」執行開機校正',
  '五顆感測器讀值都印出來確認過，無壞點',
  '超音波讀值已排除 0 與超出量程的無效值',
  '控制參數（Kp／Kd／速度）已在場地實跑調整',
  '備品已帶：電池、螺絲、膠帶、備用感測器',
];

const answered = new Map(Object.entries(loadP().module5_ans || {}));
const checked = new Set(loadP().module5_check || []);
const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

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
  return right;
}

function renderCheck() {
  document.getElementById('checklist').innerHTML = CHECKLIST.map((t, i) => {
    const on = checked.has(String(i));
    return `<label style="display:flex;gap:11px;align-items:flex-start;padding:11px 14px;border-radius:10px;
      background:${on ? '#ecfdf5' : '#f8fafc'};border-left:4px solid ${on ? '#10b981' : '#cbd5e1'};cursor:pointer">
      <input type="checkbox" data-k="${i}" ${on ? 'checked' : ''} style="margin-top:2px;width:18px;height:18px">
      <span style="font-size:14px;font-weight:600;color:${on ? '#065f46' : '#334155'}">${t}</span></label>`;
  }).join('');
  const el = document.getElementById('checkStat');
  el.textContent = `已完成 ${checked.size} / ${CHECKLIST.length} 項`;
  el.className = checked.size === CHECKLIST.length ? 'verdict good'
               : checked.size >= 6 ? 'verdict warn' : 'verdict bad';
  if (checked.size === CHECKLIST.length) el.textContent = '✅ 檢核表全數完成，可以上場了！';
}

function checkDone() {
  let right = 0;
  answered.forEach((v, k) => { if (CASES[+k].opts[+v].ok) right++; });
  if (right === CASES.length && checked.size === CHECKLIST.length) {
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
  const p = loadP(); p.module5_ans = Object.fromEntries(answered); saveP(p);
  const ok = CASES[+ci].opts[+b.dataset.o].ok;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  if (typeof showToast === 'function') showToast(ok ? '✅ 診斷正確' : '❌ 看看下面的說明', ok ? 'good' : '');
  renderQuiz();
  if (checkDone() && typeof showToast === 'function') showToast('🎉 五個模組全部完成！', 'good');
});

document.getElementById('checklist').addEventListener('change', e => {
  const cb = e.target.closest('input[data-k]'); if (!cb) return;
  cb.checked ? checked.add(cb.dataset.k) : checked.delete(cb.dataset.k);
  const p = loadP(); p.module5_check = Array.from(checked); saveP(p);
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  renderCheck();
  if (checkDone()) {
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 五個模組全部完成！', 'good');
  }
});

renderQuiz(); renderCheck(); checkDone();
