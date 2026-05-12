// Onshape 模組 1：認識 Onshape — 3 題小測驗
const QUIZ = [
  {
    q: 'Onshape 與其他 CAD 軟體最大的差別是？',
    options: [
      { text: 'A. 速度比較快', correct: false, hint: '速度差異不大，主要看網路。' },
      { text: 'B. 完全雲端、瀏覽器即可使用', correct: true, hint: '答對！這是 Onshape 的核心優勢。' },
      { text: 'C. 只能畫 2D 圖', correct: false, hint: 'Onshape 是 3D CAD。' },
      { text: 'D. 需要超強的顯示卡', correct: false, hint: '正好相反 — 連手機都能瀏覽。' },
    ],
  },
  {
    q: '中學生要使用 Onshape，最適合申請的方案是？',
    options: [
      { text: 'A. Professional 付費版', correct: false, hint: '太貴了，學生不需要。' },
      { text: 'B. Free Personal 個人免費版', correct: false, hint: '個人版有功能限制且檔案強制公開。' },
      { text: 'C. Education 教育版（免費）', correct: true, hint: '答對！持學校信箱可申請，功能與商用版相同。' },
      { text: 'D. 不需要申請帳號', correct: false, hint: '必須註冊才能使用。' },
    ],
  },
  {
    q: '為什麼 Onshape 可以多人同時編輯同一個檔案？',
    options: [
      { text: 'A. 因為是雲端架構', correct: true, hint: '答對！所有修改同步到雲端，所有人即時看到變更。' },
      { text: 'B. 因為支援藍牙', correct: false, hint: '不是藍牙，是雲端。' },
      { text: 'C. 因為每個人下載各自的檔案', correct: false, hint: '這樣就會分歧，不算協作。' },
      { text: 'D. 因為有 USB 連線', correct: false, hint: '不需要實體連線。' },
    ],
  },
];

const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

let score = 0;
let answered = new Set();

const container = document.getElementById('quiz-container');
QUIZ.forEach((q, i) => {
  const div = document.createElement('div');
  div.className = 'quiz-item';
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:16px;margin:0 0 12px">${i + 1}. ${q.q}</h4>
    <div class="quiz-opts">
      ${q.options.map((o, j) => `
        <button class="quiz-opt" data-q="${i}" data-opt="${j}" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">${o.text}</button>
      `).join('')}
    </div>
    <div class="quiz-feedback" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  container.appendChild(div);
});

container.querySelectorAll('.quiz-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    const optIdx = parseInt(btn.dataset.opt);
    if (answered.has(qIdx)) return;
    answered.add(qIdx);

    const opt = QUIZ[qIdx].options[optIdx];
    if (opt.correct) score++;

    // 鎖定所有此題的按鈕
    container.querySelectorAll(`.quiz-opt[data-q="${qIdx}"]`).forEach((b, j) => {
      b.style.cursor = 'default';
      const o = QUIZ[qIdx].options[j];
      if (j === optIdx) {
        b.style.background = opt.correct ? '#dcfce7' : '#fee2e2';
        b.style.borderColor = opt.correct ? '#16A34A' : '#dc2626';
        b.style.fontWeight = '700';
      } else if (o.correct) {
        b.style.background = '#ecfdf5';
        b.style.borderColor = '#16A34A';
      }
    });

    const fb = container.querySelector(`.quiz-feedback[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = opt.correct ? '#f0fdf4' : '#fef2f2';
    fb.style.color = opt.correct ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${opt.correct ? '✓' : '✗'} ${opt.hint}`;

    if (typeof SoundFX !== 'undefined') opt.correct ? SoundFX.success() : SoundFX.error();

    if (answered.size === QUIZ.length) {
      const result = document.getElementById('quiz-result');
      result.style.cssText = 'margin-top:14px;padding:16px;border-radius:10px;font-weight:600;text-align:center';
      const passed = score >= 2;
      result.style.background = passed ? '#dcfce7' : '#fef3c7';
      result.style.color = passed ? '#14532d' : '#78350f';
      result.innerHTML = `${passed ? '🎉' : '⚠️'} 完成！答對 ${score} / 3 題。${passed ? '通過模組 1。' : '建議再看一次影片後重新挑戰。'}`;

      if (passed) {
        progress.module1 = true;
        progress.module1_score = score;
        localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
        if (typeof showToast === 'function') showToast('🏆 模組 1 通過！', 'good');
      }
    }
    updateProgressText();
  });
});

function updateProgressText() {
  document.getElementById('progress-text').textContent = `已完成 ${answered.size} / ${QUIZ.length} 項`;
}
updateProgressText();
