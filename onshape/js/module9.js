// Onshape 模組 9：機電整合應用（書 Ch 8）
const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

const QUIZ = [
  { q: '改造 Arduino 三輪車為四輪時，遇到「前輪被抬起就空轉」的問題，書中建議的解法？', opts: ['改用更大的輪子', '前後車體之間加 625ZZ 軸承形成可旋轉機構', '增加車體重量', '改用履帶'], correct: 1, hint: '書 Ch 8-1 明確解法：前後車體加軸承，讓車體有「扭轉自由度」，遇地形落差時四輪能持續貼地。' },
  { q: '3D 列印自走車車體時，最該注意什麼？', opts: ['列印速度', '受力方向（層方向 vs 應力方向）', '顏色搭配', 'STL 大小'], correct: 1, hint: '書中強調「3D 列印件最脆弱處是層與層的相連處」。鏡架轉 90° 列印會斷，車體承受扭力的方向也需配合層的堆積方向。' },
  { q: '指尖陀螺中央的軸承（608ZZ）外徑是？', opts: ['8mm', '15mm', '22mm', '30mm'], correct: 2, hint: '608ZZ 標準規格：外徑 22mm、內徑 8mm、厚度 7mm。內徑 8mm 是用 M8 軸或螺絲穿過用。' },
  { q: '指尖陀螺要做三軸對稱（每軸 120°），最快的 Onshape 操作？', opts: ['手動畫三次再對齊', '畫一個軸後用「環狀複製排列」設 3 份', '用 Loft 拉伸', '用 Revolve 旋轉'], correct: 1, hint: '環狀複製排列（Circular Pattern）一鍵生 3 份，比手動畫快十倍。書中也示範可以改 5 份做五瓣陀螺。' },
];

const quizDiv = document.getElementById('mech-quiz');
const answered = new Set();
let correct = 0;

QUIZ.forEach((Q, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:15px;margin:0 0 12px">${i + 1}. ${Q.q}</h4>
    ${Q.opts.map((o, j) => `<button class="x-opt" data-q="${i}" data-pick="${j}" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">${'ABCD'[j]}. ${o}</button>`).join('')}
    <div class="x-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  quizDiv.appendChild(div);
});

quizDiv.querySelectorAll('.x-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answered.has(qIdx)) return;
    answered.add(qIdx);
    const pick = parseInt(btn.dataset.pick);
    const Q = QUIZ[qIdx];
    const isRight = pick === Q.correct;
    if (isRight) correct++;

    quizDiv.querySelectorAll(`.x-opt[data-q="${qIdx}"]`).forEach((b, j) => {
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

    const fb = quizDiv.querySelector(`.x-fb[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓' : '✗'} ${Q.hint}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    if (answered.size === QUIZ.length && correct >= 3) {
      progress.module9 = true;
      progress.module9_score = correct;
      localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
      document.getElementById('m9-pill').textContent = `已完成 2 / 2 專題 ✓`;
      if (typeof showToast === 'function') showToast(`🏆 機電整合通過！${correct}/4`, 'good');
    } else {
      const done = Math.min(2, Math.floor(answered.size / 2));
      document.getElementById('m9-pill').textContent = `已完成 ${done} / 2 專題`;
    }
  });
});
