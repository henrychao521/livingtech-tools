// FRC 模組 2：機械工坊安全
// 2026-09-28 教師決定 Q12：改為 3–4 選項，干擾選項採用工坊真實常見的錯誤作法（如戴棉紗手套操作旋轉機具）
const SCENARIOS = [
  { q: '操作 CNC 銑床切割鋁板前最重要的步驟？', a: '戴上棉紗手套，切削時方便隨手撥掉鋁屑', b: '檢查工件夾持是否牢固、清空鋁屑、確認急停按鈕位置', c: '先按下啟動試跑一次，有問題再按急停', d: '確認刀具裝好就可以，夾具鬆緊切的時候再看', correct: 'b', explain: 'CNC 運行中工件鬆脫會以高速飛出傷人。每次開始前確認虎鉗／夾具已鎖緊（必要時用扭力扳手），並清掉切削區的鋁屑，避免纏刀與割傷。棉紗手套會被旋轉的刀具捲入，操作旋轉機具一律不戴手套；鋁屑要停機後用刷子或吸塵器清。' },
  { q: '電池（12V 鉛酸）保管的正確方式？', a: '直立放在通風的電池架上、正負極端子加蓋、編號管理', b: '隨意疊放在工具櫃角落', c: '橫放在地上節省空間，端子不用蓋，下次好接線', correct: 'a', explain: '鉛酸電池橫放可能漏液，端子裸露被金屬短路會引發火災。每顆電池都要編號追蹤循環次數。' },
  { q: '機器人測試（test mode）時，誰可以接近機器人？', a: '所有隊員都可以圍觀', b: '只要不站在機器人正前方，大家都可以靠近看', c: '只有 driver 與 1 名安全觀察員，其他人保持 2m 以上距離', correct: 'c', explain: 'FRC 機器人馬達瞬間扭力極大（NEO 堵轉扭力約 2.6 Nm，經減速機構放大後更大），失控時任何方向都可能甩動或衝出，不只正前方危險。測試時必須建立「安全圈」。' },
  { q: '焊接電子線材時，工作站應該？', a: '在電池附近方便取電', b: '在通風櫃裡或靠窗處 + 排煙裝置', c: '關窗開冷氣，讓空氣循環就好', correct: 'b', explain: '焊接煙含助焊劑揮發物（松香、有機溶劑），長期吸入有害；冷氣只是室內循環，不會把煙排出去。電池會釋放氫氣，靠近焊接火花極危險。' },
  { q: 'CAD 設計的零件交給製造組前必須？', a: '自己確認過尺寸就可以送加工，不必給別人看', b: '直接送去 CNC 加工，有問題再改', c: '先 peer review、確認 tolerance、檢查刀具是否能加工', correct: 'c', explain: 'Tolerance 不對會讓零件組裝不起來；刀具半徑限制 = 內角圓角必須大於刀徑。自己檢查容易看不到自己的錯，Citrus Circuits 規定 2 人簽字才能進製造。' },
  { q: '比賽期間機器人異常冒煙，立刻？', a: '駕駛員按下急停 → 通知裁判 → 等技術組到場處理', b: '繼續比賽看會不會自己好', c: '衝上場伸手把冒煙的那條線拔掉', correct: 'a', explain: '冒煙通常是馬達控制器（如 Talon SRX）短路。繼續通電可能引發火災；比賽中也不能自行進場碰機器人，先斷電、交給裁判與技術人員。FRC 場上有 CO2 滅火器，但更重要的是先斷電。' },
  { q: '3D 列印 PLA 時，安全注意事項？', a: '靠近觀察，看到牽絲就伸手進去拔掉', b: '保持距離、確保通風、不可手伸入加熱區', c: '開始列印後就可以離開教室，回來再收成品', correct: 'b', explain: '噴頭 200°C 會造成嚴重燙傷。PLA 雖然相對安全但仍有揮發物。ABS 更要嚴格通風（會釋放苯乙烯）。列印中也要有人定時查看，不要放著無人看管。' },
  { q: 'PIT 區整理工具的原則？', a: '常用工具放最方便拿的位置，用完先放機器人旁邊', b: 'Shadow board（影子板）+ 工具回歸定位，每場比賽前盤點', c: '整天比賽結束後再一起盤點', correct: 'b', explain: '頂尖隊伍如 Team 254 用「影子板」每個工具有指定位置。比賽中工具掉進機器人會卡住馬達，所以每場比賽前都要清點，不能等到最後。' },
  { q: 'CIM、NEO、Falcon 等 FRC 馬達操作注意？', a: '通電後可用手測試轉動方向', b: '戴上棉紗手套，就可以用手扶著轉軸測試', c: '通電前先確保軸上沒有手指/物體；通電測試時手離開轉動件，人員退到工坊規定的安全距離外', correct: 'c', explain: 'Falcon 500 堵轉扭力 4.7 Nm，瞬間啟動可夾斷手指；戴手套反而會被轉軸捲住。「斷電才動機構」是黃金原則。' },
  { q: '比賽期間 alliance station 駕駛位的安全規範？', a: '可以脫下護目鏡看 dashboard', b: '有戴近視眼鏡就不必再戴護目鏡', c: '全程戴護目鏡 + 不可越過 alliance wall', correct: 'c', explain: '比賽中機器人可能撞擊 alliance wall（防護牆），game piece 也可能飛出。一般眼鏡鏡片不耐衝擊、也沒有側邊防護，不能取代護目鏡。FIRST 規定駕駛全程戴護目鏡，違者該場 disqualification。' },
];

let score = 0;
const PK = 'frc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const list = document.getElementById('scenario-list');
SCENARIOS.forEach((s, i) => {
  const div = document.createElement('div');
  div.className = 'scenario';
  div.innerHTML = `<h4>${s.q}</h4><div class="choice-grid">${['a', 'b', 'c', 'd'].filter(k => s[k]).map(k => `<button class="choice" data-q="${i}" data-c="${k}">${k.toUpperCase()}. ${s[k]}</button>`).join('')}</div><div class="feedback-slot"></div>`;
  list.appendChild(div);
});
// 作答紀錄（js/sheet-log.js）：情境題全部答完送一筆；重新挑戰＝新的一份
const SLQ = window.SheetLog && SheetLog.quiz({ kind: 'quiz', questions: SheetLog.fromScenarios(SCENARIOS) });
const answered = new Set();
// 未達門檻時重新挑戰：清掉本測驗的作答狀態，不必重新整理網頁
function resetQuiz() {
  if (SLQ) SLQ.reset();
  score = 0;
  answered.clear();
  list.querySelectorAll('.choice').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
  list.querySelectorAll('.feedback-slot').forEach(f => { f.innerHTML = ''; });
  document.getElementById('scenario-result').innerHTML = '';
  document.getElementById('score-display').textContent = score;
  document.getElementById('progress-bar').style.width = '0%';
  list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
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
  document.getElementById('score-display').textContent = score;
  document.getElementById('progress-bar').style.width = score + '%';
  if (answered.size === SCENARIOS.length) {
    if (SLQ) SLQ.finish({ score, max: SCENARIOS.length * 10 });
    if (score >= 90) {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback success" style="margin-top:20px"><strong>🏆 ${score} 分通過！</strong></div>`;
      document.getElementById('unlock').classList.remove('hidden');
      document.getElementById('next-btn').style.opacity = 1;
      document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const p = loadP(); p.module2 = true; p.safetyPassed = true; saveP(p);
    } else {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback error" style="margin-top:20px">${score} 分，未達 90 分，請重新挑戰。<div style="margin-top:12px"><button type="button" class="btn btn-primary" id="retry-btn">↻ 重新挑戰</button></div></div>`;
      document.getElementById('retry-btn').addEventListener('click', resetQuiz);
    }
  }
}));

// 已通過過安全闖關（localStorage 有紀錄）：回頭複習或重新整理時，下一關維持解鎖
(function restorePassed() {
  const p = loadP();
  if (!(p.module2 || p.safetyPassed)) return;
  document.getElementById('unlock').classList.remove('hidden');
  const next = document.getElementById('next-btn');
  next.style.opacity = 1;
  next.style.pointerEvents = 'auto';
})();
