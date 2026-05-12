// 焊接平台 模組 2：安全規範闖關
let dressupScore = 0;
let dressupErrors = 0;
let scenarioScore = 0;

const PROGRESS_KEY_S = 'solder_progress_v1';
function loadSolderProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_S)) || {}; } catch { return {}; }
}
function saveSolderProgress(p) {
  localStorage.setItem(PROGRESS_KEY_S, JSON.stringify(p));
}

// 座標依新的 viewBox 500×540
const EQUIP_VISUALS = {
  goggles: { render: () => `
    <g transform="translate(106,158)">
      <ellipse cx="16" cy="12" rx="22" ry="13" fill="#1a1a1a"/>
      <ellipse cx="72" cy="12" rx="22" ry="13" fill="#1a1a1a"/>
      <line x1="38" y1="12" x2="50" y2="12" stroke="#1a1a1a" stroke-width="4"/>
      <ellipse cx="16" cy="12" rx="18" ry="10" fill="rgba(135,206,250,.65)"/>
      <ellipse cx="72" cy="12" rx="18" ry="10" fill="rgba(135,206,250,.65)"/>
      <ellipse cx="11" cy="9" rx="4" ry="2" fill="rgba(255,255,255,.7)"/>
      <ellipse cx="67" cy="9" rx="4" ry="2" fill="rgba(255,255,255,.7)"/>
      <!-- 鬆緊帶 -->
      <line x1="-4" y1="14" x2="4" y2="13" stroke="#444" stroke-width="2"/>
      <line x1="92" y1="14" x2="100" y2="13" stroke="#444" stroke-width="2"/>
    </g>` },
  apron: { render: () => `
    <g>
      <path d="M120 210 Q150 218 180 210 L182 330 L118 330 Z" fill="#5C4033"/>
      <!-- 圍裙頸帶 -->
      <path d="M120 210 Q130 196 150 196 Q170 196 180 210" fill="none" stroke="#3a2618" stroke-width="3" stroke-linecap="round"/>
      <!-- 中央口袋 -->
      <rect x="135" y="270" width="30" height="38" rx="2" fill="rgba(0,0,0,.2)"/>
      <text x="150" y="252" text-anchor="middle" font-size="11" fill="#FFB066" font-weight="700" font-family="Inter,sans-serif">SAFETY</text>
    </g>` },
  ventilation: { render: () => `
    <g transform="translate(310,40)">
      <!-- 窗戶 -->
      <rect x="0" y="0" width="80" height="80" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
      <line x1="40" y1="0" x2="40" y2="80" stroke="#1e40af"/>
      <line x1="0" y1="40" x2="80" y2="40" stroke="#1e40af"/>
      <!-- 排煙風扇 -->
      <g transform="translate(105,15)">
        <rect x="0" y="0" width="50" height="50" fill="#475569" rx="4"/>
        <circle cx="25" cy="25" r="18" fill="#1e293b"/>
        <g fill="#94a3b8">
          <ellipse cx="25" cy="10" rx="3" ry="14"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="2s" repeatCount="indefinite"/></ellipse>
          <ellipse cx="25" cy="10" rx="3" ry="14" transform="rotate(60 25 25)"><animateTransform attributeName="transform" type="rotate" from="60 25 25" to="420 25 25" dur="2s" repeatCount="indefinite"/></ellipse>
          <ellipse cx="25" cy="10" rx="3" ry="14" transform="rotate(120 25 25)"><animateTransform attributeName="transform" type="rotate" from="120 25 25" to="480 25 25" dur="2s" repeatCount="indefinite"/></ellipse>
        </g>
        <text x="25" y="65" text-anchor="middle" font-size="9" fill="#1e293b" font-family="Noto Sans TC">排煙器</text>
      </g>
      <!-- 通風指示箭頭 -->
      <path d="M -10 25 L 90 25" stroke="#10b981" stroke-width="2" fill="none" stroke-dasharray="4 3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite"/></path>
    </g>` },
  'iron-stand': { render: () => `
    <g transform="translate(310,400)">
      <!-- 桌上的烙鐵架底座 -->
      <rect x="0" y="48" width="100" height="38" rx="4" fill="#374151"/>
      <rect x="6" y="44" width="88" height="6" fill="#1f2937"/>
      <!-- 海綿盤 -->
      <rect x="14" y="26" width="42" height="20" rx="2" fill="#4b5563"/>
      <rect x="17" y="22" width="36" height="6" fill="#fbbf24"/>
      <!-- 彈簧（烙鐵插座）-->
      <path d="M 65 36 Q 75 12 92 22 Q 100 28 95 8" fill="none" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
      <!-- 烙鐵橫躺在架上 -->
      <g transform="translate(15,2)">
        <rect x="0" y="0" width="55" height="11" rx="5" fill="#3b82f6"/>
        <circle cx="14" cy="5" r="3" fill="#22c55e"/>
        <rect x="55" y="2" width="14" height="8" fill="#9ca3af"/>
        <polygon points="69,2 78,5 69,8" fill="#dc2626"/>
      </g>
      <!-- 標籤 -->
      <text x="50" y="105" text-anchor="middle" font-size="10" fill="#444" font-family="Noto Sans TC">烙鐵架（必備）</text>
    </g>` },
};

const SCENARIOS = [
  {
    q: '剛使用完的電烙鐵，過多久才能直接用手摸？',
    a: '拔電後 2 分鐘',
    b: '至少 10 分鐘以上，且摸前先測試（用手背靠近確認）',
    correct: 'b',
    explain: '烙鐵頭從 350°C 冷卻到能徒手摸的溫度需要 5–15 分鐘，依環境而定。徒手摸前一定要先用手背靠近感受溫度。'
  },
  {
    q: '焊接時聞到刺鼻味怎麼辦？',
    a: '把臉湊近聞清楚是什麼味道',
    b: '立刻打開窗戶或排煙器，並後退一步換氣',
    correct: 'b',
    explain: '焊接煙含有助焊劑揮發物與微量金屬，長期吸入有害健康。一定要保持通風。'
  },
  {
    q: '焊錫不小心滴到桌面上，下一步應該？',
    a: '等冷卻凝固後，用刮刀清理',
    b: '立刻用手擦掉趁熱清理',
    correct: 'a',
    explain: '熔融焊錫溫度高達 200°C 以上，徒手碰絕對會燙傷。等冷卻後再處理。'
  },
  {
    q: '電烙鐵不用時應該放在哪？',
    a: '直接放在桌面上（小心點就好）',
    b: '永遠放在烙鐵架上',
    correct: 'b',
    explain: '直接放桌面是火災最大原因。即使你覺得「只有一下下」也不行，烙鐵頭高溫會立刻燒焦桌面或紙張。'
  },
  {
    q: '焊接過程中需要看清楚接點，怎麼做最安全？',
    a: '把臉湊到 5 公分內仔細看',
    b: '保持臉部距離 30 公分以上，使用放大鏡',
    correct: 'b',
    explain: '臉太近不僅吸入更多焊接煙，也容易被噴濺的焊錫燙傷。用放大鏡 / 燈光輔助比靠近看安全得多。'
  },
  {
    q: '電烙鐵電源線破皮露銅，發現後該怎麼處理？',
    a: '用絕緣膠帶黏一下繼續用',
    b: '立刻停用，通報老師更換',
    correct: 'b',
    explain: '電源線破損可能造成觸電或短路起火。絕緣膠帶非永久解決方案，必須更換整條電線。'
  },
  {
    q: '同學焊接到一半被燙到，正確處理順序？',
    a: '沖冷水 → 沖至少 20 分鐘 → 通報老師 → 必要時就醫',
    b: '塗牙膏 → 包起來 → 繼續上課',
    correct: 'a',
    explain: '燙傷處理黃金原則「沖、脫、泡、蓋、送」。依衛福部、臺北市消防局與 ILCOR 2019 共識，冷水沖至少 20 分鐘（15–30 分鐘範圍）。塗牙膏、醬油等是錯誤民俗療法，會加重傷害。'
  },
];

const items = document.querySelectorAll('.draggable');
const zones = document.querySelectorAll('.dropzone');
const sceneEl = document.getElementById('scene');
const sceneSvg = sceneEl.querySelector('svg');
let dragged = null;

items.forEach(item => {
  item.addEventListener('dragstart', e => { dragged = item; e.dataTransfer.effectAllowed = 'move'; if (typeof SoundFX !== 'undefined') SoundFX.click(); });
  item.addEventListener('click', () => {
    if (item.classList.contains('placed')) return;
    items.forEach(i => i.style.outline = '');
    item.style.outline = '3px solid #DC2626';
    dragged = item;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
});

zones.forEach(zone => {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); handleDrop(zone); });
  zone.addEventListener('click', () => { if (dragged) handleDrop(zone); });
});

function handleDrop(zone) {
  if (!dragged) return;
  const accept = zone.dataset.accept;
  const id = dragged.dataset.id;
  const correct = dragged.dataset.correct === '1';
  if (id === accept && correct) {
    zone.classList.add('filled');
    dragged.classList.add('placed');
    dragged.style.outline = '';
    dressupScore += 7.5;
    addEquipToScene(id);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
    showFeedback(`✓ 正確！`, 'success');
  } else if (correct) {
    if (typeof SoundFX !== 'undefined') SoundFX.warn();
    dragged.classList.add('wrong-shake');
    setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
    showFeedback(`位置不對，請放到「${zone.dataset.label}」對應的部位`, 'error');
  } else {
    dressupErrors++;
    if (typeof SoundFX !== 'undefined') SoundFX.error();
    dragged.classList.add('wrong-shake');
    setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
    const itemName = dragged.querySelector('div div:first-child').textContent;
    showFeedback(`⚠ 「${itemName}」是危險行為！${getWrongReason(id)}`, 'error');
  }
  dragged = null;
  updateScore();
  checkDressupComplete();
}

function addEquipToScene(id) {
  const visual = EQUIP_VISUALS[id];
  if (!visual) return;
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.setAttribute('class', 'equip-' + id);
  wrapper.setAttribute('opacity', '0');
  wrapper.innerHTML = visual.render();
  sceneSvg.appendChild(wrapper);
  requestAnimationFrame(() => {
    wrapper.setAttribute('opacity', '1');
    wrapper.style.transition = 'opacity .4s';
  });
}

function getWrongReason(id) {
  return {
    paper: '紙張遇 350°C 立即燒焦冒煙，可能引發火災。',
    'bare-hand': '烙鐵頭高達 350°C，三度燙傷只需要 1 秒。',
    cup: '飲料潑灑會造成短路、觸電風險，且污染焊接區域。',
  }[id] || '';
}

function showFeedback(msg, type) {
  const fb = document.getElementById('dressup-feedback');
  fb.innerHTML = `<div class="feedback ${type}">${msg}</div>`;
  setTimeout(() => fb.innerHTML = '', 4000);
}

function checkDressupComplete() {
  const placed = document.querySelectorAll('.draggable.placed').length;
  if (placed === 4) {
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    document.getElementById('dressup-feedback').innerHTML =
      `<div class="feedback success">🎉 環境配置完成！${dressupErrors > 0 ? `（過程中錯誤 ${dressupErrors} 次，這些都是常見的危險行為）` : '一次到位，太棒了'}</div>`;
    renderScenarios();
    document.querySelector('#scenario-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderScenarios() {
  const list = document.getElementById('scenario-list');
  if (list.dataset.rendered === '1') return;
  list.dataset.rendered = '1';
  SCENARIOS.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'scenario';
    div.innerHTML = `
      <h4>${s.q}</h4>
      <div class="choice-grid">
        <button class="choice" data-q="${i}" data-c="a">A. ${s.a}</button>
        <button class="choice" data-q="${i}" data-c="b">B. ${s.b}</button>
      </div>
      <div class="feedback-slot"></div>
    `;
    list.appendChild(div);
  });
  list.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => answerScenario(btn));
  });
}

const answered = new Set();
function answerScenario(btn) {
  const i = parseInt(btn.dataset.q);
  const choice = btn.dataset.c;
  if (answered.has(i)) return;
  const s = SCENARIOS[i];
  const correct = choice === s.correct;
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.c === s.correct) b.classList.add('correct');
    if (b === btn && !correct) b.classList.add('wrong');
  });
  parent.querySelector('.feedback-slot').innerHTML =
    `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓ 答對了！' : '✗ 不正確。'} ${s.explain}</div>`;
  if (correct) { scenarioScore += 10; if (typeof SoundFX !== 'undefined') SoundFX.success(); }
  else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  updateScore();
  checkAllDone();
}

function checkAllDone() {
  if (answered.size === SCENARIOS.length) {
    const result = document.getElementById('scenario-result');
    const total = dressupScore + scenarioScore;
    if (total >= 95) {
      result.innerHTML = `<div class="feedback success" style="font-size:16px;margin-top:20px"><strong>🏆 你以 ${Math.round(total)} 分通過了焊接安全規範闖關！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const prog = loadSolderProgress();
      prog.module2 = true; prog.safetyPassed = true;
      saveSolderProgress(prog);
    } else {
      result.innerHTML = `<div class="feedback error" style="font-size:15px;margin-top:20px">目前 ${Math.round(total)} 分，未達 95 分。請重新整理頁面再挑戰一次。</div>`;
    }
  }
}

function updateScore() {
  const total = Math.round(dressupScore + scenarioScore);
  document.getElementById('score-display').textContent = total;
  document.getElementById('progress-bar').style.width = total + '%';
}
