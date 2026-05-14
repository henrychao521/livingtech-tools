// Onshape 模組 6：工程識圖與動態模擬（書 Ch 5）
const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

const MEASURE_Q = [
  { q: '要測量 TT 馬達輸出軸的直徑（約 5.4mm），最適合的工具是？', opts: ['游標卡尺', '直尺', '量角器', '螺旋測微器'], correct: 0, hint: '游標卡尺可測外徑、內徑、深度，精度 0.02mm，最適合此情境。直尺精度不足。' },
  { q: '要量馬達固定孔的「孔徑」（內徑 3mm），最適合的工具是？', opts: ['直尺', '游標卡尺', '量角器', '螺旋測微器'], correct: 1, hint: '游標卡尺的內測爪可直接伸進孔測內徑。直尺無法測內徑。' },
  { q: '要量機構零件之間的「夾角」（如指尖陀螺的 120°），最適合的工具是？', opts: ['直尺', '游標卡尺', '量角器', '螺旋測微器'], correct: 2, hint: '量角器是角度測量的標準工具。' },
  { q: '要測量馬達中央軸到上表面的「深度」（7.9mm），最適合的工具是？', opts: ['直尺', '量角器', '螺旋測微器', '游標卡尺'], correct: 3, hint: '游標卡尺尾端的深度尺可伸入測量階差深度。' },
];

const MATE_Q = [
  { q: '凸輪玩具的「把手」要與「軸」永久固定，旋轉時一起轉動。應用哪種 Mate？', opts: ['緊固結合 Fastened', '旋轉結合 Revolute', '滑動結合 Slider', '相切結合 Tangent'], correct: 0, hint: '兩零件無相對運動 → 緊固結合（像強力膠黏住）。' },
  { q: '輪子要能繞著輪軸自由旋轉。應用哪種 Mate？', opts: ['緊固結合 Fastened', '旋轉結合 Revolute', '滑動結合 Slider', '球體結合 Ball'], correct: 1, hint: '繞同軸旋轉 → 旋轉結合。書 Ch 5 凸輪玩具的把手裝到傳動軸用緊固，但軸與基座之間是旋轉結合。' },
  { q: '從動件需要沿直線上下移動（凸輪頂起來、放下去）。應用哪種 Mate？', opts: ['緊固結合 Fastened', '旋轉結合 Revolute', '滑動結合 Slider', '齒輪結合 Gear'], correct: 2, hint: '沿單一直線方向移動 → 滑動結合（Slider）。' },
  { q: '基座是整個機構的「不動的參考點」。應該用什麼操作？', opts: ['緊固結合到地板', '滑動結合到原點', '不需設定', '右鍵 → 固定 Fix'], correct: 3, hint: '對基座按右鍵 → 固定（Fix），它就不會在 Assembly 中移動。書 Ch 5-3 範例第一步就是固定基座。' },
];

function renderQuiz(containerId, questions, progressField, requireCorrect, onDone) {
  const div = document.getElementById(containerId);
  if (!div) return;
  const state = { answered: new Set(), correct: 0 };
  questions.forEach((Q, i) => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
    card.innerHTML = `
      <h4 style="font-size:15px;margin:0 0 12px">${i + 1}. ${Q.q}</h4>
      ${Q.opts.map((o, j) => `<button class="q-opt" data-q="${i}" data-pick="${j}" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">${'ABCD'[j]}. ${o}</button>`).join('')}
      <div class="q-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
    `;
    div.appendChild(card);
  });

  div.querySelectorAll('.q-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const qIdx = parseInt(btn.dataset.q);
      if (state.answered.has(qIdx)) return;
      state.answered.add(qIdx);
      const pick = parseInt(btn.dataset.pick);
      const Q = questions[qIdx];
      const isRight = pick === Q.correct;
      if (isRight) state.correct++;

      div.querySelectorAll(`.q-opt[data-q="${qIdx}"]`).forEach((b, j) => {
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

      const fb = div.querySelector(`.q-fb[data-q="${qIdx}"]`);
      fb.style.display = '';
      fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
      fb.style.color = isRight ? '#14532d' : '#7f1d1d';
      fb.innerHTML = `${isRight ? '✓' : '✗'} ${Q.hint}`;

      if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

      if (state.answered.size === questions.length) {
        if (state.correct >= requireCorrect) {
          progress[progressField] = true;
          progress[progressField + '_score'] = state.correct;
          localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
          if (onDone) onDone(state.correct);
        }
        updateProgressPill();
      }
    });
  });
}

function updateProgressPill() {
  let done = 0;
  if (progress.module6_measure) done++;
  if (progress.module6_mate) done++;
  // 2 個書中內容區塊也算 (測量工具區 + Assembly 區) — 預設算已閱讀
  done += 2;
  document.getElementById('m6-pill').textContent = `已完成 ${done} / 4 項`;
  if (progress.module6_measure && progress.module6_mate) {
    progress.module6 = true;
    localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
  }
}

renderQuiz('measure-quiz', MEASURE_Q, 'module6_measure', 3, c => {
  if (typeof showToast === 'function') showToast(`🏆 測量題通過！${c}/4`, 'good');
});
renderQuiz('mate-quiz', MATE_Q, 'module6_mate', 3, c => {
  if (typeof showToast === 'function') showToast(`🏆 Mate 題通過！${c}/4`, 'good');
});
updateProgressPill();
