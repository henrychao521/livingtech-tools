// FRC 模組 3：工程設計流程（7 階段）
const STEPS = [
  {
    short: '定義',
    title: 'Define：問題定義 + 遊戲分析',
    desc: 'Kickoff 後立刻做：拆解今年遊戲規則、找出得分點、評估每種策略的「分數/秒」 ROI。決定機器人「要解決的核心問題」。',
    deliverable: '策略一頁紙 (Strategy 1-Pager)：要解決的問題、目標排名、得分機制優先順序',
    tip: 'Team 254 用「Mock Tournament」模擬比賽，從旁觀者角度看哪些策略效益最高。',
    warn: '不要急著想機構！策略確定前所有 mechanism brainstorm 都是浪費。',
  },
  {
    short: '研究',
    title: 'Research：研究既有解決方案',
    desc: '看上屆比賽影片、頂尖隊伍的 reveal video、Chief Delphi 討論。理解別人怎麼解、有沒有可借用的設計。',
    deliverable: '參考設計清單（連結 + 截圖 + 為什麼有效）',
    tip: '推薦觀看：Ri3D（48 小時造機器人挑戰）、Reveal Videos、Team 254/1678 的 build blog。',
    warn: '抄襲不可恥但要標明出處。學習 ≠ 直接複製。',
  },
  {
    short: '構想',
    title: 'Ideate：腦力激盪 + 概念設計',
    desc: '每個 subsystem 至少想 3 個方案。畫草圖、做 quick sketch、用紙板做 mockup。子隊間 cross-pollinate。',
    deliverable: 'Concept sketches (5+ 個 mechanism 變體) + 評分矩陣',
    tip: '用「Pugh chart」決策：列出評估指標（重量、可靠度、可製造、成本），逐項打分。',
    warn: '不要「愛上第一個想法」。沒比較就沒有最佳。',
  },
  {
    short: '原型',
    title: 'Prototype：快速做出可測試版本',
    desc: '用木板、PVC、紙板、3D 列印做「dirty prototype」。能動就好，不求精緻。目標是「最快學到」這個 mechanism 行不行。',
    deliverable: '可動原型 + 影片紀錄 + 數據（速度、精度、可靠度）',
    tip: 'Team 254 有「48 小時 prototype」傳統：兩天內必須做出可測試品，否則 mechanism 換方案。',
    warn: '原型不要太完美。完美主義會吃掉時間，最後機器人來不及裝。',
  },
  {
    short: '建造',
    title: 'Build：CAD + 製造 + 組裝',
    desc: '原型驗證 OK 後，CAD 出最終版 → CNC/銑床/3D 列印製造 → 組裝。同時電氣組接線、軟體組寫程式。',
    deliverable: 'CAD 圖（含工程圖標註）、BOM 清單、組裝程序',
    tip: '頂尖隊伍如 254 用「設計凍結」(Design Freeze)：到某個時間點所有 CAD 不再改。否則無止盡修改會吃掉所有時間。',
    warn: '不要邊組裝邊改 CAD。一定要先有完整 CAD 再開始製造。',
  },
  {
    short: '測試',
    title: 'Test：壓力測試 + 駕駛員訓練',
    desc: '不只是「能動」，要測「能持續動 100 場」。模擬比賽情境（電池低電量、被撞、game piece 卡住）。訓練駕駛員建立肌肉記憶。',
    deliverable: '測試紀錄表 + 駕駛員訓練影片 + autonomous routine 成功率',
    tip: 'Bag Day（停止製造日）前至少有 50+ practice match。Team 254 通常打 200+ 場練習賽。',
    warn: '駕駛員需要練習。從沒練過 driver 上場 = 機器人再好也沒用。',
  },
  {
    short: '迭代',
    title: 'Iterate：賽季中持續優化',
    desc: '區賽後依比賽表現改機器人。常見：加 bumper 防撞、優化 autonomous、改 manipulator 動作速度。',
    deliverable: '改機 changelog + 每場比賽的後賽檢討',
    tip: '世界錦標賽前的 1 個月「Off-season」是真正的進化期。頂尖隊伍此時做主要改機。',
    warn: '迭代不是「整台重做」。每次只改一個變因，否則無法判斷有沒有變好。',
  },
];

const flowEl = document.getElementById('edp-flow');
const detailEl = document.getElementById('step-detail');
const progressEl = document.getElementById('step-progress');
const seenSteps = new Set();
const nextBtn = document.getElementById('next-btn');

const PK = 'frc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const sp = loadP();
if (sp.module3_seen) sp.module3_seen.forEach(i => seenSteps.add(i));

STEPS.forEach((s, i) => {
  const node = document.createElement('div');
  node.className = 'edp-step';
  if (seenSteps.has(i)) node.classList.add('done');
  node.dataset.idx = i;
  node.innerHTML = `<div class="num">${i + 1}</div><h4>${s.short}</h4><p>${s.title.split('：')[0].split(' ')[0]}</p>`;
  node.addEventListener('click', () => selectStep(i));
  flowEl.appendChild(node);
});

function selectStep(i) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.edp-step').forEach((el, idx) => el.classList.toggle('active', idx === i));
  const s = STEPS[i];
  detailEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
      <div style="width:48px;height:48px;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;font-family:Inter">${i + 1}</div>
      <h3 style="margin:0">${s.title}</h3>
    </div>
    <p style="font-size:15px;line-height:1.75;color:var(--text-soft);margin-bottom:14px">${s.desc}</p>
    <div style="background:var(--primary-light);border-left:4px solid var(--primary);padding:12px 16px;border-radius:0 10px 10px 0;margin-bottom:10px">
      <strong style="color:var(--primary-dark)">📋 產出 (Deliverable)：</strong>${s.deliverable}
    </div>
    <div class="step-tip"><strong>💡 頂尖隊伍經驗：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 常見陷阱：</strong>${s.warn}</div>` : ''}
    <div style="margin-top:18px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一階段</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有階段 ✓' : '下一階段 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) { seenSteps.add(i); if (typeof SoundFX !== 'undefined') SoundFX.success(); }
  document.querySelectorAll('.edp-step')[i].classList.add('done');
  progressEl.textContent = `已學習 ${seenSteps.size} / 7 步`;
  const prog = loadP(); prog.module3_seen = Array.from(seenSteps);
  if (seenSteps.size === STEPS.length) {
    prog.module3 = true;
    nextBtn.style.opacity = 1;
    nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 七階段都學完！', 'good');
  }
  saveP(prog);
  if (i < STEPS.length - 1) selectStep(i + 1);
}

selectStep(0);
window.selectStep = selectStep;
window.markDone = markDone;
