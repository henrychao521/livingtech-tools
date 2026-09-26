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
    a: '等待冷卻約 10–15 分鐘，摸前先用手背靠近測試溫度',
    b: '拔電後 2 分鐘',
    correct: 'a',
    explain: '烙鐵頭從 350°C 冷卻到能徒手摸的溫度約需 10–15 分鐘（依環境而定）。徒手摸前一定要先用手背靠近感受溫度。'
  },
  {
    q: '焊接時聞到刺鼻味怎麼辦？',
    a: '立刻打開窗戶或排煙器，並後退一步換氣',
    b: '戴上口罩就好，繼續焊完這個點再處理',
    correct: 'a',
    explain: '焊接煙含有助焊劑揮發物與微量金屬，長期吸入有害健康。一般口罩擋不住揮發性氣體，聞到刺鼻味代表煙已經太濃，要先停下來通風、排煙，不是忍著焊完。'
  },
  {
    q: '焊錫不小心滴到桌面上，下一步應該？',
    a: '等冷卻凝固後，用刮刀清理',
    b: '趁它還軟，立刻用衛生紙包著抹掉',
    correct: 'a',
    explain: '熔融焊錫溫度高達 200°C 以上，衛生紙隔不了熱，還可能被點燃；抹開的錫也會黏得更大片。等冷卻凝固後再用刮刀處理。'
  },
  {
    q: '電烙鐵不用時應該放在哪？',
    a: '先拔掉電源，再平放在桌面上等它冷卻',
    b: '永遠放在烙鐵架上',
    correct: 'b',
    explain: '拔掉電源不等於安全：烙鐵頭還有 300°C 以上，要 10 分鐘以上才會降溫，平放在桌上照樣燒焦桌面、紙張或電線，也容易滾落燙到人。不管有沒有通電，都要放回烙鐵架。'
  },
  {
    q: '焊接過程中需要看清楚接點，怎麼做最安全？',
    a: '戴好護目鏡，就可以湊到 10 公分內仔細看',
    b: '保持臉部距離 30 公分以上，使用放大鏡',
    correct: 'b',
    explain: '護目鏡擋得住噴濺的錫，擋不住焊接煙；臉太近會直接吸入更多煙，鼻子和嘴也可能被濺到。用放大鏡、燈光輔助，比靠近看安全得多。'
  },
  {
    q: '電烙鐵電源線破皮露銅，發現後該怎麼處理？',
    a: '用絕緣膠帶纏緊兩三層，下課再報修',
    b: '立刻停用，通報老師更換',
    correct: 'b',
    explain: '電源線破損可能造成觸電或短路起火。膠帶纏得再緊也不是正式修復，烙鐵的高溫還會讓膠帶軟化脫落；發現破損就要立刻停用、更換電線。'
  },
  {
    q: '同學焊接到一半被燙到，正確處理順序？',
    a: '沖冷水 → 沖至少 20 分鐘 → 通報老師 → 必要時就醫',
    b: '拿冰塊直接冰敷 5 分鐘止痛 → 通報老師',
    correct: 'a',
    explain: '燙傷處理黃金原則「沖、脫、泡、蓋、送」。依衛福部、臺北市消防局與 ILCOR 2019 共識，用流動的冷水沖至少 20 分鐘（15–30 分鐘範圍）。冰塊直接接觸傷口可能凍傷，5 分鐘也不夠把熱帶走；塗牙膏、醬油等則是錯誤民俗療法。'
  },
  // ── Q8–Q12 新增（共 12 題） ────────────────────────────────────
  {
    q: '要加快焊接速度，可以先把焊錫在烙鐵頭上熔成錫球再滴到接點上嗎？',
    a: '不行！助焊劑會在烙鐵頭上提前燃盡，形成氧化錫球掉落，可能短路',
    b: '可以，只要注意溫度就沒問題',
    correct: 'a',
    explain: '焊錫必須送到「接點」讓接點的熱融化，不是在烙鐵頭上融化再滴。在頭上融化會讓助焊劑提前揮發殆盡，產生氧化錫球，焊點品質極差且可能滾落造成短路。'
  },
  {
    q: '「上錫養護（Tinning）」只有拿到全新烙鐵頭時才需要做一次嗎？',
    a: '不對，每次開機預熱後、每次換頭後、以及烙鐵頭變黑時都應該做一次',
    b: '對，新烙鐵頭做過一次就夠了',
    correct: 'a',
    explain: '烙鐵頭每次加熱都會有些氧化，因此每次使用前後都應做 Tinning 保護。看到黑色氧化層時先用海綿清潔再上錫，才能維持良好的傳熱效果與焊點品質。'
  },
  {
    q: '使用含鉛焊錫（Sn63Pb37）後，最重要的衛生動作是？',
    a: '焊接時戴手套，焊完就不必特別洗手',
    b: '焊接後立刻洗手，不摸臉不飲食，教室保持通風',
    correct: 'b',
    explain: 'WHO 明確指出「鉛沒有安全劑量」。含鉛焊錫的鉛會沾在手、工作台和手套上，脫手套時一樣會碰到，再透過手口接觸進入體內。焊接後務必洗手再進食，教室要保持良好通風。'
  },
  {
    q: '下課要離開教室，電烙鐵應該怎麼處理？',
    a: '按下電源開關關閉就好，不需要額外確認',
    b: '拔掉電源插頭，等烙鐵頭冷卻後再收拾，確認周圍無易燃物',
    correct: 'b',
    explain: '開關可能故障（接觸不良），拔插頭才真正斷電。拔電後烙鐵頭仍有 5–15 分鐘高溫，必須確認冷卻後再收拾，並確認周圍沒有紙張等易燃物，以防火災。'
  },
  {
    q: '焊點完成後表面呈現「霧白粗糙」而非光亮錐形，這是什麼問題？',
    a: '過量焊錫，應減少送錫量',
    b: '虛焊（Cold Joint），通常因焊點未凝固就移動，或加熱時間不足',
    correct: 'b',
    explain: '虛焊（Cold Joint）特徵是焊點表面霧白粗糙、電阻偏高、連接強度差。常見原因：(1) 焊錫凝固前移動了板子或元件；(2) 加熱時間不足，焊錫未充分潤濕接點；(3) 接點氧化或有污染。發現虛焊必須重新加熱補焊。'
  },
];

const items = document.querySelectorAll('.draggable');
const zones = document.querySelectorAll('.svg-dropzone'); // SVG-based dropzones now
const sceneEl = document.getElementById('scene');
const sceneSvg = sceneEl.querySelector('svg');
let dragged = null;

// 在 SVG <rect> 上加 hover 樣式（取代 div 版本）
zones.forEach(z => {
  z.addEventListener('mouseenter', () => {
    if (!z.classList.contains('filled')) z.setAttribute('stroke', '#FF7A00');
  });
  z.addEventListener('mouseleave', () => {
    if (!z.classList.contains('filled')) z.setAttribute('stroke', '#cbd5e1');
  });
});

items.forEach(item => {
  item.addEventListener('dragstart', e => { if (item.classList.contains('placed')) { e.preventDefault(); return; } dragged = item; e.dataTransfer.effectAllowed = 'move'; if (typeof SoundFX !== 'undefined') SoundFX.click(); });
  item.addEventListener('click', () => {
    if (item.classList.contains('placed')) return;
    items.forEach(i => i.style.outline = '');
    item.style.outline = '3px solid #DC2626';
    dragged = item;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
});

zones.forEach(zone => {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('over');
    zone.setAttribute('stroke', '#FF7A00');
    zone.setAttribute('stroke-width', '3');
    zone.setAttribute('fill', 'rgba(255,122,0,.15)');
  });
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('over');
    if (!zone.classList.contains('filled')) {
      zone.setAttribute('stroke', '#cbd5e1');
      zone.setAttribute('stroke-width', '1.5');
      zone.setAttribute('fill', 'transparent');
    }
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('over');
    handleDrop(zone);
  });
  zone.addEventListener('click', () => { if (dragged) handleDrop(zone); });
});

function handleDrop(zone) {
  if (!dragged) return;
  if (dragged.classList.contains('placed')) { dragged = null; return; }  // 2026-09-26 審查：避免重複加分
  const accept = zone.dataset.accept;
  const id = dragged.dataset.id;
  const correct = dragged.dataset.correct === '1';
  if (id === accept && correct) {
    zone.classList.add('filled');
    // SVG dropzone 變綠色表示成功
    zone.setAttribute('stroke', '#16A34A');
    zone.setAttribute('stroke-width', '2');
    zone.setAttribute('fill', 'rgba(22,163,74,.12)');
    dragged.classList.add('placed');
    dragged.draggable = false;
    dragged.style.outline = '';
    dressupScore += 7.5;
    addEquipToScene(id);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
    showFeedback(`✓ 正確！`, 'success');
  } else if (correct) {
    if (typeof SoundFX !== 'undefined') SoundFX.warn();
    { const el = dragged; el.classList.add('wrong-shake'); setTimeout(() => el.classList.remove('wrong-shake'), 400); }
    showFeedback(`位置不對，請放到「${zone.dataset.label}」對應的部位`, 'error');
  } else {
    dressupErrors++;
    if (typeof SoundFX !== 'undefined') SoundFX.error();
    { const el = dragged; el.classList.add('wrong-shake'); setTimeout(() => el.classList.remove('wrong-shake'), 400); }
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
    if (total >= 120) {
      result.innerHTML = `<div class="feedback success" style="font-size:16px;margin-top:20px"><strong>🏆 你以 ${Math.round(total)} 分通過了焊接安全規範闖關！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const prog = loadSolderProgress();
      prog.module2 = true; prog.safetyPassed = true;
      saveSolderProgress(prog);
    } else {
      result.innerHTML = `<div class="feedback error" style="font-size:15px;margin-top:20px">目前 ${Math.round(total)} 分，未達 120 分。環境配置已完成不必重做，按下方按鈕重新作答情境題。<br><button type="button" class="btn btn-primary" id="retry-scenario" style="margin-top:12px">🔄 重新挑戰情境題</button></div>`;
      document.getElementById('retry-scenario').addEventListener('click', resetScenarios);
    }
  }
}

// 情境題未達門檻：只清掉情境題作答狀態重新作答，環境配置關分數保留
function resetScenarios() {
  scenarioScore = 0;
  answered.clear();
  const list = document.getElementById('scenario-list');
  list.querySelectorAll('.scenario').forEach(div => {
    div.querySelectorAll('.choice').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
    div.querySelector('.feedback-slot').innerHTML = '';
  });
  document.getElementById('scenario-result').innerHTML = '';
  updateScore();
  list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateScore() {
  const total = Math.round(dressupScore + scenarioScore);
  document.getElementById('score-display').textContent = total;
  document.getElementById('progress-bar').style.width = Math.min(100, total / 1.5) + '%';
}

// 已通過過安全闖關（localStorage 有紀錄）：回頭複習或重新整理時，下一關維持解鎖
(function restorePassed() {
  const prog = loadSolderProgress();
  if (!(prog.module2 || prog.safetyPassed)) return;
  document.getElementById('unlock').classList.remove('hidden');
  const next = document.getElementById('next-btn');
  next.style.opacity = 1;
  next.style.pointerEvents = 'auto';
})();

/* ── 真實事故案例參考面板 ──────────────────────────────── */
;(function () {
  const CARD_ACCIDENT = 'background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const CARD_RESEARCH = 'background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const CARD_GOV     = 'background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const TL = 'font-size:12px;color:#1d4ed8;text-decoration:underline;word-break:break-all';

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">⚠️ 真實事故案例參考</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">以下為焊接安全的官方資料與職業傷害記錄，作為各項安全規範的具體佐證。</p>

    <div style="${CARD_ACCIDENT}">
      <div style="font-weight:700;color:#c2410c;margin-bottom:6px">🔥 烙鐵頭溫度實測：接觸 1 秒即三度燙傷</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">美國賓州大學環境健康與放射安全處（EHRS）焊接安全規範指出：電烙鐵工作溫度為 <strong>149–482°C（300–900°F）</strong>，人體皮膚在接觸 482°C 表面<strong>不到 1 秒</strong>即可造成三度燙傷。即使拔掉電源，烙鐵頭的餘溫仍可維持 5–15 分鐘的危險溫度。這正是「放回烙鐵架」與「等 10 分鐘再徒手摸」規則的根本原因。</p>
      <a href="https://ehrs.upenn.edu/health-safety/lab-safety/standard-lab-procedures-slps/soldering-safety" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：UPenn EHRS — Soldering Safety Procedures（英文）</a>
    </div>

    <div style="${CARD_RESEARCH}">
      <div style="font-weight:700;color:#1e40af;margin-bottom:6px">🫁 焊接煙霧致職業性哮喘｜OSHA 職業健康研究</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">助焊劑（Flux）加熱揮發產生的煙霧中含有多種刺激性化合物，長期吸入可引發<strong>職業性哮喘（Occupational Asthma）</strong>。美國 OSHA 將焊接煙霧列為工作場所有害物，要求焊接站必須配備局部抽排煙（LEV）系統。史丹佛大學 EHS 安全規範同樣明確：「Flux fumes can cause occupational asthma in sensitive individuals」。</p>
      <a href="https://ehs.stanford.edu/reference/soldering-safety" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：Stanford EHS — Soldering Safety（英文）</a>
    </div>

    <div style="${CARD_GOV}">
      <div style="font-weight:700;color:#15803d;margin-bottom:6px">🏛️ 衛福部「燙傷急救黃金原則」｜沖 20 分鐘冷水</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">台灣衛生福利部與台北市消防局均公告：燙傷後正確處置步驟為「沖、脫、泡、蓋、送」。其中<strong>冷水沖至少 20 分鐘</strong>（ILCOR 2019 共識建議 15–30 分鐘），可有效降低餘熱、減少組織損傷深度。牙膏、醬油、白酒等民俗療法反而會加重感染與傷口損傷。焊接教室應張貼此急救流程供師生參考。</p>
      <a href="https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=367&pid=5884" target="_blank" rel="noopener noreferrer" style="${TL}">📄 參考來源：衛生福利部國民健康署（中文）</a>
    </div>

    <p style="font-size:12px;color:#94a3b8;margin-top:4px">※ 以上連結均為政府、大學或研究機構官方文件，引用於教學安全佐證之用。</p>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);
})();

/* ── Layer C：360° 環場實景預覽（Pannellum.js）────────────────
 * 素材未就緒（hasAsset=false）時整個區塊不渲染，學生不會看到佔位符。
 * 拍攝流程：360° 相機（Insta360 / GoPro Max / iPhone 全景）置於工作站
 * 正中央、高度約 120cm，確認烙鐵架/PCB/助焊劑/海綿/排煙器入鏡，
 * 輸出 4096×2048 以上等距柱狀投影 JPEG，存至
 * solder/assets/360/workstation-360.jpg 後把 hasAsset 改為 true。 */
;(function () {
  const panoramaPath = 'solder/assets/360/workstation-360.jpg';
  const hasAsset = false; // ← 拍攝 360° 照片並上傳後改為 true

  if (!hasAsset) return; // 素材未就緒：不顯示本區塊

  const sec = document.createElement('section');
  sec.className = 'panel';

  {
    sec.innerHTML = `
      <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">🌐 360° 焊接工作站環場實景</h3>
      <p style="color:#64748b;font-size:14px;margin-bottom:12px">拖曳或點擊環場畫面，自由探索焊接工作站的每個角落。</p>
      <div id="panorama-viewer" style="width:100%;height:420px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0"></div>
    `;
    if (!document.getElementById('pannellum-css')) {
      const link = document.createElement('link');
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => {
      pannellum.viewer('panorama-viewer', {
        type: 'equirectangular',
        panorama: '../../' + panoramaPath,
        autoLoad: true,
        autoRotate: -2,
        compass: false,
        showControls: true,
        title: '焊接工作站 360° 實景',
        hotSpots: []
      });
    };
    document.body.appendChild(script);
  }

  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);
})();
