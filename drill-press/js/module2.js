// 鑽床 模組 2：安全闖關
const SCENARIOS = [
  { q: '把鑽頭裝進鑽床夾頭後，下一步？', a: '直接按開關鑽孔', b: '把夾頭鑰匙拔下、確認沒留在夾頭上才開機', correct: 'b', explain: '夾頭鑰匙沒拔下開機會以高速被甩飛，可能擊中眼睛或臉部。這是鑽床「永遠的第一守則」：開機前先確認鑰匙在工具盒裡。' },
  { q: '想鑽一塊小金屬片，工件可以用手按住嗎？', a: '絕對不行！要用機台老虎鉗或 C 型夾固定在工作檯上', b: '小心一點按住就可以', correct: 'a', explain: '小工件最容易被鑽頭咬住甩起來變「飛刀」。鑽床扭力大，徒手按住的工件會直接被扯飛，手指可能被切傷。' },
  { q: '鑽鋼板（不鏽鋼）要用什麼轉速？', a: '最高速（2400 RPM）', b: '最低速（500–700 RPM），並加切削油', correct: 'b', explain: '鋼比木材硬，高速會讓鑽頭瞬間燒掉。鑽鋼必須降速、加切削油散熱，木材才用高速。轉速由皮帶位置決定。' },
  { q: '長頭髮的同學要操作鑽床，怎麼處理？', a: '必須先綁起來，最好加戴髮網或鴨舌帽', b: '把頭髮塞進衣領就好', correct: 'a', explain: '鑽床主軸轉速 500–2400 RPM，頭髮一捲入就會被瞬間扯入夾頭。長髮、寬鬆袖口、項鍊、圍巾、領帶都要先處理。' },
  { q: '操作鑽床時可以戴布手套嗎？', a: '可以，比較不會手痠', b: '禁止！手套容易被夾頭捲入', correct: 'b', explain: '布手套被夾頭咬住會把整隻手扯進去——這比沒戴手套還危險。鑽床（與所有旋轉機具）操作禁戴手套。' },
  { q: '工件下方應該怎麼處理才能保護工作檯？', a: '墊一塊「廢木板」當犧牲層', b: '直接放在工作檯上鑽', correct: 'a', explain: '鑽穿瞬間鑽頭會繼續往下，沒墊犧牲層會直接鑽進工作檯造成傷害。墊木塊也能減少工件底面爆裂。' },
  { q: '鑽到鐵屑卡在鑽頭周圍，要怎麼清？', a: '用手撥開', b: '停機 → 等鑽頭完全停止 → 用毛刷或鉤子清', correct: 'b', explain: '高速鐵屑像小刀片一樣銳利且燙手，徒手清會割傷+燙傷。停機後仍要等慣性轉完才能伸手。' },
  { q: '進刀時感覺異常吃力（鑽不下去），可能是？', a: '停機檢查——可能鑽頭鈍了或卡屑了，要退鑽排屑', b: '繼續用力推穿過去', correct: 'a', explain: '硬推會折斷鑽頭、傷工件、燒馬達。鑽不動通常代表鑽頭鈍、屑塞滿、轉速錯、或進到硬點——退出來檢查。' },
  { q: '主軸開始轉動後發現工件沒夾穩，怎麼辦？', a: '快速調整一下', b: '立刻關機、等主軸完全停止後再處理', correct: 'b', explain: '主軸轉動中接近工件區會被夾頭、鑽頭、皮帶捲入。任何調整都必須在停機後做。' },
  { q: '鑽完孔結束操作，最後一步？', a: '關機 → 等主軸停止 → 拆下鑽頭 → 清理鐵屑 → 把夾頭鑰匙歸位', b: '直接離開', correct: 'a', explain: '收尾清理是基本禮儀也是安全：留在夾頭上的鑽頭，下一個同學可能誤觸開關被刺傷；散落的鐵屑可能割人。' },
  { q: '要鑽一個 15mm 深的盲孔（不鑽穿），應該怎麼控制深度？', a: '憑感覺手動停，進刀到差不多就好', b: '設定進刀深度限位環到 15mm，主軸接觸限位後自動停', correct: 'b', explain: '進刀深度限位環（Depth Stop）是鑽床的核心優勢之一。調好後主軸會在精確深度自動頂住，每孔一致，不靠感覺。鑽盲孔（鉸鏈槽、榫孔）必用。' },
  { q: '要把皮帶從 P5（2400RPM）換到 P1（500RPM）來鑽鋼板，正確步驟是？', a: '機器停下來後，直接打開皮帶箱快速換帶', b: '先拔插頭（或關總電源）斷電，再開皮帶箱換帶，蓋回後才接電', correct: 'b', explain: '皮帶換位必須在完全斷電狀態下進行。「機器停止」不等於「電源切斷」——誤觸開關或感應啟動都可能讓皮帶在手指上運轉，造成嚴重夾傷。' },
  { q: '用 Forstner 平底鑽頭（直徑 25mm）鑽硬木盲孔，轉速應該選？', a: '最低速（P1–P2，500–720 RPM）', b: '中高速（P4–P5，1700–2400 RPM），轉快才有效率', correct: 'a', explain: 'Forstner 直徑大（15–50mm）、刃面積廣，高速時摩擦熱會讓木材焦黑，鑽頭也快速磨損。大直徑鑽頭一律選最低速段，讓扭力而非轉速做功。' },
  { q: '要在圓柱形木棒上鑽孔，如何固定在工作檯上？', a: '用 V 型槽固定塊（V-block）或機台老虎鉗的 V 型缺口夾穩', b: '圓柱直接平放工作台，用手按住就好', correct: 'a', explain: '圓柱形工件一旦被鑽頭咬住會瞬間高速旋轉。V 型槽或 V 型鉗口能讓圓柱卡進 V 型溝不轉動，是鑽圓柱的標準固定方式。' },
  { q: '想在木板上鑽一個 30° 斜角孔，鑽床可以做到嗎？', a: '可以！鬆開工作台的傾斜鎖具，用量角器調到 30° 後鎖緊再鑽', b: '不行，鑽床主軸固定垂直，斜角孔要用手電鑽', correct: 'a', explain: '鑽床工作台多設計為可左右傾斜（通常 ±45°），鬆開後方傾斜鎖具後能調整角度——這正是鑽床比手電鑽更精確的優勢。傾斜後一定要重新固定工件。' },
];
let ppeScore = 0;
let score = 0;
const PK = 'dpress_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const list = document.getElementById('scenario-list');
SCENARIOS.forEach((s, i) => {
  const div = document.createElement('div');
  div.className = 'scenario';
  div.innerHTML = `<h4>${s.q}</h4><div class="choice-grid"><button class="choice" data-q="${i}" data-c="a">A. ${s.a}</button><button class="choice" data-q="${i}" data-c="b">B. ${s.b}</button></div><div class="feedback-slot"></div>`;
  list.appendChild(div);
});
const answered = new Set();
list.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
  const i = parseInt(btn.dataset.q);
  if (answered.has(i)) return;
  const s = SCENARIOS[i];
  const correct = btn.dataset.c === s.correct;
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => { b.disabled = true; if (b.dataset.c === s.correct) b.classList.add('correct'); if (b === btn && !correct) b.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓' : '✗'} ${s.explain}</div>`;
  if (correct) { score += 10; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  const total = ppeScore + score;
  document.getElementById('score-display').textContent = total;
  document.getElementById('progress-bar').style.width = Math.min(100, total / 1.3) + '%';
  if (answered.size === SCENARIOS.length) {
    if (total >= 120) {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${total} 分通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const p = loadP(); p.module2 = true; p.safetyPassed = true; saveP(p);
    } else {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback error" style="margin-top:20px">${total} 分，未達 120 分，請重新整理再挑戰。</div>`;
    }
  }
}));

/* ── 真實事故案例參考面板 ──────────────────────────────── */
;(function () {
  const CARD_ACCIDENT = 'background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const CARD_GOV     = 'background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const TL = 'font-size:12px;color:#1d4ed8;text-decoration:underline;word-break:break-all';

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">⚠️ 真實事故案例參考</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">以下為美國 OSHA 官方記錄的鑽床事故資料，作為安全規範的具體佐證。</p>

    <div style="${CARD_ACCIDENT}">
      <div style="font-weight:700;color:#c2410c;margin-bottom:6px">🔑 夾頭鑰匙甩飛致傷｜OSHA 官方文件明確記載</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">美國職業安全衛生署（OSHA）在其鑽床操作訓練腳本中明確指出：「若夾頭鑰匙未在開機前取出，鑽床啟動時主軸轉速瞬間將鑰匙以高速甩飛，成為危險飛射物，可能擊中眼部或臉部造成重傷。」這是全球技術教育中被反覆強調的<strong>鑽床第一守則</strong>。</p>
      <a href="https://www.osha.gov/sites/default/files/2021-04/Drill%20Press%20-%20Trainer%20Script.pdf" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：OSHA Drill Press Trainer Script（英文 PDF）</a>
    </div>

    <div style="${CARD_GOV}">
      <div style="font-weight:700;color:#15803d;margin-bottom:6px">🏛️ OSHA 鑽床安全 eTool｜典型傷害模式資料庫</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">OSHA 木工機械 eTool 完整記錄了鑽床常見傷害模式：包括布手套被夾頭捲入（Entanglement）、未固定工件被甩飛（Workpiece ejection）、長頭髮捲入（Hair entanglement），以及未墊犧牲板造成的鑽床台面損傷。所有模式均附有實際事故案例摘要與預防措施。</p>
      <a href="https://www.osha.gov/etools/woodworking/production/machines-tools/drill-press" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：OSHA eTool — Drill Press（英文）</a>
    </div>

    <div style="${CARD_GOV}">
      <div style="font-weight:700;color:#15803d;margin-bottom:6px">📊 美國統計：機械工具每年造成逾 1.8 萬人住院</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">根據美國勞工統計局（Bureau of Labor Statistics）職業傷害統計資料，各類機械工具（含鑽床、車床、銑床）每年約造成 18,090 名工人需要住院治療，其中鑽孔相關傷害佔金屬加工事故的相當大比例。此數據說明了嚴格遵守操作規範的重要性。</p>
      <a href="https://www.bls.gov/iif/home.htm" target="_blank" rel="noopener noreferrer" style="${TL}">📄 資料來源：Bureau of Labor Statistics — Injuries, Illnesses and Fatalities（英文）</a>
    </div>

    <p style="font-size:12px;color:#94a3b8;margin-top:4px">※ 以上連結均為美國政府官方文件，引用於教學安全佐證之用。</p>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);
})();

/* ── PPE 裝備安全檢查遊戲 ──────────────────────────────── */
;(function () {
  const ppeSvg      = document.getElementById('ppe-svg');
  const ppeFb       = document.getElementById('ppe-feedback');
  const lockOverlay = document.getElementById('scenario-lock-overlay');
  if (!ppeSvg) return;

  /* SVG 疊加（正確放置後注入到 #ppe-svg） */
  const PPE_VISUALS = {
    'dp-goggles': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'ppe-goggles-overlay');
      g.innerHTML = `
        <ellipse cx="104" cy="56" rx="18" ry="10" fill="#1a1a1a"/>
        <ellipse cx="136" cy="56" rx="18" ry="10" fill="#1a1a1a"/>
        <line x1="122" y1="56" x2="118" y2="56" stroke="#1a1a1a" stroke-width="4"/>
        <ellipse cx="104" cy="56" rx="14" ry="7" fill="rgba(135,206,250,.55)"/>
        <ellipse cx="136" cy="56" rx="14" ry="7" fill="rgba(135,206,250,.55)"/>
        <ellipse cx="99" cy="53" rx="4" ry="2" fill="rgba(255,255,255,.7)"/>
        <ellipse cx="131" cy="53" rx="4" ry="2" fill="rgba(255,255,255,.7)"/>
      `;
      return g;
    },
    'dp-sleeves': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'ppe-sleeves-overlay');
      g.innerHTML = `
        <rect x="34" y="192" width="40" height="12" rx="5" fill="#1d4ed8" opacity=".95"/>
        <rect x="34" y="198" width="40" height="5" fill="#1e3a8a"/>
        <rect x="166" y="192" width="40" height="12" rx="5" fill="#1d4ed8" opacity=".95"/>
        <rect x="166" y="198" width="40" height="5" fill="#1e3a8a"/>
      `;
      return g;
    },
    'dp-shoes': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', 'ppe-shoes-overlay');
      g.innerHTML = `
        <ellipse cx="84" cy="394" rx="20" ry="8" fill="#1f2937"/>
        <ellipse cx="156" cy="394" rx="20" ry="8" fill="#1f2937"/>
        <path d="M66 390 L102 390 L105 394 L62 394 Z" fill="rgba(255,255,255,.25)"/>
        <path d="M138 390 L174 390 L177 394 L134 394 Z" fill="rgba(255,255,255,.25)"/>
      `;
      return g;
    },
  };

  /* 錯誤物品說明（鑽床版，強調大夾頭/高轉速危險） */
  const PPE_WRONG = {
    'dp-glove':    '鑽床夾頭比手電鑽更大、轉速更高。布手套被鑰匙式夾頭捲入的力道遠超手電鑽，0.1 秒內可扯斷手指。鑽床操作絕對禁戴布手套。',
    'dp-bracelet': '金屬手環或戒指在鑽床夾頭附近會被瞬間捲入。鑽床扭力遠超手電鑽，金屬首飾被捲入後幾乎無法人力拉出。操作前必須摘下所有金屬首飾。',
    'dp-loose':    '鑽床主軸在固定位置旋轉，操作者必須靠近機台。寬鬆長袖在接近夾頭時會被瞬間捲入，造成手臂嚴重撕裂傷。袖子必須束緊或捲到手肘以上。',
  };

  let dragged = null;
  let ppeDone = 0;

  const items = document.querySelectorAll('#ppe-items .draggable');
  const zones = document.querySelectorAll('#ppe-character .dropzone');

  function showPpeFb(msg, type) {
    if (!ppeFb) return;
    ppeFb.innerHTML = `<div class="feedback ${type}">${msg}</div>`;
    clearTimeout(ppeFb._t);
    ppeFb._t = setTimeout(() => { if (ppeFb) ppeFb.innerHTML = ''; }, 5500);
  }

  function updateTotalScore() {
    const total = ppeScore + score;
    const disp = document.getElementById('score-display');
    const bar  = document.getElementById('progress-bar');
    if (disp) disp.textContent = total;
    if (bar)  bar.style.width = Math.min(100, total / 1.3) + '%';
  }

  items.forEach(item => {
    item.addEventListener('dragstart', e => {
      dragged = item;
      e.dataTransfer.effectAllowed = 'move';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
    });
    item.addEventListener('click', () => {
      if (item.classList.contains('placed')) return;
      items.forEach(i => i.style.outline = '');
      item.style.outline = '3px solid var(--accent,#0891b2)';
      dragged = item;
    });
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#0891b2'; zone.style.background = 'rgba(8,145,178,.08)'; });
    zone.addEventListener('dragleave', () => { if (!zone.classList.contains('filled')) { zone.style.borderColor = '#cbd5e1'; zone.style.background = ''; } });
    zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor = '#cbd5e1'; zone.style.background = ''; handlePpeDrop(zone); });
    zone.addEventListener('click', () => { if (dragged) handlePpeDrop(zone); });
  });

  function handlePpeDrop(zone) {
    if (!dragged) return;
    const accept  = zone.dataset.accept;
    const id      = dragged.dataset.id;
    const correct = dragged.dataset.correct === '1';

    if (id === accept && correct) {
      zone.classList.add('filled');
      zone.style.borderColor = '#16a34a';
      zone.style.background  = 'rgba(22,163,74,.08)';
      dragged.classList.add('placed');
      dragged.style.outline = '';

      const vFn = PPE_VISUALS[id];
      if (vFn) {
        if (id === 'dp-shoes') {
          const def = ppeSvg.querySelector('#ppe-default-shoes');
          if (def) def.remove();
        }
        ppeSvg.appendChild(vFn());
      }

      ppeScore += 10;
      updateTotalScore();
      ppeDone++;
      if (typeof SoundFX !== 'undefined') SoundFX.success();
      showPpeFb(`✓ 正確！${dragged.querySelector('div div:first-child').textContent} 已穿戴`, 'success');

      if (ppeDone >= 3) {
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        if (lockOverlay) lockOverlay.remove();
        showPpeFb('🎉 裝備檢查完成！向下捲動繼續情境判斷關卡。', 'success');
        const sc = document.getElementById('part-scenario');
        if (sc) setTimeout(() => sc.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
      }
    } else if (correct) {
      if (typeof SoundFX !== 'undefined') SoundFX.warn?.() ?? SoundFX.error?.();
      dragged.classList.add('wrong-shake');
      setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
      showPpeFb(`位置不對，請放到「${zone.dataset.label}」對應部位`, 'error');
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.error();
      dragged.classList.add('wrong-shake');
      setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
      const name = dragged.querySelector('div div:first-child')?.textContent || id;
      showPpeFb(`⚠ 「${name}」不能穿戴！${PPE_WRONG[id] || ''}`, 'error');
    }
    dragged = null;
  }
})();
