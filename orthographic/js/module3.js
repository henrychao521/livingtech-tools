// 三視圖 模組 3：繪製 8 步驟
const STEPS = [
  { title: '分析物件特徵', desc: '看 3D 物件，找出：\n• 最大長/寬/高（決定圖紙大小）\n• 圓柱/孔洞位置\n• 對稱軸\n• 哪三個面最能表達特徵', tip: '通常選正面（最寬最高的面）為「正視」。' },
  { title: '繪製外框與輔助線', desc: '在紙上分配三個視圖位置（CNS 第三角法：正視在中、俯視在上、側視在右）。輕輕用 H 鉛筆畫外框參考線——後面要擦掉的。\n畫「45° 投影線」連接各視圖的對齊輔助。', tip: '三個視圖中間留 30-50mm 給尺寸標註。' },
  { title: '繪製正視圖（前視）', desc: '從物件正面看到的形狀。先畫主要外框、再內部細節。\n• 看得見的邊：粗實線\n• 看不見的邊：虛線\n• 對稱軸：點劃線（中心線）', tip: '正視圖通常是「資訊量最多」的視圖——最先畫。' },
  { title: '依正視繪製俯視圖', desc: '從物件上方看的形狀。寬度與正視對齊（「長對正」）。\nCNS 第三角法：俯視畫在正視的「上方」，由「長對正」線向上延伸。', tip: '俯視圖最靠近正視的那條邊，對應物件的「前緣」——是最靠近觀察者的那邊。' },
  { title: '依正視繪製側視圖', desc: '從物件右方（或左方）看的形狀。高度與正視對齊（「高平齊」）。\n畫在正視的右方，由「高平齊」線往右延伸。', tip: '側視圖選「右側」是慣例，第三角法。' },
  { title: '檢查投影對齊', desc: '三視圖間「長對正、寬相等、高平齊」是核心檢查項目：\n• 正視寬 = 俯視寬（長對正）\n• 俯視寬 = 側視深（寬相等，透過 45° 線）\n• 正視高 = 側視高（高平齊）\n對齊不到代表畫錯了。', tip: '畫錯了？回去看 3D 物件並修正。' },
  { title: '加入虛線與中心線', desc: '修飾線型：\n• 孔洞、背後輪廓：虛線（dashed）\n• 圓心、對稱軸：點劃線（dash-dot）\n• 剖面線（如有）：細實線 45°\n按 CNS 標準線粗：實線 0.7mm、虛線 / 中心線 0.35mm。', tip: '虛線端點要與實線「對齊不超出」。中心線要超出輪廓 2-3mm。' },
  { title: '標註尺寸', desc: '加入尺寸標註：\n• 總長/寬/高（外形尺寸）\n• 孔徑（⌀）、半徑（R）\n• 角度（°）\n• 公差（±0.1）\n標註在「最能表達該尺寸」的視圖上，同一尺寸只標一次。', tip: '尺寸線、延伸線、文字字高都要按標準。CAD 軟體會自動套用。' },
];

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const nextBtn = document.getElementById('next-btn');
const seenSteps = new Set((loadP().module3_seen) || []);
STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item' + (i === 0 ? ' active' : '') + (seenSteps.has(i) ? ' seen' : '');
  item.innerHTML = `<div class="step-num">${i + 1}</div><div class="step-info"><h5>${s.title}</h5></div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});
function selectStep(i) {
  const s = STEPS[i];
  document.querySelectorAll('.step-item').forEach((el, k) => el.classList.toggle('active', k === i));
  stepDetailEl.innerHTML = `<span class="step-step">STEP ${i + 1} / ${STEPS.length}</span><h3>${s.title}</h3><p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}<div style="display:flex;gap:8px;margin-top:18px">${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成 ✓</span>'}</div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP(); p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) { p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 8 步完成！', 'good'); }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
if (typeof SequencePuzzle === 'function') SequencePuzzle({ mountId: 'seq-puzzle', items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })), onPass: () => { const p = loadP(); p.module3_puzzle = true; saveP(p); showToast('🧩 通過！', 'good'); } });

/* ── 尺寸標註判斷練習 ─────────────────────────────────── */
const DIM_STATEMENTS = [
  { text: '尺寸線要與輪廓線保持距離,不疊在圖形輪廓上。', ans: true,
    explain: '正確。尺寸線離輪廓約 10mm、各尺寸線間隔約 8mm,圖面才清晰不混淆。' },
  { text: '同一個尺寸在三個視圖各標一次,看起來比較保險。', ans: false,
    explain: '錯誤。這是「重複標註」——同一尺寸只標一次,重複標註反而容易在修改時互相矛盾。' },
  { text: '尺寸應標註在最能表達該特徵形狀的視圖上。', ans: true,
    explain: '正確。例如孔的位置標在能看到圓的視圖、厚度標在側視圖,讀圖的人一眼就懂。' },
  { text: '尺寸數字寫在尺寸線的中斷處或尺寸線上方。', ans: true,
    explain: '正確。CNS 標準允許數字置於尺寸線中斷處或上方,且不可被任何線條穿過。' },
];
const dimQuizEl = document.getElementById('dim-quiz');
if (dimQuizEl) {
  const dAnswered = new Set(); let dCorrect = 0;
  DIM_STATEMENTS.forEach((s, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px';
    div.innerHTML = `<p style="font-size:14px;margin-bottom:8px;line-height:1.6"><strong>敘述 ${i + 1}：</strong>${s.text}</p>
      <div class="choice-grid" style="grid-template-columns:repeat(2,minmax(0,120px))">
        <button class="choice" data-q="${i}" data-v="true">⭕ 正確</button>
        <button class="choice" data-q="${i}" data-v="false">❌ 錯誤</button>
      </div>
      <div class="feedback-slot"></div>`;
    dimQuizEl.appendChild(div);
  });
  dimQuizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
    const i = parseInt(b.dataset.q);
    if (dAnswered.has(i)) return;
    const s = DIM_STATEMENTS[i];
    const ok = (b.dataset.v === 'true') === s.ans;
    const card = b.closest('div[style*="border-radius"]');
    card.querySelectorAll('.choice').forEach(x => { x.disabled = true; if ((x.dataset.v === 'true') === s.ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
    card.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}" style="margin-top:6px">${ok ? '✓ 答對！' : '✗ 答錯。'} ${s.explain}</div>`;
    if (ok) { dCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
    dAnswered.add(i);
    if (dAnswered.size === DIM_STATEMENTS.length) {
      const pp = loadP(); pp.module3_dims = true; pp.module3_dims_score = dCorrect; saveP(pp);
      document.getElementById('dim-quiz-summary').innerHTML = `<div class="feedback ${dCorrect === DIM_STATEMENTS.length ? 'success' : 'info'}" style="margin-top:4px"><strong>📐 判斷完成：${dCorrect} / ${DIM_STATEMENTS.length} 答對。</strong>記住三原則——不重複標註、標在最能表達特徵的視圖、線與數字擺放位置照標準。</div>`;
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      showToast(`📐 尺寸標註練習 ${dCorrect}/${DIM_STATEMENTS.length} 答對`, dCorrect === DIM_STATEMENTS.length ? 'good' : 'info');
    }
  }));
}
