// 能源系統 模組 4：發電方式比較
const DATA = {
  fossil:  { name: '燃煤發電', icon: '🛢', eff: 38, cost: 2.1, co2: 900, build: 8, share: 43, desc: '台中、林口等大型電廠。穩定但 CO₂ 排放最高。空汙嚴重期會被要求降載。' },
  gas:     { name: '燃氣發電', icon: '⛽', eff: 55, cost: 3.5, co2: 490, build: 6, share: 38, desc: '大潭、通霄等。LNG 從卡達/澳洲海運來台。可快速啟停，調節負載彈性最高。' },
  nuclear: { name: '核能發電', icon: '☢', eff: 33, cost: 1.5, co2: 12,  build: 35, share: 5,  desc: '核三 2 號機（2025 將除役）。發電穩定、碳排極低，但核廢料處理是世紀難題。' },
  solar:   { name: '太陽能發電', icon: '☀', eff: 22, cost: 4.5, co2: 45, build: 4, share: 5, desc: '裝置量已達 14GW。屋頂型 + 大型地面型。發電量看天氣，需配合儲能系統。' },
  wind:    { name: '風力發電', icon: '🌬', eff: 35, cost: 5.5, co2: 11, build: 15, share: 2, desc: '台灣海峽世界級風場。離岸風電 2024 年起大規模商轉。颱風時要停機。' },
};

const PK = 'energy_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const $ = id => document.getElementById(id);

function show(key) {
  const d = DATA[key];
  document.querySelectorAll('.e-tab').forEach(t => t.classList.toggle('active', t.dataset.e === key));
  $('info').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px"><span style="font-size:32px">${d.icon}</span><h4 style="margin:0;color:#854D0E">${d.name}</h4></div>
    <p style="font-size:13.5px;color:#444">${d.desc}</p>`;
  $('r-eff').textContent = d.eff + '%';
  $('r-cost').textContent = '~ NT$' + d.cost;
  $('r-co2').textContent = d.co2 + ' g';
  $('r-build').textContent = d.build + ' 億';
  $('r-share').textContent = d.share + '%';
  $('r-co2').style.color = d.co2 > 500 ? '#dc2626' : d.co2 > 100 ? '#eab308' : '#16A34A';
}

document.querySelectorAll('.e-tab').forEach(t => t.addEventListener('click', () => show(t.dataset.e)));
show('fossil');

// 排行圖
const bars = $('bars');
function bar(label, values, max, unit, colors) {
  const div = document.createElement('div');
  div.innerHTML = `<p style="font-weight:700;color:#854D0E;margin-bottom:6px">${label}</p>` +
    Object.entries(values).map(([k, v]) => `
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
        <span style="width:80px;font-size:13px">${DATA[k].icon} ${DATA[k].name.replace('發電','')}</span>
        <div style="flex:1;background:#f1f5f9;border-radius:6px;height:18px;overflow:hidden"><div style="background:${colors[k] || '#CA8A04'};width:${(v/max)*100}%;height:100%"></div></div>
        <span style="width:90px;text-align:right;font-family:var(--font-mono);font-weight:700;font-size:12px;color:#854D0E">${v} ${unit}</span>
      </div>`).join('');
  bars.appendChild(div);
}

bar('💰 每度電成本 NT$', Object.fromEntries(Object.entries(DATA).map(([k,v]) => [k, v.cost])), 6, '元', { fossil:'#854D0E', gas:'#92400E', nuclear:'#1E40AF', solar:'#CA8A04', wind:'#0EA5E9' });
bar('🏭 CO₂ 排放 g/kWh', Object.fromEntries(Object.entries(DATA).map(([k,v]) => [k, v.co2])), 1000, 'g', { fossil:'#dc2626', gas:'#eab308', nuclear:'#22c55e', solar:'#22c55e', wind:'#22c55e' });
bar('⚙ 發電效率 %', Object.fromEntries(Object.entries(DATA).map(([k,v]) => [k, v.eff])), 60, '%', { fossil:'#92400E', gas:'#16A34A', nuclear:'#1E40AF', solar:'#CA8A04', wind:'#0EA5E9' });

const p = loadP(); p.module4 = true; saveP(p);
