// 三視圖 模組 1：核心概念
const CONCEPTS = [
  { name: '第三角投影法', icon: '📐', desc: '物體放在「觀察者與投影面」之間——觀察方向先穿過物體再到投影面。是中華民國國家標準（CNS）與美國 ANSI 採用的方式。', detail: '對應：正視在前、俯視在下、左側視在左。日本 JIS 與歐洲 ISO 用第一角投影（順序相反）。' },
  { name: '6 個基本視圖', icon: '🎲', desc: '一個物體可從 6 個方向投影：正視（前視）、後視、左側視、右側視、俯視、仰視。實作通常只畫 3 個就夠。', detail: '選擇原則：選最能表達物體特徵的 3 個視圖。圓柱通常選正視 + 俯視兩個。' },
  { name: '投影對齊', icon: '📏', desc: '正視在中、俯視在下、側視在右（第三角法）。三視圖之間有「投影對齊關係」——正視寬 = 俯視寬、正視高 = 側視高。', detail: '這個對齊是判讀的關鍵：依長對正、寬對等、高平齊。' },
  { name: '線型規範', icon: '✏', desc: '實線（粗）= 物體可見輪廓\n虛線（細）= 物體背後不可見輪廓\n中心線（點劃線）= 對稱軸或圓心\n尺寸線（細）= 標註尺寸用', detail: '線粗 0.7mm 實線、0.35mm 虛線、0.35mm 中心線、0.35mm 尺寸線是 CNS 標準。' },
  { name: '尺寸標註', icon: '📊', desc: '標註原則：\n• 長度：L 或 mm\n• 直徑：⌀\n• 半徑：R\n• 角度：°\n• 公差：±0.1\n標註位置：在視圖外、不重疊、好找。', detail: '同尺寸只標註一次。標到方便製造為原則——孔徑標在「該孔最明顯的視圖」上。' },
  { name: '剖視圖（補充）', icon: '🔪', desc: '物體內部複雜時，「假想切開」展示內部結構。\n切開部分用斜線（45°）剖面線表示材料。', detail: '常見剖視圖：全剖、半剖、局部剖。塑膠模具、引擎內部都用剖視。' },
];

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module1_seen) || []);
const grid = document.getElementById('grid');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');

CONCEPTS.forEach(c => {
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;cursor:pointer;border-left:5px solid #4F46E5;${seen.has(c.name) ? 'background:#E0E7FF' : ''}`;
  card.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:30px">${c.icon}</span><h4 style="margin:0;color:#3730A3">${c.name}</h4></div>
    <p style="font-size:13px;color:#444;margin:6px 0">${c.desc.replace(/\n/g, '<br>')}</p>
    <p style="font-size:12.5px;color:#666;background:#E0E7FF;padding:8px;border-radius:6px"><strong>💡：</strong>${c.detail}</p>`;
  card.addEventListener('click', () => {
    if (!seen.has(c.name)) {
      seen.add(c.name); card.style.background = '#E0E7FF';
      progEl.textContent = `已認識 ${seen.size} / 6 項`;
      const p = loadP(); p.module1_seen = Array.from(seen);
      if (seen.size === 6) { p.module1 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 6 個概念都認識！', 'good'); } else if (typeof SoundFX !== 'undefined') SoundFX.pop();
      saveP(p);
    }
  });
  grid.appendChild(card);
});
progEl.textContent = `已認識 ${seen.size} / 6 項`;
if (seen.size === 6) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
