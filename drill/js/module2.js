// 手電鑽 模組 2：安全闖關
const SCENARIOS = [
  { q: '準備鑽孔，工件擺在桌上沒固定，可以直接鑽嗎？', a: '只要小心點就可以', b: '不行！必須先用 C 型夾或老虎鉗固定', correct: 'b', explain: '工件沒固定時，鑽頭一旋轉會把工件甩起來變成飛行物——這是手電鑽教室最常見的傷害事故來源。一定要先夾緊。' },
  { q: '長頭髮的同學使用手電鑽，應該怎麼處理？', a: '必須先綁起來、塞進帽子或衣領裡', b: '小心一點就好', correct: 'a', explain: '手電鑽轉速可達 2000 RPM，頭髮一捲入就會被瞬間扯入夾頭，造成頭皮撕裂。長髮、寬鬆袖口、項鍊、圍巾都要先處理。' },
  { q: '同學想單手拿手電鑽鑽孔，這樣對嗎？', a: '對，老師也常常單手用', b: '不對，必須雙手握持（主手握把＋輔手扶機身）', correct: 'b', explain: '單手操作在鑽頭卡住時，手電鑽會以「鑽頭為軸」反向旋轉甩飛，造成手腕扭傷甚至骨折。雙手握能用身體吸收反作用力。' },
  { q: '想鑽金屬板，應該選哪種鑽頭？', a: '高速鋼（HSS）鑽頭', b: '木工螺旋鑽頭', correct: 'a', explain: '木工鑽頭有「中心尖」，鑽金屬會立刻崩刃還會打滑。鑽金屬一定要用 HSS 或鈷鋼鑽頭，並先用中心衝打點防止偏鑽。' },
  { q: '鑽到一半鑽頭卡住，正確處置？', a: '繼續用力推，硬鑽過去', b: '鬆開扳機 → 切到反轉 → 慢慢退出', correct: 'b', explain: '硬鑽會折斷鑽頭甚至燒馬達。卡鑽多半是進刀過快或鑽頭鈍了，要退出來檢查再繼續。深孔每鑽一段就退一次排屑。' },
  { q: '剛鑽完的金屬鑽頭，多久能徒手摸？', a: '等 1–2 分鐘冷卻後才能摸', b: '立刻能摸', correct: 'a', explain: '鑽金屬時鑽頭尖端溫度可達 200°C 以上，徒手摸會嚴重燙傷。要等冷卻或先用濕布降溫。' },
  { q: '裝鑽頭時，免鑰匙夾頭要轉到什麼程度才算鎖緊？', a: '手覺得緊就行', b: '要轉到聽見連續「咔咔咔」棘輪聲', correct: 'b', explain: '免鑰匙夾頭有內部棘輪——聽到咔咔聲才代表三爪鎖到最緊。沒鎖緊鑽頭會在工件內甩動，造成孔徑變大、偏鑽或鑽頭飛出。' },
  { q: '想鎖一顆小螺絲到 MDF 板，扭力環應該怎麼設定？', a: '設定到中低段（約 4–8），離合器會在到位時跳脫', b: '直接用最大鑽孔模式', correct: 'a', explain: '鑽孔模式會把螺絲鎖到斷頭或把板材鎖裂。鎖螺絲要用離合器模式：扭力一夠就跳脫，不會過鎖。' },
  { q: '鑽孔位置上方有電線或水管，發現時怎麼辦？', a: '小心點繼續鑽，避開就好', b: '停止鑽孔，改換位置或用偵測器確認', correct: 'b', explain: '牆內電線、水管的位置無法用肉眼判斷深度。鑽到電線會觸電/起火、鑽到水管會淹水。要用「金屬/電線偵測器」確認再鑽。' },
  { q: '鑽完孔，要把鑽頭從夾頭取下，正確程序？', a: '先檢查鑽頭已停止旋轉 → 拆電池 → 反轉夾頭環取下', b: '直接轉開夾頭就好', correct: 'a', explain: '取鑽頭時若誤觸扳機，鑽頭會旋轉割傷手指。安全的做法是先拆電池斷電，徹底切斷誤觸發風險。' },
];
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
  document.getElementById('score-display').textContent = score;
  document.getElementById('progress-bar').style.width = score + '%';
  if (answered.size === SCENARIOS.length) {
    if (score >= 90) {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${score} 分通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const p = loadP(); p.module2 = true; p.safetyPassed = true; saveP(p);
    } else {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback error" style="margin-top:20px">${score} 分，未達 90 分，請重新挑戰。</div>`;
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
