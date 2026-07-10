// Onshape 模組 2：安全與帳號規範闖關
const SCENARIOS = [
  {
    q: '同學申請了 Free Personal 帳號，存了自己的科展作品圖檔。下面哪個做法比較好？',
    a: '請老師幫忙申請 Education 方案後遷移到私人 doc，避免作品提前曝光',
    b: '繼續用 Free Personal，反正只是學生作品',
    correct: 'a',
    explain: 'Free Personal 強制全部 public，任何人都能搜到。科展作品在比賽前曝光可能影響評分公平性。Education 帳號免費且可設定私人 doc。',
  },
  {
    q: '在 Onshape 看到一個 fork 過來的設計，覺得很棒想當作自己的作品交，可以嗎？',
    a: '直接改成自己的名字，反正是 fork',
    b: '可以，但要在文件說明欄註明原作者，並做出顯著的修改',
    correct: 'b',
    explain: 'Onshape 的開源精神鼓勵 fork，但學術倫理要求注明來源。沒做出有意義的修改而當作自己的作品是抄襲。',
  },
  {
    q: '老師要把全班的 doc 集中管理，最好的做法是？',
    a: '由老師建立班級共享資料夾，把學生 doc 集中管理',
    b: '請學生把 doc 設成 public 並把連結貼到 LINE',
    correct: 'a',
    explain: '教育版可透過共享資料夾集中管理學生作品、不影響隱私（進階的班級管理與評分分析屬付費的 Education Enterprise）。把 doc 設 public 並貼到群組會讓全球都看得到，並有外洩個資風險。',
  },
  {
    q: '在 Onshape doc 的設計樹（feature tree）中，看到陌生人加入並開始改你的草圖，該怎麼做？',
    a: '先觀察他在改什麼，反正可以還原',
    b: '檢查 doc 的 share 設定、把不認識的人移除，並改為 link-only access',
    correct: 'b',
    explain: '雲端協作的副作用：分享設定不嚴格會被陌生人加入。應立刻檢查 share 權限。Onshape 有「版本」可還原，但即時編輯時對方可能看到敏感內容。',
  },
];

const OS_PROGRESS_KEY = 'onshape_progress_v1';
let progress; try { progress = JSON.parse(localStorage.getItem(OS_PROGRESS_KEY)) || {}; } catch { progress = {}; }
let passed = 0;
let answered = new Set();

const container = document.getElementById('safety-quiz');
SCENARIOS.forEach((s, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <h4 style="font-size:16px;margin:0 0 12px">${i + 1}. ${s.q}</h4>
    <button class="sc-opt" data-q="${i}" data-pick="a" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">A. ${s.a}</button>
    <button class="sc-opt" data-q="${i}" data-pick="b" style="display:block;width:100%;text-align:left;background:#fafafa;border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:6px;cursor:pointer;font-size:14px">B. ${s.b}</button>
    <div class="sc-fb" data-q="${i}" style="display:none;margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
  `;
  container.appendChild(div);
});

container.querySelectorAll('.sc-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const qIdx = parseInt(btn.dataset.q);
    if (answered.has(qIdx)) return;
    answered.add(qIdx);
    const pick = btn.dataset.pick;
    const correct = SCENARIOS[qIdx].correct;
    const isRight = pick === correct;
    if (isRight) passed++;

    container.querySelectorAll(`.sc-opt[data-q="${qIdx}"]`).forEach(b => {
      const p = b.dataset.pick;
      b.style.cursor = 'default';
      if (p === pick) {
        b.style.background = isRight ? '#dcfce7' : '#fee2e2';
        b.style.borderColor = isRight ? '#16A34A' : '#dc2626';
        b.style.fontWeight = '700';
      } else if (p === correct) {
        b.style.background = '#ecfdf5';
        b.style.borderColor = '#16A34A';
      }
    });

    const fb = container.querySelector(`.sc-fb[data-q="${qIdx}"]`);
    fb.style.display = '';
    fb.style.background = isRight ? '#f0fdf4' : '#fef2f2';
    fb.style.color = isRight ? '#14532d' : '#7f1d1d';
    fb.innerHTML = `${isRight ? '✓ 正確' : '✗ 不夠安全'}：${SCENARIOS[qIdx].explain}`;

    if (typeof SoundFX !== 'undefined') isRight ? SoundFX.success() : SoundFX.error();

    document.getElementById('safety-progress').textContent = `已過 ${passed} / ${SCENARIOS.length} 題`;

    if (answered.size === SCENARIOS.length && passed === SCENARIOS.length) {
      progress.module2 = true;
      progress.safetyPassed = true;
      progress.module2_score = passed;
      localStorage.setItem(OS_PROGRESS_KEY, JSON.stringify(progress));
      if (typeof showToast === 'function') showToast('🏆 模組 2 全題通過！', 'good');
    }
  });
});
