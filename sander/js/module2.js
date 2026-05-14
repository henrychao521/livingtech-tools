// 砂磨機 模組 2：安全闖關
const SCENARIOS = [
  { q: '砂磨木材時沒接集塵器，可以繼續用嗎？', a: '反正粉塵不多，繼續用', b: '不行！木屑粉達一定濃度會引發塵爆，要先接集塵器', correct: 'b', explain: '木屑粉達 40g/m³ 遇火源（甚至馬達電刷的火花、靜電）就會引發粉塵爆炸。集塵口連接是基本安全配備，不是可選項。OSHA 把木工集塵列為強制要求。' },
  { q: '想砂磨工件，可以戴布手套讓手不會痛嗎？', a: '禁止！手套容易被砂帶捲入', b: '可以，會比較舒服', correct: 'a', explain: '砂磨機與所有旋轉機具相同——禁戴布手套。布料一被砂帶咬住會把整隻手扯進去。如果擔心摩擦發熱，戴防護「皮手套」前先諮詢老師。' },
  { q: '在盤式砂磨機上，工件應該放砂盤的哪一側？', a: '隨便都可以', b: '只能放在「向下旋轉」那一側（通常是右半邊）', correct: 'b', explain: '盤式砂磨「往下轉那側」工件會被壓向工作檯（穩定）；「往上轉那側」工件會被甩起飛出。這是盤式砂磨的核心安全規則。' },
  { q: '砂磨時可以把工件固定壓在一個點不動嗎？', a: '不行，要持續移動工件', b: '可以，這樣磨得比較深', correct: 'a', explain: '砂帶/砂盤在一點停超過 2 秒，木材立刻焦黑，金屬會退火。要持續以平穩速度移動工件，讓熱量分散。' },
  { q: '長頭髮的同學要操作砂磨機，怎麼處理？', a: '小心點就好', b: '必須先綁起來，最好加戴髮網或鴨舌帽', correct: 'b', explain: '砂帶轉速 600–1800 RPM，頭髮一捲入會被瞬間扯入滾輪。長髮、寬鬆袖口、項鍊、圍巾、領帶都要先處理。' },
  { q: '換砂帶或砂盤，正確程序？', a: '關機 → 等砂帶完全停止 → 拔電源插頭 → 再換', b: '直接拔下舊的、裝新的就好', correct: 'a', explain: '換砂帶時若誤觸開關，瞬間啟動的砂帶會把手指刨到。必須先斷電。慣性轉動的砂帶也很危險，要等完全停止。' },
  { q: '砂磨過程中砂帶突然「斷裂」飛出，怎麼辦？', a: '快速伸手接住', b: '立刻關機、後退、等馬達完全停止', correct: 'b', explain: '飛出的砂帶像鞭子一樣甩動，會打傷臉部與眼睛。要立刻拍下緊急停止鈕、後退、不要試圖接住或抓回。' },
  { q: '砂磨小工件（< 5cm），可以用手指捏著磨嗎？', a: '不行，要用木夾或推板輔助', b: '可以，小心點就好', correct: 'a', explain: '手指距砂帶太近，工件被甩起來瞬間手指可能擦過砂帶——這是砂磨機最常見的擦傷事故。小工件要用木夾或推板（push block）控制。' },
  { q: '聞到砂磨時的塑料焦味（如 PVC），應該？', a: '繼續磨完', b: '立刻停機通風，可能釋出有毒氣體', correct: 'b', explain: 'PVC、ABS、酚醛樹脂等塑料受熱會釋放氯化氫、苯乙烯等毒氣。聞到異味要立刻停機、開窗通風、戴口罩離開現場。' },
  { q: '砂磨結束，正確收工程序？', a: '關機 → 等砂帶完全停止 → 清理粉塵 → 收起工件 → 鎖緊砂帶蓋', b: '直接關機離開', correct: 'a', explain: '殘留粉塵是下次塵爆的火種。完整收工：等慣性停、用毛刷或吸塵器清理機台與地面、檢查砂帶蓋是否完好、確認下一個使用者能直接用。' },
];
let score = 0;
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
