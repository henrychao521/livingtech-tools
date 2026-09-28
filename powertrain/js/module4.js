// 動力與運輸 模組 4：效率模擬器
// 基準：以中型房車 baseConsumption = 1.0；fuelMul 為房車的每百公里絕對耗能
// （汽油 6 L、柴油 5.1 L、油電 3.6 L、電動 15 kWh、燃料電池 1.0 kg），其他車型乘上 baseConsumption
// 數據來源：US EPA Fuel Economy、IEA Global EV Outlook 2024、台灣能源局《車輛能源消耗指南》
const VEHICLES = {
  sedan: { name: '中型房車', icon: '🚗', baseConsumption: 1, desc: '1500cc 級 4 門家用房車・基準耗能（汽油約 6 L/100km、電動約 15 kWh/100km）' },
  bus:   { name: '城市巴士', icon: '🚌', baseConsumption: 4.9, desc: '40 人座城市公車・約為房車 5 倍耗能（柴油約 25 L/100km，但每人公里能耗比房車低）' },
  truck: { name: '大卡車', icon: '🚛', baseConsumption: 5.9, desc: '10 噸載重卡車・約為房車 6 倍耗能（滿載柴油約 30 L/100km）' },
  bike:  { name: '機車', icon: '🛵', baseConsumption: 0.33, desc: '125cc 速克達・約 2 L/100km（每公里能耗最低）' },
};
// 效率為「燃料／電能 → 車輪動力」之 tank-to-wheel（車端）效率
// 汽油內燃機 ~25% 為動力總成上限（含變速箱、傳動損失）；電動車馬達效率 ~90%（但若計入發電廠效率則約 30-40%）
// 來源：U.S. Department of Energy fueleconomy.gov、IEA《Global Energy Review 2024》
const POWERS = {
  ice:    { name: '汽油內燃機', eff: 25, unit: 'L/100km', costPerUnit: 30, co2PerUnit: 2350, fuelMul: 6 },   // 2350 g/L：US EPA 8,887 g CO₂/加侖 ÷ 3.785
  diesel: { name: '柴油內燃機', eff: 30, unit: 'L/100km', costPerUnit: 28, co2PerUnit: 2680, fuelMul: 5.1 },
  ev:     { name: '電動 EV',   eff: 90, unit: 'kWh/100km', costPerUnit: 5, co2PerUnit: 467, fuelMul: 15 },   // 467 g/kWh：能源署 114 年度電力排碳係數，與能源站 ENERGY_DATA.CO2_FACTOR 同值
  hybrid: { name: '油電混合',   eff: 40, unit: 'L/100km', costPerUnit: 30, co2PerUnit: 2350, fuelMul: 3.6 },
  fc:     { name: '燃料電池',   eff: 60, unit: 'kg/100km', costPerUnit: 250, co2PerUnit: 10000, fuelMul: 1.0 },
};

// CO₂ 口徑：汽油／柴油只算排氣管排放；電動車以台灣電力排碳係數（經濟部能源署 114 年度 0.467 kg CO2e/度）計、
// 燃料電池以灰氫（天然氣重組製氫，IEA《Global Hydrogen Review 2024》10–12 kg CO2-eq/kg H₂，取 10）計，
// 後兩者都含能源生產端，燃料電池車端雖然零排放，製氫仍有碳排
const CO2_NOTE = {
  ice: '只算排氣管排放（不含煉油、運輸）',
  diesel: '只算排氣管排放（不含煉油、運輸）',
  hybrid: '只算排氣管排放（不含煉油、運輸）',
  ev: '車端零排放；此數字是發電端排放（台灣電力排碳係數約 0.47 kg/度，114 年度）',
  fc: '車端只排水；此數字是製氫排放（以天然氣製的灰氫約 10 kg CO₂/kg 計）',
};

const PK = 'pt_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const $ = id => document.getElementById(id);

let veh = 'sedan';
function calc() {
  const v = VEHICLES[veh];
  const pId = $('s-power').value;
  const p = POWERS[pId];
  const dist = parseInt($('s-dist').value);
  $('info').innerHTML = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><span style="font-size:32px">${v.icon}</span><h4 style="margin:0;color:#9A3412">${v.name} ・ ${p.name}</h4></div><p style="font-size:13px;color:#666">${v.desc}</p>`;
  const consume100km = v.baseConsumption * p.fuelMul; // 每百公里
  const totalFuel = consume100km * dist / 100;
  const totalCost = totalFuel * p.costPerUnit;
  const totalCO2 = totalFuel * p.co2PerUnit; // g
  const trees = totalCO2 / 22000;
  $('v-dist').textContent = dist + ' km';
  $('r-eff').textContent = p.eff + '%';
  $('r-fuel').textContent = totalFuel.toFixed(2) + ' ' + (p.unit.split('/')[0]);
  $('r-cost').textContent = 'NT$ ' + totalCost.toFixed(0);
  $('r-co2').textContent = (totalCO2 / 1000).toFixed(1) + ' kg';
  $('r-trees').textContent = trees.toFixed(2) + ' 棵';
  $('r-co2').style.color = totalCO2 > 50000 ? '#dc2626' : totalCO2 > 10000 ? '#eab308' : '#16A34A';
  $('r-co2-note').textContent = CO2_NOTE[pId];
  markUsed(pId);
}

// 完成條件：至少比較過 2 種動力來源，而且調整過行駛距離
const usedPowers = new Set();
let distMoved = false;
function markUsed(pId) {
  usedPowers.add(pId);
  if (usedPowers.size < 2 || !distMoved) return;
  const pr = loadP();
  if (pr.module4) return;
  pr.module4 = true; saveP(pr);
  if (typeof showToast === 'function') showToast('✅ 已比較多種動力來源，模組 4 完成！', 'good');
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  veh = t.dataset.c;
  calc();
}));
$('s-power').addEventListener('change', calc);
$('s-dist').addEventListener('input', () => { distMoved = true; calc(); });
calc();
