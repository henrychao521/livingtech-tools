// 微控制器 模組 1：3 大平台
const MCUS = [
  { id: 'arduino', name: 'Arduino UNO', icon: '🔧', cpu: 'ATmega328P 8-bit @ 16MHz', memory: '32 KB Flash / 2 KB RAM', pins: '14 數位 / 6 類比',
    price: 'NT$ 400-600 原廠', wifi: false, ide: 'Arduino IDE（C/C++）', good: '電子初學者最友善、社群龐大、教材最多、教科書標準',
    bad: '無 Wi-Fi / 藍牙、處理速度慢、無內建感測器',
    use: '基礎電子課程、創意公仔燈、簡易自動化、學校 STEAM' },
  { id: 'microbit', name: 'BBC micro:bit V2', icon: '🎨', cpu: 'ARM Cortex-M4 @ 64MHz', memory: '512 KB Flash / 128 KB RAM', pins: '25 引腳（含按鈕、LED 矩陣）',
    price: 'NT$ 600-800', wifi: false, ide: 'MakeCode（圖形化）/ Python', good: '英國 BBC 設計、內建 LED 矩陣 + 加速度計 + 麥克風 + 喇叭、藍牙、圖形化編程',
    bad: '價格較高、擴充性受限、無 Wi-Fi',
    use: '國小到國中入門、體育穿戴、互動藝術、UK 全國中小學標配' },
  { id: 'esp32', name: 'ESP32', icon: '📡', cpu: 'Xtensa LX6 雙核 @ 240MHz', memory: '4 MB Flash / 520 KB RAM', pins: '36 引腳（GPIO + ADC + DAC）',
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
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:32px">${m.icon}</span><h4 style="margin:0;color:#4338CA">${m.name}</h4></div>
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
