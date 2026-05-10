// 3D 印表機 模組 3：列印流程
const STEPS = [
  { title: '建模 / 取得 STL', desc: '從 Tinkercad、Fusion 360、Blender 等軟體匯出 STL 檔案，或從 Thingiverse、Printables 下載現成模型。', tip: 'STL 檔本身沒有顏色與材質資訊，只記錄三角面。', warn: null, icon: '📐' },
  { title: '匯入切片軟體', desc: '常用切片軟體：Cura（免費）、PrusaSlicer（免費）、Bambu Studio。把 STL 拖入軟體，選擇你的印表機型號。', tip: '確認模型擺放方向：底面要平、避免懸空。', warn: null, icon: '💻' },
  { title: '調整切片參數', desc: '層厚（0.2mm 標準）、填充密度（15–20% 一般、80%+ 結構件）、列印速度（50–100mm/s）、支撐（懸空角度 > 45° 才需要）。', tip: '初學者：使用內建「PLA 標準」配置即可。', warn: null, icon: '⚙️' },
  { title: '匯出 G-code', desc: '切片完成後匯出 .gcode 檔，存到 SD 卡或透過 Wi-Fi / USB 傳給印表機。預估時間和耗材重量會顯示在切片軟體中。', tip: '檔名要避免中文與空格，部分機型不認得。', warn: null, icon: '📤' },
  { title: '熱床校正', desc: '預熱熱床到列印溫度 → 將噴頭手動移到四角 → 用 A4 紙確認摩擦阻力 → 微調螺絲。某些機型有自動調平。', tip: 'A4 紙能略微通過、有阻力是最佳距離（約 0.1mm）。', warn: '校正不準是「首層失敗」最大原因。', icon: '📏' },
  { title: '預熱噴頭與熱床', desc: 'PLA：噴頭 200°C / 熱床 60°C\nPETG：噴頭 240°C / 熱床 80°C\nABS：噴頭 250°C / 熱床 100°C', tip: '可在切片時順便預熱，等到列印開始溫度也達標。', warn: null, icon: '🔥' },
  { title: '開始列印 ＆ 觀察首層', desc: '前 3–5 層是關鍵。守在機台旁觀察：絲線有沒有黏熱床？有沒有跑位？有沒有跳針（漏層）？', tip: '首層 OK 後就可以放心離開（但仍要定期巡視）。', warn: null, icon: '▶️' },
  { title: '取件 ＆ 後處理', desc: '等熱床冷卻到 < 40°C → 用鏟刀斜插底部撬起 → 移除支撐結構 → 用銼刀或砂紙修平接縫 → 必要時噴漆/上色。', tip: 'PLA 物件可以用鋁箔紙打磨表面變光亮。', warn: '熱床還燙的時候強拔會傷模型也傷熱床。', icon: '✨' },
];

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const seenSteps = new Set();
const PK = 'printer3d_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const sp = loadP();
if (sp.module3_seen) sp.module3_seen.forEach(i => seenSteps.add(i));

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item';
  if (seenSteps.has(i)) item.classList.add('done');
  item.innerHTML = `<div class="num">${i + 1}</div><div class="step-title">${s.title}</div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.step-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
  const s = STEPS[i];
  stepDetailEl.innerHTML = `
    <div class="step-num">STEP ${String(i + 1).padStart(2, '0')} / 08</div>
    <h3>${s.title}</h3>
    <div class="step-anim" style="display:flex;align-items:center;justify-content:center;font-size:84px">${s.icon}</div>
    <p style="white-space:pre-line">${s.desc}</p>
    <div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 注意：</strong>${s.warn}</div>` : ''}
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一步</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有步驟 ✓' : '下一步 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) { seenSteps.add(i); if (typeof SoundFX !== 'undefined') SoundFX.success(); }
  document.querySelectorAll('.step-item')[i].classList.add('done');
  stepProgressEl.textContent = `已學習 ${seenSteps.size} / 8 步`;
  const prog = loadP(); prog.module3_seen = Array.from(seenSteps);
  if (seenSteps.size === STEPS.length) {
    prog.module3 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 八步完成！', 'good');
  }
  saveP(prog);
  if (i < STEPS.length - 1) selectStep(i + 1);
}
selectStep(0);
window.selectStep = selectStep; window.markDone = markDone;
