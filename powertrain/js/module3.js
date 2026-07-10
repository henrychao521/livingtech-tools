// 動力與運輸 模組 3：太陽能動力車 8 步驟
const STEPS = [
  { title: '需求分析與設計目標', desc: '決定車子大小（A4 紙範圍）、目標距離（5m 直線）、目標速度（看比賽規則）。\n太陽能板尺寸是限制（常用 6V 100mA × 2 片）。', tip: '先看比賽規則再設計——尺寸超限就無效。' },
  { title: '繪製設計草圖', desc: '畫出車輛側視、上視、後視三視圖。標明：\n• 太陽能板位置（要朝上）\n• 馬達位置（後輪驅動較穩）\n• 齒輪傳動位置\n• 輪子位置與大小', tip: '車身重心要低、馬達要對齊轉軸，否則跑歪。' },
  { title: '選擇馬達與電池規格', desc: '小馬達常用 130 號或 260 號 DC 馬達（3-6V）。\n• 高速低扭：130 馬達 + 小齒輪 + 大輪 → 速度快\n• 低速高扭：260 馬達 + 大齒輪 + 小輪 → 上坡爬', tip: '太陽能板電流只有 100mA，馬達太大會「轉不動」要先測試。' },
  { title: '計算齒輪比與輪徑', desc: '齒輪比 = 輪軸齒數 ÷ 馬達齒數\n速度 = (馬達 RPM ÷ 齒輪比) × 輪周長\n例：5000 RPM ÷ 4 倍 × 0.2m = 250 m/min ≈ 4 m/s', tip: '比賽要的是 5m 內加速到最快——齒輪比 3-5 倍最常見。' },
  { title: '製作車身結構', desc: '材料：保麗龍板、瓦楞紙板、巴沙木、3D 列印件\n要求：輕量化（< 50g 車身）、強度足夠承受輪軸轉動力、平面要平整給太陽能板貼。', tip: '輪軸軸承用塑膠管或滾珠軸承——車身鑽孔的摩擦太大，車跑不快。' },
  { title: '組裝動力系統', desc: '步驟：\n1. 馬達用熱熔膠固定到車身\n2. 馬達軸裝小齒輪\n3. 後輪軸裝大齒輪（要與小齒輪嚙合）\n4. 太陽能板用導線接馬達（+/-）\n5. 加開關控制', tip: '齒輪嚙合要剛好——太緊轉不動、太鬆會打滑。試 3 次找最佳位置。' },
  { title: '室內測試與調整', desc: '用桌燈或台燈照射太陽能板（要近，1-2 cm）測試：\n• 車輪有沒有正常轉？\n• 走直線還是偏一邊？\n• 加速順不順？\n依結果調整齒輪嚙合、車身對稱性、馬達固定。', tip: '室內測試燈光遠不夠亮——馬達可能轉不起來。可改用 3V 鈕釦電池暫代測試。' },
  { title: '戶外實測 + 成果發表', desc: '陽光下做最終測試。記錄：\n• 加速時間（0 → 5m 多久）\n• 最高速\n• 直線性\n• 太陽能板朝向影響\n\n發表時除展示車輛，講設計選擇（為何選此馬達 / 齒比 / 輪徑）。', tip: '陰天電流降到一半——比賽日如果陰天，車跑得會比練習時慢。' },
];

const PK = 'pt_progress_v1';
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
    if (seenSteps.size === STEPS.length) { p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 8 步驟完成！', 'good'); }
    saveP(p);
  }
}
window.selectStep = selectStep;
selectStep(0);
stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
if (typeof SequencePuzzle === 'function') SequencePuzzle({ mountId: 'seq-puzzle', items: STEPS.map((s, i) => ({ id: i, label: `${i + 1}. ${s.title}` })), onPass: () => { const p = loadP(); p.module3_puzzle = true; saveP(p); showToast('🧩 排序通過！', 'good'); } });
