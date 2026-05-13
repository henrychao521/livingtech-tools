// 動力與運輸 模組 4：效率模擬器
// 基準：以中型房車（1500cc 汽油）= 1.0 對應 ~6 L/100km 或 ~15 kWh/100km
// 數據來源：US EPA Fuel Economy、IEA Global EV Outlook 2024、台灣能源局《車輛能源消耗指南》
const VEHICLES = {
  sedan: { name: '中型房車', icon: '🚗', baseConsumption: 1, desc: '1500cc 級 4 門家用房車・基準耗能（汽油約 6 L/100km、電動約 15 kWh/100km）' },
  bus:   { name: '城市巴士', icon: '🚌', baseConsumption: 4, desc: '40 人座城市公車・約為房車 4 倍耗能（柴油約 25 L/100km，但每人公里能耗比房車低）' },
  truck: { name: '大卡車', icon: '🚛', baseConsumption: 5, desc: '10 噸載重卡車・滿載柴油約 30 L/100km' },
  bike:  { name: '機車', icon: '🛵', baseConsumption: 0.3, desc: '125cc 速克達・約 2 L/100km（每公里能耗最低）' },
};
// 效率為「燃料／電能 → 車輪動力」之 well-to-wheel 系統效率
// 汽油內燃機 ~25% 為動力總成上限（含變速箱、傳動損失）；電動車馬達效率 ~90%（但若計入發電廠效率則約 30-40%）
// 來源：U.S. Department of Energy fueleconomy.gov、IEA《Global Energy Review 2024》
const POWERS = {
  ice:    { name: '汽油內燃機', eff: 25, unit: 'L/100km', costPerUnit: 30, co2PerUnit: 2350, fuelMul: 1.0 },
  diesel: { name: '柴油內燃機', eff: 30, unit: 'L/100km', costPerUnit: 28, co2PerUnit: 2680, fuelMul: 0.85 },
  ev:     { name: '電動 EV',   eff: 90, unit: 'kWh/100km', costPerUnit: 5, co2PerUnit: 495, fuelMul: 15 },
  hybrid: { name: '油電混合',   eff: 40, unit: 'L/100km', costPerUnit: 30, co2PerUnit: 2350, fuelMul: 0.6 },
  fc:     { name: '燃料電池',   eff: 60, unit: 'kg/100km', costPerUnit: 250, co2PerUnit: 0, fuelMul: 1.0 },
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
  $('r-trees').textContent = trees.toFixed(2) + ' 棵/年';
  $('r-co2').style.color = totalCO2 > 50000 ? '#dc2626' : totalCO2 > 10000 ? '#eab308' : '#16A34A';
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  veh = t.dataset.c;
  calc();
}));
$('s-power').addEventListener('change', calc);
$('s-dist').addEventListener('input', calc);
calc();

const p = loadP(); p.module4 = true; saveP(p);
