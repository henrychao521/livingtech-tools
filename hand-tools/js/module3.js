// 基本手工具 模組 3：8 步驟
// 來源編號對應 hand-tools 頁尾「資料來源」區。
const STEPS = [
  { title: '選對工具', desc: '想清楚要做的「動作」再選工具：\n• 鎖螺絲 → 螺絲起子（看螺絲頭十/一/星）\n• 切木材 → 線鋸 / 鋼鋸\n• 修邊 → 銼刀 / 砂紙\n• 量尺寸 → 直尺 / 捲尺\n\n選錯工具是新手最常見錯誤——例如用一字起子拆十字螺絲很容易崩牙、無法再拆。', tip: '十字螺絲起子有 PH0/PH1/PH2/PH3 不同尺寸——要試到「卡進去剛剛好」（PH2 是最常見尺寸）。', cite: '[1][7]' },
  { title: '檢查工具狀態', desc: '使用前先看：\n• 鎚柄是否裂痕？\n• 銼刀是否有齒崩？\n• 刀刃是否變鈍？\n• 螺絲起子刀頭是否變形？\n• 鉗子鉸鏈是否生鏽卡澀？\n\n發現損壞工具：不要用、寫紙條警示、通報老師。', tip: '「鈍刀比利刀危險」——鈍刀切要用力，容易滑掉。', cite: '[1][8]' },
  { title: '工件固定', desc: '所有切削、鋸切、銼磨、鑽孔加工，工件必須用以下方式固定：\n• C 型夾 / F 型夾固定到工作台\n• 檯虎鉗（bench vise）\n• 大工件直接螺絲鎖工作台\n\n小工件不能徒手按——一定要夾。', tip: '夾木工件要墊薄木片防止夾痕。夾力到工件不晃就夠，過緊會壓扁工件。', cite: '[2][8]' },
  { title: '正確握姿', desc: '各工具握姿不同但有通則：\n• 鎚子 / 鋸子 / 銼刀：握把末端（增大力臂）\n• 螺絲起子 / 鉗子：握把中段（控制好）\n• 美工刀 / 雕刻刀：靠近刀刃處（精細）\n• 量測工具：兩手平行扶持\n\n握緊但不僵硬——肌肉緊繃會發抖。', tip: '長時間使用要中途放鬆休息——肌肉疲勞是傷害源頭。', cite: '[2][3]' },
  { title: '正確施力方向', desc: '力的方向是「遠離身體」最安全：\n• 鋸子推著鋸（推鋸式）\n• 銼刀推著銼（單向）\n• 美工刀切割方向遠離扶工件的手\n• 螺絲起子轉動方向順時針（鎖）\n• 扳手要「拉」而非「推」\n\n習慣後就是「武術姿勢」——身體平衡、力傳到工具。', tip: '銼刀絕對只能推著用！回拉時要抬起來，否則銼齒會被磨鈍。', cite: '[3][4][7]' },
  { title: '邊做邊監控', desc: '使用過程持續觀察：\n• 工件有沒有跑位？\n• 切到正確位置了嗎？\n• 工具有沒有發燙、變形？\n• 自己有沒有累、手痠？\n\n發現異狀立刻停下調整。「不對勁的感覺」往往是事故的前兆。', tip: '每 10 分鐘抬頭看一下整體進度——「見樹也見林」。', cite: '[1][3]' },
  { title: '收尾整理', desc: '加工接近完成時：\n• 緩慢進行最後一段（避免衝過頭）\n• 用適合的精修工具修整毛邊（銼刀、砂紙）\n• 量測檢查是否符合圖面尺寸\n\n收尾的質感決定整體成品評價。', tip: '木製品最後可用 320–400 號砂紙順木紋方向打磨，質感大幅提升。', cite: '[4][5]' },
  { title: '清潔歸位', desc: '收工時：\n1. 用毛刷掃掉工件鐵屑/木屑\n2. 用乾布擦淨工具\n3. 工具歸位到「影子板」（shadow board）原位\n4. 鎖緊櫃門 / 蓋子\n5. 清掃工作台與地面\n\n下一個同學能直接用是基本禮儀。', tip: '養成「離開前回看一眼」習慣——確認沒漏東西、地面乾淨。', cite: '[8]' },
];

const PK = 'ht_progress_v1';
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
  stepDetailEl.innerHTML = `<span class="step-step">STEP ${i + 1} / ${STEPS.length}</span><h3>${s.title}</h3><p class="step-desc">${s.desc.replace(/\n/g, '<br>')}</p>${s.tip ? `<div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>` : ''}${s.cite ? `<p style="font-size:11px;color:#94a3b8;margin-top:10px">📚 參考：${s.cite}（見頁尾資料來源）</p>` : ''}<div style="display:flex;gap:8px;margin-top:18px">${i > 0 ? `<button class="btn btn-ghost" onclick="selectStep(${i - 1})">← 上一步</button>` : ''}${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="selectStep(${i + 1})">下一步 →</button>` : '<span class="btn btn-primary" style="background:#22c55e">已完成 ✓</span>'}</div>`;
  if (!seenSteps.has(i)) {
    seenSteps.add(i); document.querySelectorAll('.step-item')[i].classList.add('seen');
    stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
    const p = loadP(); p.module3_seen = Array.from(seenSteps);
    if (seenSteps.size === STEPS.length) { p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 8 步完成！', 'good'); }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
// 排序測驗：用標準的 Interactions.SequencePuzzle API（container 而非 mountId、onComplete 而非 onPass、items 為字串陣列）
if (window.Interactions && window.Interactions.SequencePuzzle) {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map((s, i) => `${i + 1}. ${s.title}`),
    onComplete: () => { const p = loadP(); p.module3_puzzle = true; saveP(p); showToast('🧩 排序測驗通過！', 'good'); }
  });
}
