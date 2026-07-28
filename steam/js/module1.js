// 跨領域 STEAM 模組 1：二進位、編碼與同位檢查
const PK = 'steam_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
let bits = [0, 0, 0, 0, 0, 0, 0, 0];

const progEl = document.getElementById('prog'), nextBtn = document.getElementById('next-btn');

// ---------- 位元翻翻看 ----------
function value() { return bits.reduce((s, b, i) => s + b * WEIGHTS[i], 0); }

function renderBits() {
  document.getElementById('bits').innerHTML = bits.map((b, i) =>
    `<div class="bit"><div class="bit-box ${b ? 'on' : ''}" data-i="${i}">${b}</div>
     <div class="bit-w">${WEIGHTS[i]}</div></div>`).join('');

  const v = value();
  document.getElementById('dec').textContent = v;
  document.getElementById('bin').textContent = bits.join('');
  document.getElementById('hex').textContent = '0x' + v.toString(16).toUpperCase().padStart(2, '0');
  const ch = (v >= 32 && v <= 126) ? `'${String.fromCharCode(v)}'` : (v === 0 ? '—' : '不可顯示');
  document.getElementById('asc').textContent = ch;

  const bv = document.getElementById('bitVerdict');
  if (v === 255) { bv.className = 'verdict good'; bv.textContent = '✅ 255 — 8 個位元全部打開，這是一個位元組能表示的最大值。'; }
  else if (v === 0) { bv.className = 'verdict warn'; bv.textContent = '試著湊出不同的數字'; }
  else if (v >= 65 && v <= 90) { bv.className = 'verdict good'; bv.textContent = `✅ ${v} 對應大寫字母 '${String.fromCharCode(v)}'。`; }
  else if (v >= 97 && v <= 122) { bv.className = 'verdict good'; bv.textContent = `✅ ${v} 對應小寫字母 '${String.fromCharCode(v)}'。`; }
  else { bv.className = 'verdict warn'; bv.textContent = `目前是 ${v}（二進位 ${bits.join('')}）。`; }

  check();
}

document.getElementById('bits').addEventListener('click', e => {
  const el = e.target.closest('.bit-box'); if (!el) return;
  const i = +el.dataset.i; bits[i] ^= 1;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  renderBits();
});

// ---------- 文字編碼 ----------
function renderEncoded() {
  const s = document.getElementById('msg').value;
  if (!s) { document.getElementById('encoded').innerHTML = '<p class="muted">輸入一些文字看看。</p>'; return; }
  document.getElementById('encoded').innerHTML = `
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13.5px">
      <thead><tr style="background:#f1f5f9">
        <th style="padding:8px;text-align:left;border-bottom:2px solid #cbd5e1">字元</th>
        <th style="padding:8px;text-align:left;border-bottom:2px solid #cbd5e1">十進位</th>
        <th style="padding:8px;text-align:left;border-bottom:2px solid #cbd5e1">十六進位</th>
        <th style="padding:8px;text-align:left;border-bottom:2px solid #cbd5e1">二進位（8 位元）</th>
      </tr></thead><tbody>
      ${[...s].map(c => {
        const code = c.codePointAt(0);
        const over = code > 255;
        return `<tr>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:16px">${c === ' ' ? '␣' : c}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">${code}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace">0x${code.toString(16).toUpperCase()}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:'JetBrains Mono',monospace;color:#6D28D9;font-weight:700">
            ${over ? `<span style="color:#dc2626">超過 255，需要多個位元組</span>` : code.toString(2).padStart(8, '0')}</td>
        </tr>`;
      }).join('')}
      </tbody></table></div>
    <p class="muted" style="margin-top:10px">💡 中文字的編碼值遠大於 255，所以無法塞進一個位元組——這就是為什麼中文通常需要 <strong>2～4 個位元組</strong>（UTF-8）來儲存。</p>`;
  check();
}
document.getElementById('msg').addEventListener('input', renderEncoded);

// ---------- 同位檢查 ----------
const ORIGINAL = [1, 0, 1, 1, 0, 0, 1, 0];
let pbits = [...ORIGINAL];
const parityOf = arr => arr.reduce((s, b) => s + b, 0) % 2;
const SENT_PARITY = parityOf(ORIGINAL);   // 送出時算好的同位位元

function renderParity() {
  document.getElementById('pbits').innerHTML = pbits.map((b, i) =>
    `<div class="bit"><div class="bit-box ${b ? 'on' : ''}" data-p="${i}"
      style="${b !== ORIGINAL[i] ? 'border-color:#ef4444;box-shadow:0 0 12px rgba(239,68,68,.6)' : ''}">${b}</div>
     <div class="bit-w" style="color:${b !== ORIGINAL[i] ? '#ef4444' : '#64748b'}">${b !== ORIGINAL[i] ? '翻轉!' : 'bit' + i}</div></div>`).join('');
  document.getElementById('pbit').textContent = SENT_PARITY;

  const now = parityOf(pbits);
  const flipped = pbits.filter((b, i) => b !== ORIGINAL[i]).length;
  const v = document.getElementById('parityVerdict');

  if (flipped === 0) {
    v.className = 'verdict good';
    v.textContent = `✅ 資料完好。1 的個數為 ${pbits.reduce((s, b) => s + b, 0)}，與同位位元 ${SENT_PARITY} 一致。`;
  } else if (now !== SENT_PARITY) {
    v.className = 'verdict bad';
    v.textContent = `🚨 偵測到錯誤！翻了 ${flipped} 個位元（奇數），同位檢查發現不一致 → 接收端會要求重傳。`;
  } else {
    v.className = 'verdict warn';
    v.textContent = `⚠️ 危險：翻了 ${flipped} 個位元（偶數），1 的個數又變回一致——同位檢查<strong>完全查不出來</strong>，錯誤資料會被當成正確的收下。`;
  }
  check();
}

document.getElementById('pbits').addEventListener('click', e => {
  const el = e.target.closest('.bit-box'); if (!el) return;
  const i = +el.dataset.p; pbits[i] ^= 1;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  renderParity();
});
document.getElementById('pReset').addEventListener('click', () => { pbits = [...ORIGINAL]; renderParity(); });

// ---------- 挑戰 ----------
const QUESTS = [
  { id: 'q_max',  text: '把 8 個位元全部打開，找出一個位元組的最大值', hint: '128+64+32+…+1 是多少？',
    test: () => value() === 255 },
  { id: 'q_char', text: '用位元湊出大寫字母 A（提示：它的編碼是 65）', hint: '65 = 64 + 1',
    test: () => value() === 65 },
  { id: 'q_cjk',  text: '在文字框輸入一個中文字，看它為什麼塞不進一個位元組', hint: '直接打一個中文字',
    test: () => [...(document.getElementById('msg').value || '')].some(c => c.codePointAt(0) > 255) },
  { id: 'q_undetect', text: '製造一個「同位檢查抓不到」的錯誤', hint: '翻轉偶數個位元試試',
    test: () => { const f = pbits.filter((b, i) => b !== ORIGINAL[i]).length; return f > 0 && f % 2 === 0; } },
];
const done = new Set(loadP().module1_quests || []);

function renderQuests() {
  document.getElementById('quests').innerHTML = QUESTS.map(q => {
    const d = done.has(q.id);
    return `<li style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;
      background:${d ? '#dcfce7' : '#f8fafc'};border-left:4px solid ${d ? '#22c55e' : '#cbd5e1'}">
      <span style="font-size:18px">${d ? '✅' : '⬜'}</span>
      <div><div style="font-weight:700;font-size:14px;color:${d ? '#15803d' : '#1e293b'}">${q.text}</div>
      <div style="font-size:12.5px;color:#64748b;margin-top:2px">💡 ${q.hint}</div></div></li>`;
  }).join('');
  progEl.textContent = `挑戰完成 ${done.size} / ${QUESTS.length}`;
}

function check() {
  let newly = false;
  QUESTS.forEach(q => { if (!done.has(q.id) && q.test()) { done.add(q.id); newly = true; } });
  if (!newly) return;
  const p = loadP(); p.module1_quests = Array.from(done);
  if (done.size === QUESTS.length) {
    p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    if (typeof showToast === 'function') showToast('🎉 四個挑戰都完成了！', 'good');
  } else {
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    if (typeof showToast === 'function') showToast('✅ 挑戰達成！', 'good');
  }
  saveP(p); renderQuests();
}

renderQuests();
if (done.size === QUESTS.length) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
renderBits(); renderEncoded(); renderParity();
