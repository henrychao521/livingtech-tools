// 麵包板平台 模組 3：接線步驟教學
const STEPS = [
  { title: '檢查麵包板', anim: 'check', desc: '把麵包板平放，確認沒有金屬屑、孔洞沒被堵塞。確認上下電源軌的標示（紅+ 黑−）。', tip: '新麵包板有時內部金屬條會比較緊，第一次插要用點力但不要彎元件腳。', warn: null },
  { title: '插入電池盒線', anim: 'battery', desc: '電池盒紅線（+）插上電源軌的紅 + 行；黑線（−）插下電源軌的黑 − 行。或都插上半也可以，但要記住自己的習慣。', tip: '養成「紅+黑−」習慣，整個學期都這樣，未來除錯快很多。', warn: '此時不要裝電池！等所有元件接好再裝電池。' },
  { title: '電源軌跨接（選用）', anim: 'rail-bridge', desc: '麵包板大塊（830 點）的電源軌中央有斷點。如果你的電路用到全長，需要用跳線把斷點兩側連起來。小塊麵包板（400 點）通常不用。', tip: '電源軌左右兩段內部其實是分開的金屬條，沒跨接的話只有半邊有電。', warn: null },
  { title: '插入電阻', anim: 'resistor', desc: '把 220Ω 電阻（紅紅棕）跨接：一腳插上電源軌的紅 + 行，另一腳插中間區的某一行（例如 e10）。電阻沒方向性，不用管正反。', tip: '電阻腳太長就先用斜口鉗剪短，但留至少 5mm 才好插。', warn: null },
  { title: '插入 LED', anim: 'led', desc: '把 LED 長腳（陽極）跟電阻另一端接同一直行（例如電阻在 e10，LED 長腳就接 a10 / b10 / c10 / d10 / e10 任一個——同直行內金屬條相連）。短腳（陰極）插另一直行（例如 e13）。', tip: '不確定哪腳長就拿到光下看：LED 內部有兩塊金屬，較大的那塊是負極（陰極）、較小的尖頭是正極（陽極）。', warn: '插反的話 LED 不會亮；3V 電池下通常不會壞，但 5V 以上（USB、9V 電池）會超過 LED 反向擊穿電壓而損壞，所以一發現不亮應立刻檢查方向並拔除。' },
  { title: '把 LED 負極接到地', anim: 'gnd', desc: '用一條跳線：一端插 LED 短腳所在的直行（e13），另一端插下電源軌的黑 − 行。這樣電流路徑就完整：電池+ → 電阻 → LED → 地。', tip: '使用黑色跳線會讓電路圖更直覺。', warn: null },
  { title: '裝入電池', anim: 'install-battery', desc: '所有跳線檢查完畢，最後一步才裝入電池。LED 應該立刻亮起。', tip: '裝電池的瞬間如果聞到焦味、看到冒煙，立刻拿掉電池！', warn: '電池正極（凸出端）對齊電池盒的彈簧側。' },
  { title: '收電路 / 拆解', anim: 'cleanup', desc: '結束實驗時：先拿掉電池 → 拔下所有跳線（有條理地一條一條） → 拔元件 → 把元件分類收好。', tip: '元件按種類收（電阻一袋、LED 一袋）。下次找元件不會浪費時間。', warn: null },
];

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const seenSteps = new Set();

const PROGRESS_KEY_BB = 'breadboard_progress_v1';
function loadBBProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY_BB)) || {}; } catch { return {}; }
}
function saveBBProgress(p) { localStorage.setItem(PROGRESS_KEY_BB, JSON.stringify(p)); }
const savedProg = loadBBProgress();
if (savedProg.module3_seen) savedProg.module3_seen.forEach(i => seenSteps.add(i));

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item';
  if (seenSteps.has(i)) item.classList.add('done');
  item.innerHTML = `<div class="num">${i + 1}</div><div class="step-title">${s.title}</div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.step-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
  const s = STEPS[i];
  stepDetailEl.innerHTML = `
    <div class="step-num">STEP ${String(i + 1).padStart(2, '0')} / 08</div>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p>${s.desc}</p>
    <div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 注意：</strong>${s.warn}</div>` : ''}
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一步</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有步驟 ✓' : '我已了解，下一步 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  }
  document.querySelectorAll('.step-item')[i].classList.add('done');
  stepProgressEl.textContent = `已學習 ${seenSteps.size} / 8 步`;
  const prog = loadBBProgress();
  prog.module3_seen = Array.from(seenSteps);
  if (seenSteps.size === STEPS.length) {
    prog.module3 = true;
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 八步完成！可以進入模擬練習', 'good');
  }
  saveBBProgress(prog);
  if (i < STEPS.length - 1) selectStep(i + 1);
}

function renderAnim(type) {
  const baseRect = `<rect x="20" y="40" width="360" height="160" rx="8" fill="#fefce8" stroke="#a89770" stroke-width="2"/>
    <line x1="35" y1="55" x2="365" y2="55" stroke="#dc2626" stroke-width="1.5"/>
    <line x1="35" y1="68" x2="365" y2="68" stroke="#1a1a1a" stroke-width="1"/>
    <line x1="35" y1="180" x2="365" y2="180" stroke="#dc2626" stroke-width="1.5"/>
    <line x1="35" y1="192" x2="365" y2="192" stroke="#1a1a1a" stroke-width="1"/>`;
  const anims = {
    check: `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<text x="200" y="125" text-anchor="middle" font-size="40">👀</text><text x="200" y="220" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">確認電源軌標示與洞洞通暢</text></svg>`,
    battery: `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<g transform="translate(60,210)"><rect x="-22" y="-12" width="44" height="24" rx="3" fill="#1f2937"/><line x1="20" y1="-6" x2="60" y2="55" stroke="#dc2626" stroke-width="2"/><line x1="20" y1="6" x2="60" y2="180" stroke="#1a1a1a" stroke-width="2"/></g><circle cx="60" cy="55" r="3" fill="#dc2626"/><circle cx="60" cy="180" r="3" fill="#1a1a1a"/><text x="200" y="225" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">紅線→正電源軌・黑線→負電源軌</text></svg>`,
    'rail-bridge': `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<line x1="200" y1="40" x2="200" y2="68" stroke="#fefce8" stroke-width="6"/><line x1="200" y1="180" x2="200" y2="200" stroke="#fefce8" stroke-width="6"/><path d="M 180 55 Q 200 30 220 55" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"><animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" repeatCount="indefinite"/></path><circle cx="180" cy="55" r="3" fill="#dc2626"/><circle cx="220" cy="55" r="3" fill="#dc2626"/><text x="200" y="220" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">電源軌斷點兩側用跳線跨接</text></svg>`,
    resistor: `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<g transform="translate(150,110)"><line x1="0" y1="-55" x2="0" y2="-22" stroke="#9ca3af" stroke-width="1.5"/><rect x="-22" y="-22" width="44" height="12" rx="3" fill="#fef3c7" stroke="#92400e"/><rect x="-14" y="-22" width="3" height="12" fill="#dc2626"/><rect x="-9" y="-22" width="3" height="12" fill="#1a1a1a"/><rect x="-2" y="-22" width="3" height="12" fill="#92400e"/><line x1="0" y1="-10" x2="0" y2="22" stroke="#9ca3af" stroke-width="1.5"/></g><circle cx="150" cy="55" r="3" fill="#16a34a"/><circle cx="150" cy="132" r="3" fill="#16a34a"/><text x="200" y="220" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">220Ω 電阻：跨電源軌與中間區</text></svg>`,
    led: `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<g transform="translate(250,120)"><line x1="-4" y1="-55" x2="-4" y2="-15" stroke="#9ca3af" stroke-width="1.5"/><line x1="4" y1="-55" x2="4" y2="-15" stroke="#9ca3af" stroke-width="1.5"/><circle cx="0" cy="0" r="14" fill="#ef4444" opacity=".85" stroke="#991b1b"/><circle cx="-3" cy="-3" r="3" fill="#fef9c3" opacity=".7"/><line x1="-4" y1="14" x2="-4" y2="55" stroke="#9ca3af" stroke-width="2"/><line x1="4" y1="14" x2="4" y2="55" stroke="#9ca3af" stroke-width="1.5"/><text x="-12" y="-58" font-size="9" fill="#dc2626" font-weight="700">+</text><text x="6" y="-58" font-size="9" fill="#1a1a1a" font-weight="700">−</text></g><text x="200" y="220" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">LED 長腳=正極（接電阻側）/ 短腳=負極</text></svg>`,
    gnd: `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<g transform="translate(250,120)"><line x1="-4" y1="-55" x2="-4" y2="-15" stroke="#9ca3af" stroke-width="1.5"/><line x1="4" y1="-55" x2="4" y2="-15" stroke="#9ca3af" stroke-width="1.5"/><circle cx="0" cy="0" r="14" fill="#ef4444" opacity=".85"/><line x1="4" y1="14" x2="4" y2="55" stroke="#1a1a1a" stroke-width="3"/></g><path d="M 254 192 Q 280 195 320 192" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/><text x="200" y="220" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">LED 短腳→負電源軌（地）</text></svg>`,
    'install-battery': `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<g transform="translate(60,210)"><rect x="-22" y="-12" width="44" height="24" rx="3" fill="#1f2937"/><rect x="-18" y="-9" width="16" height="18" fill="#dc2626"><animate attributeName="opacity" values="0;1;1" dur="2s" repeatCount="indefinite"/></rect><rect x="2" y="-9" width="16" height="18" fill="#1a1a1a"><animate attributeName="opacity" values="0;1;1" dur="2s" repeatCount="indefinite"/></rect></g><g transform="translate(250,120)"><circle cx="0" cy="0" r="14" fill="#ef4444"><animate attributeName="opacity" values="0.3;1;1" dur="2s" repeatCount="indefinite"/></circle><circle cx="0" cy="0" r="22" fill="#ef4444" opacity="0"><animate attributeName="r" values="0;28;0" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.4;0" dur="2s" repeatCount="indefinite"/></circle></g><text x="200" y="225" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="700" font-family="Noto Sans TC,sans-serif">💡 LED 點亮成功！</text></svg>`,
    cleanup: `<svg viewBox="0 0 400 240" style="width:90%">${baseRect}<g transform="translate(200,130)"><text x="0" y="-10" text-anchor="middle" font-size="40">🧹</text></g><text x="200" y="220" text-anchor="middle" font-size="12" fill="#666" font-family="Noto Sans TC,sans-serif">先拔電池→再拔元件→分類收好</text></svg>`,
  };
  return anims[type] || '';
}

selectStep(0);
window.selectStep = selectStep;
window.markDone = markDone;

// === 步驟排序拼圖 ===
if (typeof Interactions !== 'undefined') {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map(s => s.title),
    title: '把打亂的步驟排回正確順序',
    onComplete: () => {
      try {
        const k = 'breadboard_progress_v1';
        const p = JSON.parse(localStorage.getItem(k)) || {};
        p.module3_puzzle = true;
        localStorage.setItem(k, JSON.stringify(p));
      } catch (e) {}
      if (typeof showToast === 'function') showToast('🏆 排序測驗通過！', 'good');
    }
  });
}

/* ============================================================
 * 看懂電路圖：符號 ↔ 麵包板實體 對應練習
 * （對應上方接線步驟的同一顆電路:電池 → 220Ω → LED → 地）
 * ============================================================ */
(function schematicMatch() {
  const nav = document.querySelector('.module-nav-bottom');
  if (!nav) return;

  const SYM_QUIZ = [
    { q: '電路圖裡「一長一短的兩條平行線」,對應麵包板上的哪個實體?',
      opts: ['電池盒(長線那端=紅色正極線)', '220Ω 電阻', 'LED', '跳線'],
      ans: 0, explain: '長線=正極、短線=負極。接麵包板時就是電池盒的紅(+)黑(−)線。' },
    { q: '鋸齒狀(或長方形)的符號,在這顆電路的實體是?',
      opts: ['LED', '220Ω 色環電阻(紅紅棕)', '開關', '電池'],
      ans: 1, explain: '鋸齒符號是電阻。本電路用 220Ω 限流,色環讀作紅紅棕。電阻沒有方向性。' },
    { q: '三角形加上兩個小箭頭的符號是?',
      opts: ['蜂鳴器', '馬達', 'LED(箭頭代表發光,三角形尖端指向電流方向)', '電容'],
      ans: 2, explain: '二極體符號加發光箭頭=LED。三角形尖端指的方向就是電流方向:陽極(長腳)→陰極(短腳)。' },
    { q: '電路圖上兩條線交叉處「打一個實心點」,代表什麼?',
      opts: ['兩條線互相絕緣、只是畫圖經過', '兩條線在這裡相連(像插在麵包板同一直行)', '這裡要焊接', '這裡有開關'],
      ans: 1, explain: '打點=相連。就像麵包板同一直行的五個孔內部金屬條相連;沒打點的交叉只是畫面上經過,實際不相連。' },
  ];

  const sec = document.createElement('section');
  sec.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:24px;margin-top:24px';
  sec.innerHTML = `
    <h3 style="margin-bottom:4px">🗺️ 看懂電路圖:符號 ↔ 麵包板實體</h3>
    <p class="muted" style="font-size:14px;margin-bottom:12px">
      工程師溝通用的是「電路圖」,不是麵包板照片。下圖就是你剛接好的那顆電路——
      對照四個符號,回答下面的判讀題。
    </p>
    <svg viewBox="0 0 460 170" style="width:100%;max-width:460px;display:block;margin:0 auto 14px;background:#F8FAFC;border:1px solid var(--border);border-radius:10px">
      <!-- 迴路外框 -->
      <path d="M60 40 H400 V130 H60 Z" fill="none" stroke="#1F2937" stroke-width="2"/>
      <!-- ① 電池(左邊,長短線) -->
      <g>
        <rect x="48" y="70" width="24" height="30" fill="#F8FAFC"/>
        <line x1="52" y1="72" x2="68" y2="72" stroke="#1F2937" stroke-width="3"/>
        <line x1="56" y1="82" x2="64" y2="82" stroke="#1F2937" stroke-width="2"/>
        <line x1="60" y1="40" x2="60" y2="72" stroke="#1F2937" stroke-width="2"/>
        <line x1="60" y1="82" x2="60" y2="130" stroke="#1F2937" stroke-width="2"/>
        <text x="30" y="66" font-size="12" font-weight="700" fill="#DC2626">+</text>
        <text x="30" y="96" font-size="12" font-weight="700" fill="#6B7280">−</text>
        <text x="60" y="152" text-anchor="middle" font-size="11" fill="#6B7280">① 電池 3V</text>
      </g>
      <!-- ② 電阻(上邊,鋸齒) -->
      <g>
        <path d="M170 40 l6 -8 l8 16 l8 -16 l8 16 l8 -16 l8 16 l6 -8" fill="none" stroke="#1F2937" stroke-width="2"/>
        <text x="205" y="22" text-anchor="middle" font-size="11" fill="#6B7280">② 220Ω</text>
      </g>
      <!-- ③ LED(右邊,二極體+箭頭) -->
      <g>
        <polygon points="390,75 410,85 390,95" fill="#DC2626" stroke="#1F2937" stroke-width="1.5"/>
        <line x1="410" y1="75" x2="410" y2="95" stroke="#1F2937" stroke-width="2.5"/>
        <line x1="400" y1="40" x2="400" y2="75" stroke="#1F2937" stroke-width="2" transform="translate(0,0)"/>
        <path d="M398 64 l8 -8 M404 68 l8 -8" stroke="#F59E0B" stroke-width="2" fill="none"/>
        <path d="M404 58 l2 -2 l-3 0 z M410 62 l2 -2 l-3 0 z" fill="#F59E0B"/>
        <text x="432" y="90" font-size="11" fill="#6B7280">③ LED</text>
      </g>
      <!-- ④ 節點(下邊,打點) -->
      <g>
        <circle cx="230" cy="130" r="4" fill="#1F2937"/>
        <line x1="230" y1="130" x2="230" y2="112" stroke="#1F2937" stroke-width="2"/>
        <text x="230" y="106" text-anchor="middle" font-size="10" fill="#6B7280">(接量測點)</text>
        <text x="262" y="152" text-anchor="middle" font-size="11" fill="#6B7280">④ 打點=相連</text>
      </g>
    </svg>
    <div id="sym-quiz"></div>`;
  nav.parentNode.insertBefore(sec, nav);

  const wrap = sec.querySelector('#sym-quiz');
  const done = new Set();
  SYM_QUIZ.forEach((q, i) => {
    const div = document.createElement('div');
    div.classList.add('quiz-item');
    div.style.cssText = 'background:#F8FAFC;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px';
    div.innerHTML = `
      <p style="font-size:14px;margin-bottom:6px"><strong>判讀 ${i + 1}:</strong>${q.q}</p>
      <div class="choice-grid" style="grid-template-columns:1fr 1fr">${q.opts.map((o, j) =>
        `<button class="choice" data-q="${i}" data-c="${j}">${o}</button>`).join('')}</div>
      <div class="feedback-slot"></div>`;
    wrap.appendChild(div);
  });
  wrap.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
    const i = parseInt(btn.dataset.q);
    if (done.has(i)) return;
    const correct = parseInt(btn.dataset.c) === SYM_QUIZ[i].ans;
    if (!correct) {
      if (typeof SoundFX !== 'undefined') SoundFX.error();
      btn.classList.add('wrong');
      btn.closest('.quiz-item').querySelector('.feedback-slot').innerHTML =
        `<div class="feedback error" style="margin-top:8px">再想想:對照上圖的符號位置。</div>`;
      setTimeout(() => {
        btn.classList.remove('wrong');
        btn.closest('.quiz-item').querySelector('.feedback-slot').innerHTML = '';
      }, 2200);
      return;
    }
    done.add(i);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
    const item = btn.closest('.quiz-item');
    item.querySelectorAll('.choice').forEach(b => { b.disabled = true; if (b === btn) b.classList.add('correct'); });
    item.querySelector('.feedback-slot').innerHTML =
      `<div class="feedback success" style="margin-top:8px">✓ ${SYM_QUIZ[i].explain}</div>`;
    if (done.size === SYM_QUIZ.length && typeof SoundFX !== 'undefined') SoundFX.unlock();
  }));
})();
