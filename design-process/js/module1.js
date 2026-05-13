// 產品設計流程 模組 1：5 階段
const STAGES = [
  { id: 'empathize', name: '1. 同理（Empathize）', icon: '👁', cn: '探索使用者',
    desc: '了解使用者是誰、有什麼需求、遇到什麼問題。透過觀察、訪談、問卷收集第一手資料。',
    methods: ['使用者訪談（5-10 位深度）', '直接觀察（不打擾）', '使用者旅程圖（Journey Map）', '同理心圖（Empathy Map）'],
    deliverable: '使用者洞察報告（user insights）', warning: '不要假設使用者要什麼——一定要實際接觸他們。' },
  { id: 'define', name: '2. 定義（Define）', icon: '🎯', cn: '聚焦問題',
    desc: '把收集到的資料整理成「值得解決的問題陳述（POV）」。問題定義錯了，後面再努力都白費。',
    methods: ['HMW（How Might We...）句型', 'POV（Point of View）陳述', 'Persona 人物誌', '5W2H 分析'],
    deliverable: '問題陳述 + 設計目標', warning: '問題定義要具體：「我們如何幫忙 [使用者] 解決 [問題] 以達到 [結果]」。' },
  { id: 'ideate', name: '3. 發想（Ideate）', icon: '💡', cn: '創造概念',
    desc: '盡可能想出多種解法。「先求量、後求質」——好點子來自大量爛點子。',
    methods: ['腦力激盪（不批評）', 'SCAMPER 七法', '心智圖', '6 頂思考帽', 'Crazy 8 速繪'],
    deliverable: '30+ 個概念草圖', warning: '不批評是規則——任何想法都先寫下來，最後再評估。' },
  { id: 'prototype', name: '4. 原型（Prototype）', icon: '🔨', cn: '快速做出來',
    desc: '把最有潛力的概念做成「能讓人摸到」的原型。原型不需精緻，能傳達概念與測試假設即可。',
    methods: ['紙原型（Paper Prototype）', '3D 列印模型', 'Wireframe（線框圖）', '可動演示版'],
    deliverable: '低保真→中保真→高保真原型', warning: 'Done is better than perfect ──完成比完美重要。' },
  { id: 'test', name: '5. 測試（Test）', icon: '🧪', cn: '驗證與迭代',
    desc: '把原型給真實使用者試用，觀察反應、收集回饋、修改設計。迭代多次直到滿意。',
    methods: ['可用性測試（5 位使用者）', '焦點團體', 'A/B 測試', '回饋訪談'],
    deliverable: '改良後的下一版原型', warning: '失敗是常態——8 成的設計需要 5+ 次迭代才上線。' },
];

const PK = 'dp_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const stagesEl = document.getElementById('stages');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

STAGES.forEach((s, i) => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;cursor:pointer;border-left:5px solid #9333EA;margin-bottom:14px;${seen.has(s.id) ? 'background:#F3E8FF' : ''}`;
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <span style="font-size:36px">${s.icon}</span>
      <div><h4 style="margin:0;color:#6B21A8">${s.name}</h4><span style="font-size:13px;color:#9333EA;font-weight:700">${s.cn}</span></div>
    </div>
    <p style="font-size:13.5px;color:#444">${s.desc}</p>
    <div style="background:#F3E8FF;padding:10px;border-radius:8px;margin:10px 0">
      <strong style="color:#6B21A8;font-size:12.5px">常用方法：</strong>
      <span style="font-size:12.5px;color:#444">${s.methods.join(' ・ ')}</span>
    </div>
    <p style="font-size:12.5px;color:#16A34A"><strong>產出：</strong>${s.deliverable}</p>
    <p style="font-size:12.5px;color:#dc2626"><strong>⚠ 注意：</strong>${s.warning}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(s.id)) {
      seen.add(s.id); card.style.background = '#F3E8FF';
      progEl.textContent = `已認識 ${seen.size} / 5 階段`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 5) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 5 階段都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  stagesEl.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 5 階段`;
if (seen.size === 5) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
