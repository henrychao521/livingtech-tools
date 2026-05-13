// 結構模擬器 模組 3：設計流程
const STEPS = [
  { title: '定義功能與限制', desc: '想清楚結構要做什麼：跨距多寬？承載多少？放在哪裡？材料預算？\n例：紙桁架橋 — 跨距 40cm、承載 1kg、只用 A4 紙與膠水、總重 < 50g。', tip: '功能與限制是設計的「題目」，先寫清楚再動手。' },
  { title: '形態選擇', desc: '從 6 種結構類型中選一種（或組合）：桁架適合輕量大跨、拱適合磚石、纜索適合超長跨、框架適合多層樓。\n紙橋常用「桁架」或「拱」。', tip: '選擇形態前先想：荷重是垂直還是側向？支承在哪裡？' },
  { title: '草圖與尺寸', desc: '畫出結構草圖，標明節點位置、桿件長度、支承位置、荷重作用點。可以畫多個方案做比較。\n比例尺要對：1cm 在紙上 = 多少 cm 實際。', tip: '畫三個方案再從中挑——比一次到位品質好。' },
  { title: '載重估算', desc: '估算每個節點承受的力。自重（結構本身）+ 活載（外部荷重）。\n例：紙橋自重 50g，要承重 1000g，每節點分擔約 ?N。', tip: '安全因子（safety factor）通常 1.5–3.0：實際強度要是設計荷重的 1.5–3 倍。' },
  { title: '受力分析', desc: '用「節點法」或模擬器計算每根桿的內力（張力或壓力）。最大張力桿、最大壓力桿就是「關鍵桿件」。', tip: '受力分析是「驗證」階段——找出設計的弱點再改正。' },
  { title: '材料選擇', desc: '依桿件受力選材料：\n• 張力桿：鋼絲、繩、紙條（細長）\n• 壓力桿：木條、紙管（粗短，避免挫屈）\n• 節點：膠水、釘子、銷', tip: '同樣是紙：紙管抗壓比平面紙條強 10 倍——靠形狀提升強度。' },
  { title: '製造與組裝', desc: '依草圖切割材料、依序組裝。先組關鍵節點 → 再連次要桿件 → 最後加裝飾。膠水要乾透才能承重——等 24 小時。', tip: '組裝時保持結構在平面上對齊——歪了就無法承重。' },
  { title: '測試與改良', desc: '逐步加重直到失效，紀錄失效模式（哪根桿先壞？節點還是桿身？）。\n改良方向：加強最先壞的桿、改變幾何形狀、增加三角形分割。', tip: '失效不是失敗——是學習的開始。每次失敗紀錄「為什麼壞」就是進步。' },
];

const PK = 'struct_progress_v1';
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
      p.module3 = true;
      nextBtn.style.opacity = 1;
      nextBtn.style.pointerEvents = 'auto';
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
  SequencePuzzle({
    mountId: 'seq-puzzle',
    items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })),
    onPass: () => {
      const p = loadP(); p.module3_puzzle = true; saveP(p);
      showToast('🧩 排序測驗通過！', 'good');
    }
  });
}
