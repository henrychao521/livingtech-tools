// Onshape 模組 5：8 種草圖 / 特徵錯誤 + 判讀挑戰
const ERRORS = [
  {
    id: 'open',
    name: '草圖未封閉',
    symptom: 'Extrude 顯示「No closed region」或只能用 thin（薄壁）模式',
    cause: '線段端點沒接合，留下肉眼難察的縫隙。',
    fix: '進入草圖 → 用 Trim / Extend 工具補齊；或選 thin extrude 模式（指定壁厚）。',
    svg: `<svg viewBox="0 0 120 80"><rect x="20" y="15" width="50" height="40" fill="none" stroke="#dc2626" stroke-width="2"/><path d="M 70 15 L 90 15" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2"/><circle cx="85" cy="15" r="4" fill="none" stroke="#dc2626" stroke-width="2"/><text x="100" y="20" font-size="8" fill="#dc2626">缺口</text></svg>`,
  },
  {
    id: 'over',
    name: '過度約束（Over-defined）',
    symptom: '草圖線變紅色 + 出現「Cannot satisfy constraints」警告',
    cause: '加了互相衝突的尺寸 / 約束。例如同一條線同時標 50mm 和 60mm。',
    fix: '在 feature tree 看 Over-Defined 標記 → 刪除多餘約束/尺寸。',
    svg: `<svg viewBox="0 0 120 80"><line x1="20" y1="40" x2="100" y2="40" stroke="#dc2626" stroke-width="3"/><text x="60" y="30" text-anchor="middle" font-size="9" fill="#dc2626">50mm</text><text x="60" y="60" text-anchor="middle" font-size="9" fill="#dc2626">60mm ⚠</text></svg>`,
  },
  {
    id: 'under',
    name: '約束不足（Under-defined）',
    symptom: '線段是藍色（可拖動），尺寸看起來會跑掉',
    cause: '少了關鍵約束。藍線雖然能 extrude，但日後改尺寸時形狀會跑位。',
    fix: '加水平 / 垂直 / 等長等約束 → 標所有關鍵尺寸 → 直到全部變黑色。',
    svg: `<svg viewBox="0 0 120 80"><polygon points="25,55 50,20 90,30 100,60 60,65" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="3 2"/><text x="60" y="78" text-anchor="middle" font-size="9" fill="#3b82f6">藍色 = 可動</text></svg>`,
  },
  {
    id: 'self-intersect',
    name: '草圖自交（Self-intersecting）',
    symptom: 'Extrude 失敗，提示「Region cannot self-intersect」',
    cause: '輪廓線交叉成 8 字型或內部有額外的線。',
    fix: '檢查輪廓 → 刪除多餘交叉線 → 確認是「簡單封閉曲線」。',
    svg: `<svg viewBox="0 0 120 80"><path d="M 30 20 L 90 60 L 30 60 L 90 20 L 30 20" fill="none" stroke="#dc2626" stroke-width="2"/><circle cx="60" cy="40" r="3" fill="#dc2626"/></svg>`,
  },
  {
    id: 'wrong-plane',
    name: '選錯基準平面',
    symptom: '擠出方向出乎預料（往側面、往上下，與設計不符）',
    cause: '在 Front 平面畫了俯視草圖，或在 Top 畫了側視草圖。',
    fix: '檢查 feature tree → 雙擊草圖右鍵 → Edit reference plane 改到對的平面。',
    svg: `<svg viewBox="0 0 120 80"><rect x="20" y="20" width="30" height="40" fill="#fbbf24" opacity=".4" stroke="#92400e"/><text x="35" y="44" text-anchor="middle" font-size="8" fill="#92400e">Front</text><polygon points="55,30 75,15 105,15 85,30" fill="#a78bfa" opacity=".5" stroke="#7c3aed"/><text x="80" y="26" text-anchor="middle" font-size="7" fill="#7c3aed">Top</text><text x="60" y="75" text-anchor="middle" font-size="9" fill="#dc2626">⚠ 選錯方向會跑位</text></svg>`,
  },
  {
    id: 'fillet-too-big',
    name: '圓角半徑過大',
    symptom: 'Fillet 提示「Failed to fillet edge」或圓角穿透到別的邊',
    cause: '半徑大於可填空間（例如在 10mm 邊上做 8mm 圓角）。',
    fix: '減小圓角半徑（建議 ≤ 邊長的 30%）；或先把相鄰特徵改大。',
    svg: `<svg viewBox="0 0 120 80"><rect x="30" y="20" width="60" height="40" rx="22" fill="#fee2e2" stroke="#dc2626"/><text x="60" y="44" text-anchor="middle" font-size="9" fill="#dc2626">R 過大</text></svg>`,
  },
  {
    id: 'shell-thick',
    name: '薄殼厚度太厚',
    symptom: 'Shell 失敗，提示「Failed to thicken」',
    cause: '指定厚度大於物件最小尺寸的一半（例：3mm 厚的板要做 2mm shell）。',
    fix: '減小厚度（一般建議 ≤ 最小尺寸的 30%）；或改用 Subtract（布林減）。',
    svg: `<svg viewBox="0 0 120 80"><rect x="30" y="20" width="60" height="40" fill="#fbbf24" stroke="#92400e"/><rect x="40" y="30" width="40" height="20" fill="#fff" stroke="#92400e" stroke-dasharray="2 1"/><text x="60" y="75" text-anchor="middle" font-size="9" fill="#dc2626">厚度 > 容許範圍</text></svg>`,
  },
  {
    id: 'loft-mismatch',
    name: '疊層拉伸缺中間切片',
    symptom: 'Loft 結果扭曲、形狀錯誤',
    cause: '上下兩個草圖差異太大，沒在中間加引導切片，Loft 自動連線會繞奇怪路徑。',
    fix: '在中間平面加額外草圖（過渡輪廓）→ 或加 guide curves 指引曲線走向。',
    svg: `<svg viewBox="0 0 120 80"><circle cx="30" cy="40" r="12" fill="none" stroke="#16A34A" stroke-width="1.5"/><circle cx="90" cy="40" r="18" fill="none" stroke="#16A34A" stroke-width="1.5"/><path d="M 42 30 Q 50 50 78 30 M 42 50 Q 50 30 78 50" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/><text x="60" y="75" text-anchor="middle" font-size="9" fill="#dc2626">⚠ 扭曲</text></svg>`,
  },
];

const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }

// 渲染 8 種錯誤
const gal = document.getElementById('err-gallery');
ERRORS.forEach(e => {
  const card = document.createElement('div');
  card.className = 'os-err-card';
  card.innerHTML = `
    <div class="os-err-visual">${e.svg}</div>
    <div class="os-err-body">
      <span class="os-err-tag">✗ ${e.name}</span>
      <h4>${e.name}</h4>
      <p><strong>症狀：</strong>${e.symptom}</p>
      <p><strong>原因：</strong>${e.cause}</p>
      <p class="fix"><strong>修正：</strong>${e.fix}</p>
    </div>
  `;
  gal.appendChild(card);
});

// 8 題判讀
const SHUFFLED_QUESTIONS = [
  { id: 'open', q: '畫了矩形但 extrude 提示 No closed region，可能是？' },
  { id: 'over', q: '草圖某條線變紅、出現「無法滿足約束」，這是？' },
  { id: 'under', q: '草圖線都是藍色、可以用滑鼠拖動位置，是？' },
  { id: 'self-intersect', q: '輪廓畫成 8 字型，extrude 提示自交錯誤，是？' },
  { id: 'wrong-plane', q: 'extrude 方向跑到側面，與設計預期不同，是？' },
  { id: 'fillet-too-big', q: 'Fillet 提示「Failed to fillet edge」，可能是？' },
  { id: 'shell-thick', q: 'Shell 提示「Failed to thicken」，可能是？' },
  { id: 'loft-mismatch', q: 'Loft 結果扭曲變形，是？' },
];

let answered = 0, correct = 0;
const quizDiv = document.getElementById('err-quiz');
SHUFFLED_QUESTIONS.forEach((Q, i) => {
  const opts = [...ERRORS].sort(() => Math.random() - 0.5).slice(0, 4);
  if (!opts.find(o => o.id === Q.id)) opts[0] = ERRORS.find(o => o.id === Q.id);
  opts.sort(() => Math.random() - 0.5);

  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:15px;margin:0 0 10px">${i + 1}. ${Q.q}</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px">
      ${opts.map(o => `<button class="e-opt" data-q="${i}" data-pick="${o.id}" data-correct="${Q.id}" style="background:#fafafa;border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;font-size:12.5px">${o.name}</button>`).join('')}
    </div>
    <div class="e-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:12.5px"></div>
  `;
  quizDiv.appendChild(div);
});

const answeredSet = new Set();
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
