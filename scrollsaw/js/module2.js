// 模組 2：安全規範闖關
let dressupScore = 0;
let dressupErrors = 0;
let scenarioScore = 0;

// 配備放上後在角色身上顯示的視覺元素
const EQUIP_VISUALS = {
  goggles: { x: 95, y: 76, render: () => `
    <g transform="translate(95,76)">
      <ellipse cx="14" cy="9" rx="22" ry="11" fill="#1a1a1a"/>
      <ellipse cx="76" cy="9" rx="22" ry="11" fill="#1a1a1a"/>
      <line x1="36" y1="9" x2="54" y2="9" stroke="#1a1a1a" stroke-width="3"/>
      <ellipse cx="14" cy="9" rx="18" ry="8" fill="rgba(135,206,250,.6)"/>
      <ellipse cx="76" cy="9" rx="18" ry="8" fill="rgba(135,206,250,.6)"/>
      <ellipse cx="10" cy="6" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
      <ellipse cx="72" cy="6" rx="3" ry="2" fill="rgba(255,255,255,.7)"/>
      <line x1="-8" y1="10" x2="-2" y2="9" stroke="#444" stroke-width="2"/>
      <line x1="92" y1="10" x2="98" y2="9" stroke="#444" stroke-width="2"/>
    </g>` },
  hairtie: { render: () => `
    <g>
      <path d="M105 38 Q140 18 175 38 Q188 50 175 55 Q140 28 105 55 Q92 50 105 38 Z" fill="#5a3a1a"/>
      <ellipse cx="140" cy="35" rx="18" ry="6" fill="#FF7A00"/>
      <path d="M122 35 Q140 30 158 35" fill="none" stroke="#D85F00" stroke-width="1.5"/>
    </g>` },
  apron: { render: () => `
    <g>
      <path d="M115 130 Q140 138 165 130 L168 295 L112 295 Z" fill="#5C4033"/>
      <path d="M115 130 Q120 120 140 120 Q160 120 165 130" fill="none" stroke="#3a2618" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="155" x2="180" y2="155" stroke="#8b6914" stroke-width="2"/>
      <text x="140" y="175" text-anchor="middle" font-size="9" fill="#FFB066" font-weight="700">SAFETY</text>
      <rect x="125" y="200" width="30" height="40" rx="3" fill="rgba(0,0,0,.2)"/>
    </g>` },
  'closed-shoes': { render: () => `
    <g>
      <ellipse cx="120" cy="412" rx="18" ry="8" fill="#222"/>
      <ellipse cx="160" cy="412" rx="18" ry="8" fill="#222"/>
      <path d="M105 408 L135 408 L138 412 L102 412 Z" fill="#fff"/>
      <path d="M145 408 L175 408 L178 412 L142 412 Z" fill="#fff"/>
      <line x1="115" y1="410" x2="115" y2="414" stroke="#666" stroke-width="1"/>
      <line x1="125" y1="410" x2="125" y2="414" stroke="#666" stroke-width="1"/>
      <line x1="155" y1="410" x2="155" y2="414" stroke="#666" stroke-width="1"/>
      <line x1="165" y1="410" x2="165" y2="414" stroke="#666" stroke-width="1"/>
    </g>` },
};

const SCENARIOS = [
  {
    q: '你正在切割，木屑堆積擋住切割線，怎麼辦？',
    a: '先關機等鋸條停止，再用刷子清理',
    b: '直接用嘴吹掉木屑',
    correct: 'a',
    explain: '切割中絕不可以把臉靠近鋸條，木屑可能噴入眼睛。應該先暫停或調整吹氣管。'
  },
  {
    q: '鋸到一半發現切歪了，下一步應該？',
    a: '快速回拉木板回到原線',
    b: '緩慢退出鋸條，重新對準切割線',
    correct: 'b',
    explain: '快速回拉容易把鋸條夾住而斷裂，正確做法是慢慢退出後重新切入。'
  },
  {
    q: '同學想跟你打招呼，這時你應該？',
    a: '一邊切一邊回頭打招呼',
    b: '先切完目前段落，關機後再回應',
    correct: 'b',
    explain: '操作機具時眼睛必須持續注視鋸條與切割線，分心是最常見的事故原因。'
  },
  {
    q: '鋸條突然斷掉，你的反應？',
    a: '立刻關電源，等完全停止再處理',
    b: '繼續轉動，把斷掉的部分拿出來',
    correct: 'a',
    explain: '任何異常狀況第一時間都是「關電源 → 等完全停止」，這是黃金原則。'
  },
  {
    q: '哪一種放手位置最安全？',
    a: '兩手拇指扶在木板邊緣，距離鋸條至少 5 公分',
    b: '一手按住木板靠近鋸條處，另一手推進',
    correct: 'a',
    explain: '雙手要保持平衡且遠離鋸條（建議「安全三角區」），絕不可單手操作。'
  },
  {
    q: '完成切割要離開機台時，正確順序是？',
    a: '關電源 → 等鋸條停止 → 清理工作台 → 離開',
    b: '把木板拿走 → 直接關電源走人',
    correct: 'a',
    explain: '工作台清理是基本禮儀也是安全要求，殘留木屑可能導致下一位同學切割時打滑。'
  },
  {
    q: '切薄板時鋸條容易把木板震彈起來，怎麼避免？',
    a: '用力壓住木板',
    b: '把壓料桿調低、輕貼在木板上',
    correct: 'b',
    explain: '壓料桿是專門設計來避免木板震彈的部件，正確使用比用力壓更安全有效。'
  },
];

// === 拖曳邏輯 ===
const items = document.querySelectorAll('.draggable');
const zones = document.querySelectorAll('.dropzone');
const characterEl = document.getElementById('character');
const characterSvg = characterEl.querySelector('svg');
let dragged = null;

items.forEach(item => {
  item.addEventListener('dragstart', e => {
    dragged = item;
    e.dataTransfer.effectAllowed = 'move';
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
  item.addEventListener('click', () => {
    if (item.classList.contains('placed')) return;
    items.forEach(i => i.style.outline = '');
    item.style.outline = '3px solid #FF7A00';
    dragged = item;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
});

zones.forEach(zone => {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('over');
    handleDrop(zone);
  });
  zone.addEventListener('click', () => {
    if (dragged) handleDrop(zone);
  });
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
    addEquipToCharacter(id);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
    showFeedback(`✓ 正確！${dragged.querySelector('div div:first-child').textContent} 已穿戴`, 'success');
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
    showFeedback(`⚠ 「${itemName}」不是正確的安全配備！${getWrongReason(id)}`, 'error');
  }
  dragged = null;
  updateScore();
  checkDressupComplete();
}

function addEquipToCharacter(id) {
  const visual = EQUIP_VISUALS[id];
  if (!visual) return;
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.setAttribute('class', 'equip-' + id);
  wrapper.setAttribute('opacity', '0');
  wrapper.innerHTML = visual.render();
  // 鞋子要替換預設的腳
  if (id === 'closed-shoes') {
    const def = characterSvg.querySelector('#default-shoes');
    if (def) def.remove();
  }
  characterSvg.appendChild(wrapper);
  // 動畫淡入
  requestAnimationFrame(() => {
    wrapper.setAttribute('opacity', '1');
    wrapper.style.transition = 'opacity .4s';
  });
}

function getWrongReason(id) {
  return {
    gloves: '操作機具時不可戴手套，可能被鋸條捲入。',
    phone: '操作中嚴禁使用手機，分心是事故主因。',
    necklace: '所有飾品都應拿下，避免捲入機械。',
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
      `<div class="feedback success">🎉 服儀檢查完成！${dressupErrors > 0 ? `（過程中錯誤 ${dressupErrors} 次，注意這些是常見的危險裝備）` : '一次到位，太棒了'}</div>`;
    renderScenarios();
    document.getElementById('part-scenario').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// === 情境題 ===
function renderScenarios() {
  const list = document.getElementById('scenario-list');
  if (list.dataset.rendered === '1') return;
  list.dataset.rendered = '1';
  SCENARIOS.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'scenario';
    div.innerHTML = `
      <h4><span class="q-num">${i + 1}</span> ${s.q}</h4>
      <div class="choice-grid">
        <button class="choice" data-q="${i}" data-c="a">A. ${s.a}</button>
        <button class="choice" data-q="${i}" data-c="b">B. ${s.b}</button>
      </div>
      <div class="feedback-slot"></div>
    `;
    list.appendChild(div);
  });
  list.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', e => answerScenario(btn));
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
  if (correct) {
    scenarioScore += 10;
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.error();
  }
  answered.add(i);
  updateScore();
  checkAllDone();
}

function checkAllDone() {
  if (answered.size === SCENARIOS.length) {
    const result = document.getElementById('scenario-result');
    const total = dressupScore + scenarioScore;
    if (total >= 95) {
      result.innerHTML = `<div class="feedback success" style="font-size:16px;margin-top:20px"><strong>🏆 你以 ${Math.round(total)} 分通過了安全規範闖關！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const prog = loadProgress();
      prog.module2 = true;
      prog.safetyPassed = true;
      saveProgress(prog);
    } else {
      result.innerHTML = `<div class="feedback error" style="font-size:15px;margin-top:20px">目前 ${Math.round(total)} 分，未達 95 分。請重新整理頁面再挑戰一次（安全是最重要的，請務必確實理解每題）。</div>`;
    }
  }
}

function updateScore() {
  const total = Math.round(dressupScore + scenarioScore);
  document.getElementById('score-display').textContent = total;
  document.getElementById('progress-bar').style.width = total + '%';
}
