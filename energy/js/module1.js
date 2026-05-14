// 能源系統 模組 1：5 種能源
const ENERGIES = [
  { id: 'fossil', iso: 'fossil', name: '化石燃料 Fossil', icon: '🛢', renewable: false, tw_share: '81%', co2: '~900 g/kWh',
    desc: '煤、石油、天然氣——上億年前生物遺骸經高壓高溫形成。台灣 2024 年仍佔總發電 81%（燃煤 43% + 燃氣 38%）。',
    pros: '能量密度高、技術成熟、發電穩定', cons: '不可再生、高 CO₂ 排放、空汙、價格波動' },
  { id: 'nuclear', iso: 'nuclear', name: '核能 Nuclear', icon: '☢', renewable: false, tw_share: '5%', co2: '~12 g/kWh',
    desc: '鈾-235 核分裂釋放熱能→水變蒸汽→推動渦輪發電。台灣目前 1 部核三 2 號機運轉中（2025 將除役）。',
    pros: '碳排極低、發電穩定、能量密度極高', cons: '核廢料 10 萬年才衰變、災難風險、輿論爭議' },
  { id: 'solar', iso: 'solar', name: '太陽能 Solar', icon: '☀', renewable: true, tw_share: '~5%', co2: '~45 g/kWh',
    desc: '光伏（PV）效應—光直接轉電。台灣日照豐沛，2024 年累計裝置量達 14 GW（為再生能源中裝置量最大者）；但實際發電量約佔總發電 5%，受夜間／陰雨影響大，須搭配儲能。資料來源：經濟部能源署《能源統計月報》。',
    pros: '無燃料費、零汙染、可建在屋頂', cons: '模組效率約 20-22%（IEA 2023）、需大面積、發電量受天候影響' },
  { id: 'wind', iso: 'wind', name: '風力 Wind', icon: '🌬', renewable: true, tw_share: '~2%', co2: '~11 g/kWh',
    desc: '風能推動風機葉片→帶動發電機。台灣海峽風場世界級，2024 年離岸風電開始大規模商轉。',
    pros: '台灣海峽風能豐沛、效率較太陽能高', cons: '颱風損壞、低頻噪音、鳥類撞擊' },
  { id: 'hydro', iso: 'hydro', name: '水力 Hydro', icon: '💧', renewable: true, tw_share: '~1.5%', co2: '~24 g/kWh',
    desc: '水位差勢能→推動水輪機→發電。台灣山多水急，主力是抽蓄水力（儲能用）。',
    pros: '效率最高（>90%）、可作儲能調節', cons: '受降雨影響、生態破壞、可建場地有限' },
];

const PK = 'energy_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

ENERGIES.forEach(e => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid ${e.renewable ? '#16A34A' : '#CA8A04'};${seen.has(e.id) ? 'background:#FEF9C3' : ''}`;
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <img src="../../models/energy/${e.iso}-iso.png" alt="${e.name}" style="width:64px;height:64px;object-fit:contain;background:#1E293B;border-radius:6px;flex-shrink:0" loading="lazy">
      <h4 style="margin:0;color:#854D0E">${e.name}</h4>
    </div>
    <p style="font-size:12.5px;color:${e.renewable ? '#16A34A' : '#dc2626'};font-weight:700">${e.renewable ? '✓ 可再生' : '✗ 不可再生'} ・ 台灣佔比 ${e.tw_share} ・ CO₂ ${e.co2}</p>
    <p style="font-size:13px;color:#444;margin:8px 0">${e.desc}</p>
    <p style="font-size:12.5px;color:#16A34A"><strong>優：</strong>${e.pros}</p>
    <p style="font-size:12.5px;color:#dc2626"><strong>缺：</strong>${e.cons}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(e.id)) {
      seen.add(e.id); card.style.background = '#FEF9C3';
      progEl.textContent = `已認識 ${seen.size} / 5 種`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 5) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 5 種能源都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 5 種`;
if (seen.size === 5) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
