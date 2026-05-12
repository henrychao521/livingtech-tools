// Onshape 模組 10：行動學習 + 齒輪機構
const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

const QUIZ = [
  {
    q: '在教室畫好一個 3D 模型，回家想用手機繼續調整尺寸，可行嗎？',
    opts: ['不行，必須回學校用桌面版', '可以，Onshape App 同步同一個 doc', '需要先匯出 STL 才能在 App 看', '只能用 iPad，不能用手機'],
    correct: 1,
    hint: 'Onshape 是全雲端架構，App 和桌面瀏覽器存取同一份 doc，任何裝置修改都即時同步。',
  },
  {
    q: '想在手機 App 上做完整工程圖（Drawing），可以嗎？',
    opts: ['完全可以，跟桌面一樣', '只能瀏覽，不能編輯', '需要付費版才能用', 'iOS 可以、Android 不行'],
    correct: 1,
    hint: 'App 的 Drawing 模式目前只支援瀏覽，編輯仍需回桌面版。這是少數 App 限制之一。',
  },
  {
    q: '兩個齒輪能嚙合的「關鍵共同參數」是？',
    opts: ['齒數要相同', '模數（m）要相同', '直徑要相同', '材料要相同'],
    correct: 1,
    hint: '模數 m 是齒輪的「尺度單位」。同 m 的齒輪才能嚙合，齒數不同只是傳動比不同。',
  },
  {
    q: '兩齒輪 m = 1，z₁ = 20、z₂ = 40，組裝時兩軸心距離應該是？',
    opts: ['20mm', '30mm', '40mm', '60mm'],
    correct: 1,
    hint: '中心距 a = m × (z₁ + z₂) / 2 = 1 × 60 / 2 = 30mm。',
  },
  {
    q: 'Onshape 要讓兩齒輪「按播放就會嚙合轉動」，應該用哪種 Mate？',
    opts: ['緊固結合 Fastened', '旋轉結合 Revolute（兩個各自旋轉）', '齒輪結合 Gear（連動）', '滑動結合 Slider'],
    correct: 2,
    hint: 'Gear Mate 是專為齒輪設計的特殊 mate，會依據齒數比自動連動兩齒輪的旋轉速度。書中影片即示範此操作。',
  },
];

const quizDiv = document.getElementById('m10-quiz');
const answered = new Set();
let correct = 0;

QUIZ.forEach((Q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:15px;margin:0 0 12px">${i + 1}. ${Q.q}</h4>
    ${Q.opts.map((o, j) => `<button class="m10-opt" data-q="${i}" data-pick="${j}" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">${'ABCD'[j]}. ${o}</button>`).join('')}
    <div class="m10-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  quizDiv.appendChild(div);
});

quizDiv.querySelectorAll('.m10-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answered.has(qIdx)) return;
    answered.add(qIdx);
    const pick = parseInt(btn.dataset.pick);
    const Q = QUIZ[qIdx];
    const isRight = pick === Q.correct;
    if (isRight) correct++;

    quizDiv.querySelectorAll(`.m10-opt[data-q="${qIdx}"]`).forEach((b, j) => {
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

    const fb = quizDiv.querySelector(`.m10-fb[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓' : '✗'} ${Q.hint}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    document.getElementById('m10-pill').textContent = `已完成 ${Math.min(4, answered.size)} / 4 項`;

    if (answered.size === QUIZ.length && correct >= 4) {
      progress.module10 = true;
      progress.module10_score = correct;
      localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
      if (typeof showToast === 'function') showToast(`🏆 行動學習 + 齒輪通過！${correct}/5`, 'good');
    }
  });
});
