// Onshape 模組 8：從模型到實體（書 Ch 7）
const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

const QUIZ = [
  { q: '要做一個「內含空腔的造型公仔」（裡面有複雜支撐結構），最適合的加工方式？', opts: ['3D 列印', '雷射切割', 'CNC 雕刻', '射出成型'], correct: 0, hint: '3D 列印是加法製造，能做任意複雜內部結構（含中空、有機曲面）。雷射只能 2D，CNC 無法做完全中空。' },
  { q: '要做「100 片 3mm 厚的小卡片」當教具，最快又最便宜的方式？', opts: ['3D 列印', '雷射切割', 'CNC 雕刻', '手工剪'], correct: 1, hint: '雷射切割對於薄板狀、大量重複的零件最快（一張板可同時切多片）。3D 列印 100 片要花一整天。' },
  { q: '要做「需要承受機構應力的高強度零件」（例如 FRC 機器人結構件），最佳選擇？', opts: ['3D 列印', '雷射切割', 'CNC 雕刻', '手工製作'], correct: 2, hint: 'CNC 從單一塊材銑出，沒有 3D 列印的層間弱點，強度最高。雷射只能薄板。' },
  { q: 'Onshape 要把零件送到 3D 印表機，匯出格式應該選？', opts: ['STL', 'DXF', 'PDF', 'OBJ'], correct: 0, hint: 'STL 是 3D 列印業界標準。記得勾「將獨特的零件匯出成個別檔案」。' },
  { q: 'Onshape 要把零件送到雷射切割機，匯出格式應該選？', opts: ['STL', 'DXF', 'PDF', 'GCODE'], correct: 1, hint: 'DXF 是 2D 向量格式，雷射切割機標準輸入。需要先建 Drawing（工程圖）才能匯出 DXF。' },
];

const quizDiv = document.getElementById('craft-quiz');
const answered = new Set();
let correct = 0;

QUIZ.forEach((Q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:15px;margin:0 0 12px">${i + 1}. ${Q.q}</h4>
    ${Q.opts.map((o, j) => `<button class="c-opt" data-q="${i}" data-pick="${j}" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">${'ABCD'[j]}. ${o}</button>`).join('')}
    <div class="c-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  quizDiv.appendChild(div);
});

quizDiv.querySelectorAll('.c-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answered.has(qIdx)) return;
    answered.add(qIdx);
    const pick = parseInt(btn.dataset.pick);
    const Q = QUIZ[qIdx];
    const isRight = pick === Q.correct;
    if (isRight) correct++;

    quizDiv.querySelectorAll(`.c-opt[data-q="${qIdx}"]`).forEach((b, j) => {
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

    const fb = quizDiv.querySelector(`.c-fb[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓' : '✗'} ${Q.hint}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    document.getElementById('m8-pill').textContent = `已完成 ${Math.min(answered.size, 3)} / 3 關`;

    if (answered.size === QUIZ.length && correct >= 4) {
      progress.module8 = true;
      progress.module8_score = correct;
      localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
      if (typeof showToast === 'function') showToast(`🏆 加工選擇題通過！${correct}/5`, 'good');
    }
  });
});
