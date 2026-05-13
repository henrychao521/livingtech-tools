// 能源系統 模組 5：家庭用電試算
const APPS = [
  { name: '冷氣（變頻 1.0t）', w: 900, h: 8 },
  { name: '冰箱（500L）', w: 100, h: 24 },
  { name: 'LED 燈（10 盞 × 12W）', w: 120, h: 5 },
  { name: '電視（55" LED）', w: 100, h: 4 },
  { name: '電腦 + 螢幕', w: 200, h: 6 },
  { name: '洗衣機', w: 500, h: 1 },
  { name: '熱水器（電熱水瓶）', w: 800, h: 3 },
  { name: '電鍋', w: 700, h: 0.5 },
  { name: '吹風機', w: 1200, h: 0.2 },
  { name: '其他待機電器', w: 50, h: 24 },
];

const TIPS = [
  { tip: '冷氣設 26°C', saving: '每升高 1°C 省電 6%。設 26°C 比 22°C 省 24% 冷氣電。' },
  { tip: '換 LED 燈', saving: '比傳統燈泡省 80% 電、壽命長 25 倍。1 顆燈泡 10 年回本 4 倍。' },
  { tip: '冰箱不要塞太滿', saving: '塞 70% 即可，超過會擋住循環。但冷凍庫要塞滿才有效率（保冷石）。' },
  { tip: '拔掉待機電器', saving: '電視、電腦、微波爐待機共佔家中 5-10% 電。沒在用就拔。' },
  { tip: '用節能洗衣模式', saving: '用冷水洗+脫水後晾乾，比烘乾省 80% 電。' },
  { tip: '裝太陽能熱水器', saving: '一家四口熱水年省 6000 元。屋頂型 3-5 年回本。' },
  { tip: '電器選 1 級能效', saving: '1 級比 5 級省 50-100% 電。冷氣冰箱差距最大。' },
  { tip: '夏季尖峰減用', saving: '夏季 7-9 月 16-22 點是尖峰。錯峰用電可避開高電價。' },
  { tip: '裝智慧電表（HEMS）', saving: '看到即時用電會自動省 5-10%。台電現有補助。' },
  { tip: '裝屋頂太陽能板', saving: '5kW 系統一年發 6000 度。售電給台電一年回 24000 元。8-10 年回本。' },
];

const PK = 'energy_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const appsEl = document.getElementById('apps');
const state = APPS.map(a => ({ ...a, hrs: a.h }));
state.forEach((a, i) => {
  const row = document.createElement('div');
  row.className = 'app-row';
  row.innerHTML = `<label>${a.name}（${a.w}W）</label><input type="number" min="0" max="24" step="0.5" data-i="${i}" value="${a.hrs}"> 時/天`;
  appsEl.appendChild(row);
});

function calc() {
  let kwhDay = 0;
  state.forEach((a, i) => {
    const v = parseFloat(document.querySelectorAll('input')[i].value) || 0;
    a.hrs = v;
    kwhDay += (a.w * v) / 1000;
  });
  const kwhMonth = kwhDay * 30;
  // 夏季電價簡化：120 度 1.63、330 度 2.38、500 度 3.52、超過 4.8
  let cost = 0;
  let r = kwhMonth;
  if (r > 0) { const t = Math.min(r, 120); cost += t * 1.63; r -= t; }
  if (r > 0) { const t = Math.min(r, 210); cost += t * 2.38; r -= t; }
  if (r > 0) { const t = Math.min(r, 170); cost += t * 3.52; r -= t; }
  if (r > 0) cost += r * 4.8;
  // CO₂ 排放係數（台灣 2023 約 495 g/kWh）
  const co2Kg = (kwhMonth * 495) / 1000;
  const trees = co2Kg / 22; // 一棵樹年吸 22kg CO₂

  document.getElementById('m-kwh').textContent = kwhMonth.toFixed(0) + ' kWh';
  document.getElementById('m-cost').textContent = cost.toFixed(0) + ' 元';
  document.getElementById('m-co2').textContent = co2Kg.toFixed(1) + ' kg';
  document.getElementById('m-trees').textContent = trees.toFixed(1) + ' 棵';
}
appsEl.addEventListener('input', calc);
calc();

const tipsEl = document.getElementById('tips');
TIPS.forEach((t, i) => {
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;border-left:4px solid #16A34A';
  card.innerHTML = `<h4 style="margin:0 0 6px;color:#15803D;font-size:14px">${i + 1}. ${t.tip}</h4><p style="font-size:13px;color:#444">${t.saving}</p>`;
  tipsEl.appendChild(card);
});

const p = loadP(); p.module5 = true; saveP(p);
