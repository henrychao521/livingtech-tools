// Onshape 模組 7：動物拼圖設計（書 Ch 6）
const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

const STEPS = [
  { icon: '🖼️', title: '匯入動物圖片', desc: '到 Onshape doc 的「+」插入新元素 → 匯入 → 選簡筆動物圖。在草圖中「插入影像」拖出矩形定位。' },
  { icon: '📏', title: '設定圖片尺寸 + 對齊', desc: '用「尺寸」工具讓圖片 = 作品實際尺寸（例 120mm）。把動物的「腳」對齊 Top 平面 — 之後才會站得穩。' },
  { icon: '✏️', title: '不規則曲線描身體', desc: 'Spline 工具沿身體外輪廓描繪。回到起點形成封閉曲線（橘色小框）才能 Extrude。彎折大的地方分段畫。' },
  { icon: '🚀', title: 'Extrude 身體厚度 3mm', desc: '選封閉曲線 → Extrude → 深度 3mm（材料厚度）→ 方向選「對稱」讓身體在中央。' },
  { icon: '🟦', title: '偏移平面 + 畫腳', desc: '右側平面右鍵 → 偏移平面 → 設 15mm。建兩個偏移平面分前後腳（雙箭頭改方向）。在偏移面上畫腳曲線，與 Top 平面相切。' },
  { icon: '📄', title: '輸出 DXF 雷射切割', desc: '建立 Drawing → 每個零件擺到圖頁 → 右鍵匯出 → 格式 DXF → 送雷射切割機。' },
];

const QUIZ = [
  { q: '匯入動物圖片後發現比例不對（太小），下一步該？', opts: ['重新匯入', '用「尺寸」工具設定目標尺寸（如 120mm）', '直接 Extrude 看看', '重畫'], correct: 1, hint: '用「尺寸」工具就能精準設定圖片大小，不必重新匯入。' },
  { q: '描完動物身體輪廓後 Extrude 失敗，提示「No closed region」，最可能原因？', opts: ['圖片解析度太低', '曲線沒回到起點（不封閉）', '材料厚度太薄', 'Onshape 過期'], correct: 1, hint: '不規則曲線必須回到起始點形成封閉曲線（橘色小框框），才能擠出立體物件。' },
  { q: '畫腳時希望腳底是平的（拼圖能站穩），需要對腳曲線設什麼條件？', opts: ['與 Front 平面平行', '與 Right 平面相切', '與 Top 平面相切', '與身體曲線相切'], correct: 2, hint: 'Top 平面就是「地面」。曲線與 Top 相切，腳底就會剛好貼地。' },
  { q: '前後兩隻腳要分開列印（雷射切割兩片），最好用什麼方式建立兩個草圖平面？', opts: ['畫在同一平面再分離', '偏移平面（Offset Plane）建立兩個不同 z 位置的平面', '用 Loft 連接', '不可能做到'], correct: 1, hint: '偏移平面是 Onshape 的標準做法。書中設定 ±15mm 偏移，兩腳就有前後距離。' },
  { q: '要把拼圖送到雷射切割機，應該匯出什麼格式？', opts: ['STL（3D 列印用）', 'DXF（2D 雷射切割用）', 'PDF（文件用）', 'OBJ（動畫用）'], correct: 1, hint: 'DXF 是 2D 向量圖檔，雷射切割機標準輸入格式。STL 是 3D 列印用。' },
];

// 渲染 6 步驟卡片
const grid = document.getElementById('puzzle-steps');
let viewed = new Set(progress.module7_steps || []);
STEPS.forEach((s, i) => {
  const card = document.createElement('div');
  card.className = 'os-step';
  card.style.cursor = 'pointer';
  card.innerHTML = `
    <div class="os-num">${i + 1}</div>
    <div style="font-size:32px;margin:14px 0 8px">${s.icon}</div>
    <h4>${s.title}</h4>
    <p>${s.desc}</p>
  `;
  card.addEventListener('click', () => {
    viewed.add(i);
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'var(--primary-light)';
    progress.module7_steps = Array.from(viewed);
    localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
    updatePill();
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
  if (viewed.has(i)) {
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'var(--primary-light)';
  }
  grid.appendChild(card);
});

// 測驗
const quizDiv = document.getElementById('puzzle-quiz');
const answeredSet = new Set();
let correctCount = 0;
QUIZ.forEach((Q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:15px;margin:0 0 12px">${i + 1}. ${Q.q}</h4>
    ${Q.opts.map((o, j) => `<button class="p-opt" data-q="${i}" data-pick="${j}" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">${'ABCD'[j]}. ${o}</button>`).join('')}
    <div class="p-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  quizDiv.appendChild(div);
});

quizDiv.querySelectorAll('.p-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answeredSet.has(qIdx)) return;
    answeredSet.add(qIdx);
    const pick = parseInt(btn.dataset.pick);
    const Q = QUIZ[qIdx];
    const isRight = pick === Q.correct;
    if (isRight) correctCount++;

    quizDiv.querySelectorAll(`.p-opt[data-q="${qIdx}"]`).forEach((b, j) => {
      b.style.cursor = 'default';
      if (j === pick) {
        b.style.background = isRight ? '#dcfce7' : '#fee2e2';
        b.style.borderColor = isRight ? '#16A34A' : '#dc2626';
        b.style.fontWeight = '700';
      } else if (j === Q.correct) {
        b.style.background = '#ecfdf5';
        b.style.borderColor = '#16A34A';
      }
    });

    const fb = quizDiv.querySelector(`.p-fb[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓' : '✗'} ${Q.hint}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    if (answeredSet.size === QUIZ.length && correctCount >= 4) {
      progress.module7_quiz = true;
      progress.module7_score = correctCount;
      localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
      if (typeof showToast === 'function') showToast(`🏆 拼圖測驗通過！${correctCount}/5`, 'good');
    }
    updatePill();
  });
});

function updatePill() {
  const done = viewed.size; // 6 步驟
  document.getElementById('m7-pill').textContent = `已完成 ${done} / 6 步`;
  if (done === STEPS.length && progress.module7_quiz) {
    progress.module7 = true;
    localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
  }
}
updatePill();
