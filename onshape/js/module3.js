// Onshape 模組 3：草圖到特徵 8 步驟 + 排序拼圖
const STEPS = [
  {
    title: '建立 Document',
    icon: '📄',
    desc: '登入 Onshape → 點 Create → 命名（如「練習01」）→ 進入空白 Document。',
    tip: 'Document 是 Onshape 的最小檔案單位，包含 Part Studio、Assembly、Drawing 等。',
  },
  {
    title: '進入 Part Studio',
    icon: '🎨',
    desc: 'Document 內預設已有 Part Studio。這裡是畫零件的主舞台，三大平面（Front / Top / Right）已預先建好。',
    tip: 'Part Studio 名稱可改。一個 Document 可以有多個 Part Studio。',
  },
  {
    title: '選擇基準平面',
    icon: '🟦',
    desc: '在 feature tree（左側）點選 Front / Top / Right 之一。這決定草圖將「畫在哪個方向」。',
    tip: '初學者建議用 Top（俯視）— 後續擠出方向自然往上。',
  },
  {
    title: '開草圖（Sketch）',
    icon: '✏️',
    desc: '點工具列 Sketch 按鈕 → 系統把選好的平面轉正對著你 → 進入草圖編輯模式。',
    tip: '畫面右上會顯示橘色「Sketch」字樣，表示在草圖模式。',
  },
  {
    title: '畫圖形',
    icon: '📐',
    desc: '用 Line（線）、Rectangle（矩形）、Circle（圓）等工具畫出輪廓。線段端點靠近會自動 snap。',
    tip: '繪製時可先粗略畫，再用步驟 6 的尺寸標註修正精確值。',
  },
  {
    title: '加約束 + 標尺寸',
    icon: '📏',
    desc: '用 Dimension 標尺寸（如長 50mm）、加水平 / 垂直 / 平行等約束。當所有線都變成<strong>黑色</strong>就是「完全定義」。',
    tip: '藍色 = 未完全定義（可拖動）、黑色 = 已定義、紅色 = 過度約束（有衝突）。',
  },
  {
    title: '退出草圖',
    icon: '↩️',
    desc: '按右上角的綠色勾勾（✓）關閉草圖，回到 3D 視角。草圖會出現在 feature tree。',
    tip: '退出後仍可雙擊 feature tree 中的草圖名稱重新進入編輯。',
  },
  {
    title: '套用特徵（Extrude）',
    icon: '🚀',
    desc: '選中剛才的草圖 → 點 Extrude（擠出）→ 輸入深度（如 10mm）→ 預覽 → 確認。3D 物件誕生！',
    tip: 'Extrude 方向可選正向 / 反向 / 雙向。深度負值會往草圖另一側擠出。',
  },
];

const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }
let viewed = new Set(progress.module3_steps || []);

// 渲染 8 步驟卡片
const grid = document.getElementById('step-cards');
STEPS.forEach((s, i) => {
  const card = document.createElement('div');
  card.className = 'os-step';
  card.dataset.idx = i;
  card.innerHTML = `
    <div class="os-num">${i + 1}</div>
    <div style="font-size:32px;margin:14px 0 8px">${s.icon}</div>
    <h4>${s.title}</h4>
    <p>${s.desc}</p>
    <p style="margin-top:6px;font-size:11px;color:var(--text-muted);font-style:italic">💡 ${s.tip}</p>
  `;
  card.addEventListener('click', () => {
    viewed.add(i);
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'var(--primary-light)';
    progress.module3_steps = Array.from(viewed);
    if (viewed.size === STEPS.length) {
      progress.module3 = true;
      if (typeof showToast === 'function') showToast('🏆 8 步驟全部看完！', 'good');
    }
    localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
    document.getElementById('step-progress').textContent = `已學習 ${viewed.size} / 8 步`;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
  if (viewed.has(i)) {
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'var(--primary-light)';
  }
  grid.appendChild(card);
});
document.getElementById('step-progress').textContent = `已學習 ${viewed.size} / 8 步`;

// 步驟排序拼圖
if (typeof Interactions !== 'undefined') {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map(s => s.title),
    title: '把打亂的 8 步驟排回正確順序',
    onComplete: () => {
      progress.module3_puzzle = true;
      localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
      if (typeof showToast === 'function') showToast('🏆 排序測驗通過！', 'good');
    },
  });
}
