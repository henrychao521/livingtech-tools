// 能源系統 模組 3：發電過程 8 步驟
const STEPS = [
  { title: '原料 / 能源取得', desc: '燃煤需要開採；天然氣需要鑽井 + 液化海運；鈾礦需要開採提煉；太陽能 / 風力 / 水力是即時取得不需儲存。', tip: '能源「取得」階段就會耗能與排碳——油輪載 LNG 來台本身就耗大量燃油。' },
  { title: '燃料運送與儲存', desc: '燃料運到電廠後儲存：煤堆放在堆煤場、LNG 儲在冷凍槽（-162°C）、核燃料儲在水池。再生能源不需此步驟。', tip: '儲存設施本身要花能源維持（冷凍、防鏽、安全監控）。' },
  { title: '能量轉換（產熱）', desc: '化石／核能：燃燒/核反應 → 高溫高壓蒸汽\n再生能源：直接取得動能（風）或位能（水）。', tip: '蒸汽溫度 500-600°C，效率上限受卡諾定律限制（約 40-45%）。' },
  { title: '推動渦輪機', desc: '高壓蒸汽（或水/風）推動渦輪葉片，把熱能/動能轉成機械旋轉動能。渦輪是發電廠的核心心臟。', tip: '此階段能源損失約 10-15%（摩擦、葉片效率）。' },
  { title: '發電機產生電能', desc: '渦輪帶動發電機（巨大旋轉磁鐵 + 線圈）產生「三相交流電」。一般電廠輸出 6-25kV。', tip: '發電機效率 95%+，是整個鏈中最高效的環節。' },
  { title: '升壓變電 → 高壓輸電', desc: '電壓拉高到 161-345kV（台灣超高壓）。電壓越高，電流越低，長距離輸電損失越少（公式 P = I²R）。', tip: '台灣全島電網由台電「超高壓電網」連接 8 大區域。' },
  { title: '降壓配電到社區', desc: '社區變電站把 161kV 逐級降到 22.8kV（市區配電線）→ 220V/110V 家用電壓。電線桿上的「變壓器」就是此功能。', tip: '雷擊變壓器爆炸 = 那一區停電的最常見原因。' },
  { title: '家中插座 → 電器使用', desc: '家用 110V 60Hz（台灣標準）進入分電盤，再分到各個迴路（照明、插座、冷氣、廚房）。電器把電能轉換成最終用途的能量形式。', tip: '從燃料到電器使用，整體能源轉換效率約 30-40%——大部分能量在輸送過程變成熱散掉了。' },
];

const PK = 'energy_progress_v1';
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
  stepDetailEl.innerHTML = `
    <span class="step-step">STEP ${i + 1} / ${STEPS.length}</span>
    <h3>${s.title}</h3>
    <p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>
    ${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}
    <div style="display:flex;gap:8px;margin-top:18px">
      ${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}
      ${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成全部步驟 ✓</span>'}
    </div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP();
    p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) {
      p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 8 步驟全部完成！', 'good');
    }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
if (typeof SequencePuzzle === 'function') {
  SequencePuzzle({ mountId: 'seq-puzzle', items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })), onPass: () => { const p = loadP(); p.module3_puzzle = true; saveP(p); showToast('🧩 排序測驗通過！', 'good'); } });
}
