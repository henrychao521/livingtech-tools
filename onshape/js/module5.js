// Onshape 模組 5：8 種常見草圖錯誤（依 ISO 128／129-1 重畫）＋看圖判讀挑戰
// 案例資料與繪圖在 module5-sketches.js（tests/sketch-cases.test.js 會驗證錯誤版真的有錯、正確版真的正確）
const ERRORS = window.SketchCases.CASES;
const SK = window.SketchCases;

const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

const legendEl = document.getElementById('sk-legend');
if (legendEl) legendEl.innerHTML = SK.legend();

// 渲染 8 種錯誤：上＝錯誤、下＝修正後
const gal = document.getElementById('err-gallery');
ERRORS.forEach(e => {
  const card = document.createElement('div');
  card.className = 'os-err-card';
  card.innerHTML = `
    <div class="os-err-pair">
      <figure class="os-err-panel bad"><figcaption>✗ 錯誤</figcaption>${SK.render(e, 'bad')}</figure>
      <figure class="os-err-panel good"><figcaption>✓ 修正後</figcaption>${SK.render(e, 'good')}</figure>
    </div>
    <div class="os-err-body">
      <h4>${e.name}</h4>
      <p><strong>症狀：</strong>${e.symptom}</p>
      <p><strong>原因：</strong>${e.cause}</p>
      <p class="fix"><strong>修正：</strong>${e.fix}</p>
    </div>
  `;
  gal.appendChild(card);
});

// 8 題判讀：每題顯示一張「錯誤版」草圖（不含說明文字），選出錯誤類型
const SHUFFLED_QUESTIONS = ERRORS.map(e => ({ id: e.id, q: '這張草圖（或模型）出了什麼問題？' }));
const order = SHUFFLED_QUESTIONS.map((_, i) => i);
for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
let answered = 0, correct = 0;
const quizDiv = document.getElementById('err-quiz');
const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
order.forEach((qi, n) => {
  const Q = SHUFFLED_QUESTIONS[qi], i = qi;
  const opts = shuffle(ERRORS.filter(o => o.id !== Q.id)).slice(0, 3);
  opts.push(ERRORS.find(o => o.id === Q.id));
  shuffle(opts);

  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:15px;margin:0 0 8px">${n + 1}. ${Q.q}</h4>
    <div class="os-quiz-fig">${SK.render(ERRORS.find(o => o.id === Q.id), 'bad', { quiz: true })}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px">
      ${opts.map(o => `<button class="e-opt" data-q="${i}" data-pick="${o.id}" data-correct="${Q.id}" style="background:#fafafa;border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;font-size:12.5px">${o.name}</button>`).join('')}
    </div>
    <div class="e-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:12.5px"></div>
  `;
  quizDiv.appendChild(div);
});

const answeredSet = new Set();
// 作答紀錄（js/sheet-log.js）：每題畫面只抽 4 個選項，紀錄的選項代號一律用 8 種錯誤的原始順序（A–H）；8 題答完送一筆
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: SHUFFLED_QUESTIONS.map((Q, i) => ({
  key: 'q' + i, t: 'single', stem: `看圖判斷草圖錯誤（圖例 ${i + 1}）`, options: ERRORS.map(e => e.name), answer: ERRORS.findIndex(e => e.id === Q.id) })) });
quizDiv.querySelectorAll('.e-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answeredSet.has(qIdx)) return;
    answeredSet.add(qIdx);
    const pick = btn.dataset.pick;
    const cid = btn.dataset.correct;
    const isRight = pick === cid;
    if (isRight) correct++;
    answered++;
    if (SLQ) { SLQ.answer('q' + qIdx, ERRORS.findIndex(e => e.id === pick)); if (answered === SHUFFLED_QUESTIONS.length) SLQ.finish({ score: correct, max: SHUFFLED_QUESTIONS.length }); }

    quizDiv.querySelectorAll(`.e-opt[data-q="${qIdx}"]`).forEach(b => {
      b.style.cursor = 'default';
      if (b.dataset.pick === pick) {
        b.style.background = isRight ? '#dcfce7' : '#fee2e2';
        b.style.borderColor = isRight ? '#16A34A' : '#dc2626';
      } else if (b.dataset.pick === cid) {
        b.style.background = '#ecfdf5';
        b.style.borderColor = '#16A34A';
      }
    });

    const fb = quizDiv.querySelector(`.e-fb[data-q="${qIdx}"]`);
    const correctErr = ERRORS.find(e => e.id === cid);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓' : '✗ 正解：' + correctErr.name + ' — '}${correctErr.fix}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    if (answered === SHUFFLED_QUESTIONS.length) {
      const result = document.getElementById('err-result');
      const passed = correct >= 6;
      const pct = Math.round(correct / SHUFFLED_QUESTIONS.length * 100);
      result.style.cssText = 'margin-top:14px;padding:16px;border-radius:10px;font-weight:600;text-align:center;font-size:15px';
      result.style.background = passed ? '#dcfce7' : '#fef3c7';
      result.style.color = passed ? '#14532d' : '#78350f';
      result.innerHTML = `${passed ? '🎉' : '⚠️'} 完成！答對 ${correct} / ${SHUFFLED_QUESTIONS.length} 題（${pct} 分）${passed ? '。模組 5 通過！' : '。建議重看 8 種錯誤對照後再試。'}`;

      if (passed) {
        progress.module5 = true;
        progress.module5_score = correct;
        localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
        if (typeof showToast === 'function') showToast(`🏆 模組 5 通過！${pct} 分`, 'good');
      }
    }
  });
});
