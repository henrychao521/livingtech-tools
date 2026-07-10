// 微控制器 模組 1：3 大平台
const MCUS = [
  { id: 'arduino', iso: 'arduino', name: 'Arduino UNO', icon: '🔧', cpu: 'ATmega328P 8-bit @ 16MHz', memory: '32 KB Flash / 2 KB RAM', pins: '14 數位 / 6 類比',
    price: 'NT$ 400-600 原廠', wifi: false, ide: 'Arduino IDE（C/C++）', good: '電子初學者最友善、社群龐大、教材最多、教科書標準',
    bad: '無 Wi-Fi / 藍牙、處理速度慢、無內建感測器',
    use: '基礎電子課程、創意公仔燈、簡易自動化、學校 STEAM' },
  { id: 'microbit', iso: 'microbit', name: 'BBC micro:bit V2', icon: '🎨', cpu: 'ARM Cortex-M4 @ 64MHz', memory: '512 KB Flash / 128 KB RAM', pins: '25 引腳（含按鈕、LED 矩陣）',
    price: 'NT$ 600-800', wifi: false, ide: 'MakeCode（圖形化）/ Python', good: '英國 BBC 設計、內建 LED 矩陣 + 加速度計 + 麥克風 + 喇叭、藍牙、圖形化編程',
    bad: '價格較高、擴充性受限、無 Wi-Fi',
    use: '國小到國中入門、體育穿戴、互動藝術、UK 全國中小學標配' },
  { id: 'esp32', iso: 'esp32', name: 'ESP32', icon: '📡', cpu: 'Xtensa LX6 雙核 @ 240MHz', memory: '4 MB Flash / 520 KB RAM', pins: '36 引腳（GPIO + ADC + DAC）',
    price: 'NT$ 200-300', wifi: true, ide: 'Arduino IDE / MicroPython / PlatformIO', good: '便宜、效能強、Wi-Fi + 藍牙內建、雙核、低功耗',
    bad: '比 Arduino 稍複雜、文件英文為主、引腳 3.3V 不耐 5V',
    use: '物聯網（IoT）、無線感測、雲端上傳、進階創客專題' },
];

const PK = 'mc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

MCUS.forEach(m => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #6366F1;${seen.has(m.id) ? 'background:#E0E7FF' : ''}`;
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
    <img src="../../models/microcontroller/${m.iso}-iso.png" alt="${m.name}" style="width:64px;height:64px;object-fit:contain;background:#1E293B;border-radius:6px;flex-shrink:0" loading="lazy">
    <h4 style="margin:0;color:#4338CA">${m.name}</h4>
  </div>
    <div style="font-size:12.5px;color:#666;margin:6px 0">
      <div><strong>CPU：</strong>${m.cpu}</div>
      <div><strong>記憶體：</strong>${m.memory}</div>
      <div><strong>引腳：</strong>${m.pins}</div>
      <div><strong>價格：</strong>${m.price}</div>
      <div><strong>無線：</strong>${m.wifi ? '✓ Wi-Fi + 藍牙' : '✗ 無'}</div>
      <div><strong>IDE：</strong>${m.ide}</div>
    </div>
    <p style="font-size:12.5px;color:#16A34A;margin-top:8px"><strong>優：</strong>${m.good}</p>
    <p style="font-size:12.5px;color:#dc2626"><strong>缺：</strong>${m.bad}</p>
    <p style="font-size:12.5px;color:#666;margin-top:6px"><strong>建議用途：</strong>${m.use}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(m.id)) {
      seen.add(m.id); card.style.background = '#E0E7FF';
      progEl.textContent = `已認識 ${seen.size} / 3 種`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 3) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 3 大微控制器都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 3 種`;
if (seen.size === 3) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }

/* ── 用電安全專區：情境測驗 ────────────────────────────── */
const SAFETY_QUIZ = [
  { q: '同學想把 Arduino UNO（5V 邏輯）的輸出訊號線直接接到 ESP32 的腳位上,會發生什麼事？',
    opts: ['沒問題,兩塊板子都能用', 'ESP32 腳位可能被 5V 燒毀,必須經過電平轉換', '只會跑得比較慢', 'Arduino 會自動降壓成 3.3V'],
    ans: 1, explain: 'ESP32 是 3.3V 邏輯,腳位不耐 5V。兩塊板子的訊號線要互接,必須加電平轉換模組（Level Shifter）。' },
  { q: '麵包板電路剛接好,要通電之前該做什麼？',
    opts: ['直接插 USB 看看會不會動', '先寫好程式再說', '對照電路圖從電源到 GND 檢查兩遍,確認極性與腳位無誤再插 USB', '用手摸每個元件確認位置'],
    ans: 2, explain: '「檢查兩遍再通電」是麵包板實驗鐵律——檢查電源極性、腳位號碼、有無短路,確認無誤才通電。' },
  { q: '通電後 LED 沒亮,第一步該怎麼做？',
    opts: ['把電壓調高一點看會不會亮', '先拔掉 USB 斷電,再檢查 LED 極性（長腳接正）與接線', '直接換一顆 LED', '用手摸元件看哪個在發燙'],
    ans: 1, explain: '除錯第一步永遠是「先斷電」,再檢查 LED 極性與接線。帶電亂動線材或用手摸發燙元件都很危險。' },
];
const sQuizEl = document.getElementById('safety-quiz');
if (sQuizEl) {
  const sAnswered = new Set(); let sCorrect = 0;
  SAFETY_QUIZ.forEach((q, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px';
    div.innerHTML = `<p style="font-size:14px;margin-bottom:6px"><strong>題 ${i + 1}：</strong>${q.q}</p>
      <div class="choice-grid" style="grid-template-columns:1fr">${q.opts.map((o, k) => `<button class="choice" data-q="${i}" data-k="${k}" style="text-align:left">${o}</button>`).join('')}</div>
      <div class="feedback-slot"></div>`;
    sQuizEl.appendChild(div);
  });
  sQuizEl.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
    const i = parseInt(b.dataset.q);
    if (sAnswered.has(i)) return;
    const ok = parseInt(b.dataset.k) === SAFETY_QUIZ[i].ans;
    const parent = b.closest('div[style*="border-radius"]') || b.closest('div');
    parent.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (parseInt(x.dataset.k) === SAFETY_QUIZ[i].ans) x.classList.add('correct'); if (x === b && !ok) x.classList.add('wrong'); });
    parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}" style="margin-top:6px">${ok ? '✓' : '✗'} ${SAFETY_QUIZ[i].explain}</div>`;
    if (ok) { sCorrect++; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
    sAnswered.add(i);
    if (sAnswered.size === SAFETY_QUIZ.length) {
      const pp = loadP(); pp.module1_safety = true; pp.module1_safety_score = sCorrect; saveP(pp);
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      showToast(`🧯 用電安全測驗 ${sCorrect}/${SAFETY_QUIZ.length} 答對`, sCorrect === SAFETY_QUIZ.length ? 'good' : 'info');
    }
  }));
}
