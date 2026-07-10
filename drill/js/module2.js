// 手電鑽 模組 2：安全闖關
const SCENARIOS = [
  { q: '準備鑽孔，工件擺在桌上沒固定，可以直接鑽嗎？', a: '只要小心點就可以', b: '不行！必須先用 C 型夾或老虎鉗固定', correct: 'b', explain: '工件沒固定時，鑽頭一旋轉會把工件甩起來變成飛行物——這是手電鑽教室最常見的傷害事故來源。一定要先夾緊。' },
  { q: '長頭髮的同學使用手電鑽，應該怎麼處理？', a: '必須先綁起來、塞進帽子或衣領裡', b: '小心一點就好', correct: 'a', explain: '手電鑽轉速可達 2000 RPM，頭髮一捲入就會被瞬間扯入夾頭，造成頭皮撕裂。長髮、寬鬆袖口、項鍊、圍巾都要先處理。' },
  { q: '同學想單手拿手電鑽鑽孔，這樣對嗎？', a: '對，老師也常常單手用', b: '不對，必須雙手握持（主手握把＋輔手扶機身）', correct: 'b', explain: '單手操作在鑽頭卡住時，手電鑽會以「鑽頭為軸」反向旋轉甩飛，造成手腕扭傷甚至骨折。雙手握能用身體吸收反作用力。' },
  { q: '想鑽金屬板，應該選哪種鑽頭？', a: '高速鋼（HSS）鑽頭', b: '木工螺旋鑽頭', correct: 'a', explain: '木工鑽頭有「中心尖」，鑽金屬會立刻崩刃還會打滑。鑽金屬一定要用 HSS 或鈷鋼鑽頭，並先用中心衝打點防止偏鑽。' },
  { q: '鑽到一半鑽頭卡住，正確處置？', a: '繼續用力推，硬鑽過去', b: '鬆開扳機 → 切到反轉 → 慢慢退出', correct: 'b', explain: '硬鑽會折斷鑽頭甚至燒馬達。卡鑽多半是進刀過快或鑽頭鈍了，要退出來檢查再繼續。深孔每鑽一段就退一次排屑。' },
  { q: '剛鑽完的金屬鑽頭，多久能徒手摸？', a: '等待數分鐘，先以手背靠近感溫確認不燙，或用鉗子取下', b: '立刻能摸', correct: 'a', explain: '鑽金屬時鑽頭尖端溫度可達 200°C 以上，徒手摸會嚴重燙傷。等待數分鐘後先以手背靠近感溫確認不燙再碰，趕時間就用鉗子取下。' },
  { q: '裝鑽頭時，免鑰匙夾頭要轉到什麼程度才算鎖緊？', a: '手覺得緊就行', b: '要轉到聽見連續「咔咔咔」棘輪聲', correct: 'b', explain: '免鑰匙夾頭有內部棘輪——聽到咔咔聲才代表三爪鎖到最緊。沒鎖緊鑽頭會在工件內甩動，造成孔徑變大、偏鑽或鑽頭飛出。' },
  { q: '想鎖一顆小螺絲到 MDF 板，扭力環應該怎麼設定？', a: '設定到中低段（約 4–8），離合器會在到位時跳脫', b: '直接用最大鑽孔模式', correct: 'a', explain: '鑽孔模式會把螺絲鎖到斷頭或把板材鎖裂。鎖螺絲要用離合器模式：扭力一夠就跳脫，不會過鎖。' },
  { q: '鑽孔位置上方有電線或水管，發現時怎麼辦？', a: '小心點繼續鑽，避開就好', b: '停止鑽孔，改換位置或用偵測器確認', correct: 'b', explain: '牆內電線、水管的位置無法用肉眼判斷深度。鑽到電線會觸電/起火、鑽到水管會淹水。要用「金屬/電線偵測器」確認再鑽。' },
  { q: '鑽完孔，要把鑽頭從夾頭取下，正確程序？', a: '先檢查鑽頭已停止旋轉 → 拆電池 → 反轉夾頭環取下', b: '直接轉開夾頭就好', correct: 'a', explain: '取鑽頭時若誤觸扳機，鑽頭會旋轉割傷手指。安全的做法是先拆電池斷電，徹底切斷誤觸發風險。' },
  { q: '發現電池包側面明顯鼓脹，還能繼續使用嗎？', a: '停用，更換膨脹電池再操作', b: '沒關係，電池鼓脹是正常老化', correct: 'a', explain: '鋰電池鼓脹代表內部電解質分解、氣體產生——繼續充電或強力擠壓有起火甚至爆炸風險。應立刻停用、放入耐熱袋、送回收處理。' },
  { q: '要在磁磚上鑽孔，可以用電鎚模式加磚石鑽頭嗎？', a: '不行！要用金剛石空心鑽頭，不能用電鎚衝擊', b: '對，電鎚模式加磚石鑽頭效率最高', correct: 'a', explain: '電鎚的衝擊力會讓磁磚瞬間龜裂！磁磚鑽孔必須用「金剛石鑽孔器（鑽石空心鑽）」＋低速＋無衝擊模式，且鑽孔時建議加水冷卻。' },
  { q: '鑽孔時產生大量熱氣、冒煙，且進展非常緩慢，原因最可能是？', a: '鑽頭已鈍，應立刻停機更換新鑽頭', b: '轉速太高，降速繼續鑽就好', correct: 'a', explain: '鑽頭磨鈍後無法切削只能「磨」——大量摩擦熱、少量碎屑是典型症狀。繼續硬鑽只會加速磨損並燒焦材料。換新鑽頭才是正確解法。' },
  { q: '在橡木硬木上鑽 12mm 大孔，應該選哪個轉速設定？', a: '低速高扭力（Low gear，300–600 RPM）', b: '高速（High gear，1500 RPM 以上）讓鑽頭轉快一點', correct: 'a', explain: '大直徑鑽頭在硬材料中需要高扭力、低轉速（低速檔 Low gear）。高速會讓鑽頭過熱失去硬度。小直徑鑽頭 + 軟材料才適合高速。' },
  { q: '需要向上仰鑽天花板，最安全的姿勢是？', a: '身體靠牆支撐、護目鏡朝上、側臉避開鑽孔方向', b: '站直往上看對準鑽點，這樣比較準確', correct: 'a', explain: '向上仰鑽時，碎屑會直接落入眼睛！必須穿戴包覆式護目鏡、側臉避開鑽孔方向，身體靠牆穩定重心。否則碎屑入眼或鑽頭脫落都會造成重傷。' },
];
let ppeScore = 0;
let score = 0;
const PK = 'drill_progress_v1';
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
  const CARD_RESEARCH = 'background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:14px 16px;margin-bottom:10px';
  const TL = 'font-size:12px;color:#1d4ed8;text-decoration:underline;word-break:break-all';

  const sec = document.createElement('section');
  sec.className = 'panel';
  sec.innerHTML = `
    <h3 style="display:flex;align-items:center;gap:8px;margin-bottom:6px">⚠️ 真實事故案例參考</h3>
    <p style="color:#64748b;font-size:14px;margin-bottom:16px">以下為國內外手電鑽操作相關安全事故的官方記錄與研究資料。</p>

    <div style="${CARD_ACCIDENT}">
      <div style="font-weight:700;color:#c2410c;margin-bottom:6px">🌀 旋轉工件甩飛＝教室最常見手電鑽傷害</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">美國 OSHA 機械防護指引明確指出：使用電動鑽孔工具時，<strong>未夾緊工件</strong>是造成受傷的最主要原因。鑽頭咬住工件後，未固定的薄板金屬片會瞬間以鑽頭為軸高速旋轉，邊緣可切穿手掌、造成深層割傷，甚至骨折。工件越小、越薄，甩飛的危險越高。</p>
      <a href="https://www.osha.gov/etools/machine-guarding/drills" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：OSHA eTool — Machine Guarding / Drills（英文）</a>
    </div>

    <div style="${CARD_ACCIDENT}">
      <div style="font-weight:700;color:#c2410c;margin-bottom:6px">💥 卡鑽反扭傷害｜手腕骨折、肩膀脫臼案例</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">英國 HSE（Health and Safety Executive）發布的《手持電動工具安全》指引記錄：當鑽頭卡在工件中突然停轉時，電鑽機身會以鑽頭為軸<strong>反向快速旋轉甩動（kickback）</strong>，單手操作者尤其容易因此造成手腕扭傷、骨折，甚至肩膀脫臼。雙手握持可大幅降低此類傷害的嚴重程度。</p>
      <a href="https://www.hse.gov.uk/pubns/indg229.pdf" target="_blank" rel="noopener noreferrer" style="${TL}">📄 原文來源：HSE INDG229 — Power Drills Safety（英文 PDF）</a>
    </div>

    <div style="${CARD_RESEARCH}">
      <div style="font-weight:700;color:#1e40af;margin-bottom:6px">📊 美國每年約 40 萬人次因電動工具受傷</div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151">美國消費品安全委員會（CPSC）統計，電動手工具每年造成約 40 萬次急診就診，其中手電鑽為最常使用工具之一。常見受傷部位：手指（鑽頭刺穿）、手腕（卡鑽反扭）、眼睛（碎屑噴濺）。正確的個人防護（護目鏡＋雙手握持＋工件固定）可預防絕大多數事故。</p>
      <a href="https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Batteries" target="_blank" rel="noopener noreferrer" style="${TL}">📄 參考來源：CPSC — Consumer Safety Statistics（英文）</a>
    </div>

    <p style="font-size:12px;color:#94a3b8;margin-top:4px">※ 以上連結均為政府官方或研究機構文件，引用於教學安全佐證之用。</p>
  `;
  const nav = document.querySelector('.module-nav-bottom');
  if (nav) nav.parentNode.insertBefore(sec, nav);
})();

/* ── PPE 裝備安全檢查遊戲 ──────────────────────────────── */
;(function () {
  const ppeSvg   = document.getElementById('ppe-svg');
  const ppeFb    = document.getElementById('ppe-feedback');
  const lockOverlay = document.getElementById('scenario-lock-overlay');
  if (!ppeSvg) return; // PPE section not present (guard)

  /* SVG 疊加（正確放置後注入到 #ppe-svg） */
  const PPE_VISUALS = {
    'drill-goggles': () => {
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
    'drill-sleeves': () => {
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
    'drill-shoes': () => {
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

  /* 錯誤放置的說明 */
  const PPE_WRONG = {
    'drill-glove':    '布手套放在持鑽手上時，旋轉中的夾頭會瞬間捲入布料，造成手指、手掌嚴重撕裂傷！電鑽（與所有旋轉機具）操作絕對禁戴布手套。',
    'drill-bracelet': '金屬手環 / 戒指容易被旋轉的夾頭或鑽頭捲入，瞬間扯斷手指。操作電鑽前應摘下所有金屬首飾。',
    'drill-loose':    '寬鬆長袖的布料會被夾頭在 0.1 秒內捲入，造成手臂嚴重受傷。必須將袖子束緊或捲起至手肘以上再操作。',
  };

  let dragged = null;
  let ppeDone = 0; // 已正確放置的件數

  const items = document.querySelectorAll('#ppe-items .draggable');
  const zones = document.querySelectorAll('#ppe-character .dropzone');

  function showPpeFb(msg, type) {
    if (!ppeFb) return;
    ppeFb.innerHTML = `<div class="feedback ${type}">${msg}</div>`;
    clearTimeout(ppeFb._t);
    ppeFb._t = setTimeout(() => { if (ppeFb) ppeFb.innerHTML = ''; }, 5000);
  }

  function updateTotalScore() {
    const total = ppeScore + score;
    const disp = document.getElementById('score-display');
    const bar  = document.getElementById('progress-bar');
    if (disp) disp.textContent = total;
    if (bar)  bar.style.width = Math.min(100, total / 1.3) + '%';
  }

  /* Drag handlers */
  items.forEach(item => {
    item.addEventListener('dragstart', e => {
      dragged = item;
      e.dataTransfer.effectAllowed = 'move';
      if (typeof SoundFX !== 'undefined') SoundFX.pop();
    });
    item.addEventListener('click', () => {
      if (item.classList.contains('placed')) return;
      items.forEach(i => i.style.outline = '');
      item.style.outline = '3px solid var(--accent,#F59E0B)';
      dragged = item;
    });
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#F59E0B'; zone.style.background = 'rgba(245,158,11,.08)'; });
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
      /* 正確放置 */
      zone.classList.add('filled');
      zone.style.borderColor = '#16a34a';
      zone.style.background  = 'rgba(22,163,74,.08)';
      dragged.classList.add('placed');
      dragged.style.outline = '';

      /* 注入 SVG 視覺 */
      const vFn = PPE_VISUALS[id];
      if (vFn) {
        if (id === 'drill-shoes') {
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
        /* 解鎖情境題 */
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        if (lockOverlay) lockOverlay.remove();
        showPpeFb('🎉 裝備檢查完成！向下捲動繼續情境判斷關卡。', 'success');
        const sc = document.getElementById('part-scenario');
        if (sc) setTimeout(() => sc.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
      }
    } else if (correct) {
      /* 放對物品、放錯位置 */
      if (typeof SoundFX !== 'undefined') SoundFX.warn();
      dragged.classList.add('wrong-shake');
      setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
      showPpeFb(`位置不對，請放到「${zone.dataset.label}」對應部位`, 'error');
    } else {
      /* 錯誤物品 */
      if (typeof SoundFX !== 'undefined') SoundFX.error();
      dragged.classList.add('wrong-shake');
      setTimeout(() => dragged?.classList.remove('wrong-shake'), 400);
      const name = dragged.querySelector('div div:first-child')?.textContent || id;
      showPpeFb(`⚠ 「${name}」不能穿戴！${PPE_WRONG[id] || ''}`, 'error');
    }
    dragged = null;
  }
})();
