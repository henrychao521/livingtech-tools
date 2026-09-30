// 砂磨機 模組 2：安全闖關
let ppeScore = 0;
const SCENARIOS = [
  { q: '砂磨木材時沒接集塵器，可以繼續用嗎？', a: '只磨一下，粉塵不多應該沒關係', b: '不行！木屑粉達一定濃度會引發塵爆，要先接集塵器', correct: 'b', explain: '木屑粉達 40g/m³ 遇火源（甚至馬達電刷的火花、靜電）就會引發粉塵爆炸。集塵是木工砂磨的基本安全設備，不是可選項（台灣相關法規與國外規範，見本頁最下方的延伸補充）。' },
  { q: '想砂磨工件，可以戴手套讓手不會痛嗎？', a: '禁止！手套容易被砂帶捲入', b: '可以，戴皮手套反而能防手被砂帶磨傷', correct: 'a', explain: '砂磨機與所有旋轉機具相同——操作時一律不戴手套，布、皮、橡膠手套，甚至防割手套都不行。手套一被砂帶或砂盤咬住，會把整隻手扯進去。工件磨到發熱就暫停讓它冷卻；小工件改用木夾或推板夾持，不要用手套代替。' },
  { q: '在盤式砂磨機上，工件應該放砂盤的哪一側？', a: '兩側都可以，只要把工件壓穩就好', b: '先空轉觀察旋轉方向，只能放在「向下旋轉」那一側', correct: 'b', explain: '盤式砂磨「往下轉那側」工件會被壓向工作台（穩定）；「往上轉那側」工件會被甩起飛出。多數逆時針機型的向下旋轉側為左半邊，但務必依教室機台實際方向為準。這是盤式砂磨的核心安全規則。' },
  { q: '砂磨時可以把工件固定壓在一個點不動嗎？', a: '不行，要持續移動工件', b: '可以，要多磨掉一點的地方就停久一點', correct: 'a', explain: '砂帶/砂盤在一點停超過 2 秒，木材立刻焦黑，金屬會退火。要持續以平穩速度移動工件，讓熱量分散。' },
  { q: '長頭髮的同學要操作砂磨機，怎麼處理？', a: '頭髮沒有過肩就不用特別處理', b: '必須先綁起來，最好加戴髮網或鴨舌帽', correct: 'b', explain: '砂帶線速度每分鐘可達數百公尺以上，頭髮一捲入會被瞬間扯入滾輪。長髮、寬鬆袖口、項鍊、圍巾、領帶都要先處理。' },
  { q: '換砂帶或砂盤，正確程序？', a: '關機 → 等砂帶完全停止 → 拔電源插頭 → 再換', b: '按下關機鍵、砂帶停了就可以換，不必拔插頭', correct: 'a', explain: '換砂帶時若誤觸開關，瞬間啟動的砂帶會把手指刨到。必須先斷電。慣性轉動的砂帶也很危險，要等完全停止。' },
  { q: '砂磨過程中砂帶突然「斷裂」飛出，怎麼辦？', a: '趕快伸手把砂帶撥開，免得打到旁邊同學', b: '立刻關機、後退、等馬達完全停止', correct: 'b', explain: '飛出的砂帶像鞭子一樣甩動，會打傷臉部與眼睛。要立刻拍下緊急停止鈕、後退、不要試圖接住或抓回。' },
  { q: '砂磨小工件（< 5cm），可以用手指捏著磨嗎？', a: '不行，要用木夾或推板輔助', b: '可以，手指和砂帶保持 1 公分以上就好', correct: 'a', explain: '手指距砂帶太近，工件被甩起來瞬間手指可能擦過砂帶——這是砂磨機最常見的擦傷事故。小工件要用木夾或推板（push block）控制。' },
  { q: '聞到砂磨時的塑膠焦味（如 PVC），應該？', a: '先把窗戶打開，磨完這一件再停', b: '立刻停機通風，可能釋出有毒氣體', correct: 'b', explain: 'PVC、ABS、酚醛樹脂等塑膠受熱會釋放氯化氫、苯乙烯等毒氣。聞到異味要立刻停機、開窗通風、戴口罩離開現場。' },
  { q: '砂磨結束，正確收工程序？', a: '關機 → 等砂帶完全停止 → 清理粉塵 → 收起工件 → 鎖緊砂帶蓋', b: '關機後先收工件，粉塵等下課再一起掃', correct: 'a', explain: '殘留粉塵是下次塵爆的火種。完整收工：等慣性停、用毛刷或吸塵器清理機台與地面、檢查砂帶蓋是否完好、確認下一個使用者能直接用。' },
];
let score = 0;
// 作答紀錄（js/sheet-log.js）：情境題全部答完送一筆；重新挑戰＝新的一份
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: SheetLog.fromScenarios(SCENARIOS) });
const PK = 'sander_progress_v1';
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
  if (SLQ) SLQ.answer('s' + i, ['a', 'b', 'c', 'd'].indexOf(btn.dataset.c));
  const parent = btn.closest('.scenario');
  parent.querySelectorAll('.choice').forEach(b => { b.disabled = true; if (b.dataset.c === s.correct) b.classList.add('correct'); if (b === btn && !correct) b.classList.add('wrong'); });
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓' : '✗'} ${s.explain}</div>`;
  if (correct) { score += 10; if (typeof SoundFX !== 'undefined') SoundFX.success(); } else if (typeof SoundFX !== 'undefined') SoundFX.error();
  answered.add(i);
  const total = ppeScore + score;
  document.getElementById('score-display').textContent = total;
  document.getElementById('progress-bar').style.width = Math.min(100, total / 1.3) + '%';
  if (answered.size === SCENARIOS.length) {
    if (SLQ) SLQ.finish({ score, max: SCENARIOS.length * 10 });
    if (total >= 100) {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${total} 分通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const p = loadP(); p.module2 = true; p.safetyPassed = true; saveP(p);
    } else {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback error" style="margin-top:20px">${total} 分，未達 100 分。護具關已完成不必重做，按下方按鈕重新作答情境題。<br><button type="button" class="btn btn-primary" id="retry-scenario" style="margin-top:12px">🔄 重新挑戰情境題</button></div>`;
      document.getElementById('retry-scenario').addEventListener('click', resetScenarios);
    }
  }
}));

// 情境題未達門檻：只清掉情境題作答狀態重新作答，護具關分數保留
function resetScenarios() {
  if (SLQ) SLQ.reset();
  score = 0;
  answered.clear();
  list.querySelectorAll('.scenario').forEach(div => {
    div.querySelectorAll('.choice').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
    div.querySelector('.feedback-slot').innerHTML = '';
  });
  document.getElementById('scenario-result').innerHTML = '';
  document.getElementById('score-display').textContent = ppeScore;
  document.getElementById('progress-bar').style.width = Math.min(100, ppeScore / 1.3) + '%';
  document.getElementById('part-scenario').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 已通過過安全闖關（localStorage 有紀錄）：回頭複習或重新整理時，下一關維持解鎖
(function restorePassed() {
  const p = loadP();
  if (!(p.module2 || p.safetyPassed)) return;
  document.getElementById('unlock').classList.remove('hidden');
  const next = document.getElementById('next-btn');
  next.style.opacity = 1;
  next.style.pointerEvents = 'auto';
})();

/* ── PPE 護具配置遊戲 ──────────────────────────────────── */
;(function () {
  const PPE_WRONG = {
    'sd-glove':    '⚠ 手套被砂帶咬住後會把整隻手扯入滾輪！砂磨機一律不戴任何手套（布、皮、橡膠、防割手套都不行）。',
    'sd-earphone': '⚠ 戴耳機會遮蔽機台異音（皮帶異響、砂帶快斷的聲音），無法即時判斷危險！',
    'sd-bracelet': '⚠ 金屬手環可能被砂帶掛住或在高速下造成靜電，嚴重者捲入機台。',
  };
  const PPE_VISUALS = {
    'sd-goggles': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('id','sv-goggles');
      g.innerHTML = `
        <g transform="translate(46,72)">
          <ellipse cx="22" cy="18" rx="20" ry="12" fill="#1a1a1a" opacity=".85"/>
          <ellipse cx="66" cy="18" rx="20" ry="12" fill="#1a1a1a" opacity=".85"/>
          <line x1="42" y1="18" x2="46" y2="18" stroke="#1a1a1a" stroke-width="4"/>
          <ellipse cx="22" cy="18" rx="16" ry="9" fill="rgba(135,206,250,.6)"/>
          <ellipse cx="66" cy="18" rx="16" ry="9" fill="rgba(135,206,250,.6)"/>
          <ellipse cx="17" cy="14" rx="4" ry="2" fill="rgba(255,255,255,.6)"/>
          <ellipse cx="61" cy="14" rx="4" ry="2" fill="rgba(255,255,255,.6)"/>
        </g>`;
      return g;
    },
    'sd-mask': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('id','sv-mask');
      g.innerHTML = `
        <g transform="translate(50,124)">
          <path d="M0 0 Q44 18 88 0 L84 24 Q44 30 4 24 Z" fill="#fff" stroke="#7C3AED" stroke-width="2"/>
          <text x="44" y="18" text-anchor="middle" font-size="9" fill="#7C3AED" font-weight="800" font-family="Inter,sans-serif">N95</text>
          <line x1="0" y1="8" x2="-8" y2="6" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="88" y1="8" x2="96" y2="6" stroke="#94a3b8" stroke-width="1.5"/>
        </g>`;
      return g;
    },
    'sd-sleeves': () => {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('id','sv-sleeves');
      g.innerHTML = `
        <g transform="translate(30,195)">
          <rect x="0" y="0" width="18" height="26" rx="6" fill="#f97316" opacity=".9"/>
          <rect x="112" y="0" width="18" height="26" rx="6" fill="#f97316" opacity=".9"/>
          <text x="9" y="38" text-anchor="middle" font-size="8" fill="#ea580c" font-weight="700" font-family="Noto Sans TC,sans-serif">束緊</text>
          <text x="121" y="38" text-anchor="middle" font-size="8" fill="#ea580c" font-weight="700" font-family="Noto Sans TC,sans-serif">束緊</text>
        </g>`;
      return g;
    },
  };

  const ppeSvg = document.getElementById('ppe-svg');
  const items = document.querySelectorAll('#ppe-items .draggable');
  const zones = document.querySelectorAll('#ppe-scene .svg-dropzone');
  let dragged = null;
  // 作答紀錄：護具關算一題遊戲（放錯不能穿的物品算失誤），完成時單獨送一筆
  let ppeErr = 0;
  const SLP = window.SheetLog && SheetLog.quiz({ kind: 'game', questions: [{ key: 'ppe', t: 'game', stem: '砂磨機護具檢查：護目鏡、防塵口罩、束緊袖口放到對應部位；手套、耳機、金屬手環不能帶' }] });
  let ppeDone = 0;

  zones.forEach(z => {
    z.addEventListener('mouseenter', () => { if (!z.classList.contains('filled')) z.setAttribute('stroke','#7C3AED'); });
    z.addEventListener('mouseleave', () => { if (!z.classList.contains('filled')) z.setAttribute('stroke','#cbd5e1'); });
  });

  items.forEach(item => {
    item.addEventListener('dragstart', e => { if (item.classList.contains('placed')) { e.preventDefault(); return; } dragged = item; e.dataTransfer.effectAllowed = 'move'; if (typeof SoundFX !== 'undefined') SoundFX.click(); });
    item.addEventListener('click', () => {
      if (item.classList.contains('placed')) return;
      items.forEach(i => i.style.outline = '');
      item.style.outline = '3px solid #7C3AED';
      dragged = item;
      if (typeof SoundFX !== 'undefined') SoundFX.click();
    });
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.setAttribute('stroke','#7C3AED'); zone.setAttribute('stroke-width','3'); zone.setAttribute('fill','rgba(124,58,237,.1)'); });
    zone.addEventListener('dragleave', () => { if (!zone.classList.contains('filled')) { zone.setAttribute('stroke','#cbd5e1'); zone.setAttribute('stroke-width','1.5'); zone.setAttribute('fill','transparent'); } });
    zone.addEventListener('drop', e => { e.preventDefault(); handlePpeDrop(zone); });
    zone.addEventListener('click', () => { if (dragged) handlePpeDrop(zone); });
  });

  function handlePpeDrop(zone) {
    if (!dragged) return;
    if (dragged.classList.contains('placed')) { dragged = null; return; }  // 2026-09-26 審查：避免重複加分
    const accept = zone.dataset.accept;
    const id = dragged.dataset.id;
    const correct = dragged.dataset.correct === '1';
    if (id === accept && correct) {
      zone.classList.add('filled');
      zone.setAttribute('stroke','#16a34a'); zone.setAttribute('stroke-width','2'); zone.setAttribute('fill','rgba(22,163,74,.1)');
      dragged.classList.add('placed');
      dragged.draggable = false; dragged.style.outline = '';
      ppeScore += 10;
      const vFn = PPE_VISUALS[id];
      if (vFn) ppeSvg.appendChild(vFn());
      if (typeof SoundFX !== 'undefined') SoundFX.success();
      ppeDone++;
      showPpeFeedback('✓ 正確！','success');
      const total2 = ppeScore + score;
      document.getElementById('score-display').textContent = total2;
      document.getElementById('progress-bar').style.width = Math.min(100, total2 / 1.3) + '%';
      if (ppeDone >= 3) {
        if (SLP) { SLP.answer('ppe', ppeErr === 0, { tries: ppeErr + 1 }); SLP.finish(); }
        if (typeof SoundFX !== 'undefined') SoundFX.unlock();
        document.getElementById('ppe-feedback').innerHTML = `<div class="feedback success">🎉 護具配置完成！解鎖情境判斷關卡。</div>`;
        const overlay = document.getElementById('scenario-lock-overlay');
        if (overlay) overlay.remove();
        document.getElementById('part-scenario').scrollIntoView({ behavior:'smooth', block:'start' });
      }
    } else if (correct) {
      if (typeof SoundFX !== 'undefined') SoundFX.warn();
      { const el = dragged; el.classList.add('wrong-shake'); setTimeout(() => el.classList.remove('wrong-shake'), 400); }
      showPpeFeedback(`位置不對，請拖到「${zone.dataset.label}」區域`, 'error');
    } else {
      if (typeof SoundFX !== 'undefined') SoundFX.error();
      { const el = dragged; el.classList.add('wrong-shake'); setTimeout(() => el.classList.remove('wrong-shake'), 400); }
      ppeErr++;
      showPpeFeedback(PPE_WRONG[id] || '這個物品不適合帶入操作！', 'error');
    }
    dragged = null;
  }

  function showPpeFeedback(msg, type) {
    const fb = document.getElementById('ppe-feedback');
    fb.innerHTML = `<div class="feedback ${type}" style="margin-top:8px">${msg}</div>`;
    setTimeout(() => { if (fb.innerHTML.includes(msg)) fb.innerHTML = ''; }, 5000);
  }
})();
