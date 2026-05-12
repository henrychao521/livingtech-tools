// 麵包板平台 模組 3：接線步驟教學
const STEPS = [
  { title: '檢查麵包板', anim: 'check', desc: '把麵包板平放，確認沒有金屬屑、孔洞沒被堵塞。確認上下電源軌的標示（紅+ 黑−）。', tip: '新麵包板有時內部金屬條會比較緊，第一次插要用點力但不要彎元件腳。', warn: null },
  { title: '插入電池盒線', anim: 'battery', desc: '電池盒紅線（+）插上電源軌的紅 + 行；黑線（−）插下電源軌的黑 − 行。或都插上半也可以，但要記住自己的習慣。', tip: '養成「紅+黑−」習慣，整個學期都這樣，未來除錯快很多。', warn: '此時不要裝電池！等所有元件接好再裝電池。' },
  { title: '電源軌跨接（選用）', anim: 'rail-bridge', desc: '麵包板大塊（830 點）的電源軌中央有斷點。如果你的電路用到全長，需要用跳線把斷點兩側連起來。小塊麵包板（400 點）通常不用。', tip: '電源軌左右兩段內部其實是分開的金屬條，沒跨接的話只有半邊有電。', warn: null },
  { title: '插入電阻', anim: 'resistor', desc: '把 220Ω 電阻（紅紅棕）跨接：一腳插上電源軌的紅 + 行，另一腳插中間區的某一行（例如 e10）。電阻沒方向性，不用管正反。', tip: '電阻腳太長就先用斜口鉗剪短，但留至少 5mm 才好插。', warn: null },
  { title: '插入 LED', anim: 'led', desc: '把 LED 長腳（陽極）跟電阻另一端接同一行（例如 j10）。短腳（陰極）插另一行（例如 j13）。', tip: '不確定哪腳長就拿到光下看：LED 內部有兩塊金屬，較大的那塊是負極（陰極）、較小的尖頭是正極（陽極）。', warn: '插反的話 LED 不會亮；3V 電池下通常不會壞，但 5V 以上（USB、9V 電池）會超過 LED 反向擊穿電壓而損壞，所以一發現不亮應立刻檢查方向並拔除。' },
  { title: '把 LED 負極接到地', anim: 'gnd', desc: '用一條跳線：一端插 LED 短腳所在的行（j13），另一端插下電源軌的黑 − 行。這樣電流路徑就完整：電池+ → 電阻 → LED → 地。', tip: '使用黑色跳線會讓電路圖更直覺。', warn: null },
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
