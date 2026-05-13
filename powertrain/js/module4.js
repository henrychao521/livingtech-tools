// 動力與運輸 模組 4：效率模擬器
const VEHICLES = {
  sedan: { name: '中型房車', icon: '🚗', baseConsumption: 1, desc: '一般家用 4 門房車，1500cc 級' },
  bus:   { name: '城市巴士', icon: '🚌', baseConsumption: 4, desc: '可載 40 人的城市公車' },
  truck: { name: '大卡車', icon: '🚛', baseConsumption: 5, desc: '10 噸載重卡車' },
  bike:  { name: '機車', icon: '🛵', baseConsumption: 0.3, desc: '125cc 速克達' },
};
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
