// FRC 模組 2：機械工坊安全
const SCENARIOS = [
  { q: '操作 CNC 銑床切割鋁板前最重要的步驟？', a: '快速戴上耳機聽音樂保持專注', b: '檢查工件夾持是否牢固、清空鋁屑、確認急停按鈕位置', correct: 'b', explain: 'CNC 運行中工件鬆脫會以高速飛出傷人。每次開始前必須用千分尺確認夾持力，並把切削區的鋁屑清乾淨（鋁屑燃點低易燒）。' },
  { q: '電池（12V 鉛酸）保管的正確方式？', a: '直立放在通風的電池架上、正負極端子加蓋、編號管理', b: '隨意疊放在工具櫃角落', correct: 'a', explain: '鉛酸電池橫放可能漏液，端子裸露被金屬短路會引發火災。每顆電池都要編號追蹤循環次數。' },
  { q: '機器人測試（test mode）時，誰可以接近機器人？', a: '只有 driver 與 1 名安全觀察員，其他人保持 2m 以上距離', b: '所有隊員都可以圍觀', correct: 'a', explain: 'FRC 機器人馬達瞬間扭力極大（NEO 堵轉扭力約 2.6 Nm，經減速機構放大後更大），失控可造成嚴重夾擊傷害。測試時必須建立「安全圈」。' },
  { q: '焊接電子線材時，工作站應該？', a: '在電池附近方便取電', b: '在通風櫃裡或靠窗處 + 排煙裝置', correct: 'b', explain: '焊接煙含助焊劑揮發物（松香、有機溶劑），長期吸入有害。電池會釋放氫氣，靠近焊接火花極危險。' },
  { q: 'CAD 設計的零件交給製造組前必須？', a: '先 peer review、確認 tolerance、檢查刀具是否能加工', b: '直接送去 CNC 加工', correct: 'a', explain: 'Tolerance 不對會讓零件組裝不起來；刀具半徑限制 = 內角圓角必須大於刀徑。Citrus Circuits 規定 2 人簽字才能進製造。' },
  { q: '比賽期間機器人異常冒煙，立刻？', a: '駕駛員按下急停 → 通知裁判 → 等技術組到場處理', b: '繼續比賽看會不會自己好', correct: 'a', explain: '冒煙通常是馬達控制器（如 Talon SRX）短路。繼續通電可能引發火災，FRC 場上有 CO2 滅火器但更重要的是先斷電。' },
  { q: '3D 列印 PLA 時，安全注意事項？', a: '靠近觀察列印過程確認品質', b: '保持距離、確保通風、不可手伸入加熱區', correct: 'b', explain: '噴頭 200°C 會造成嚴重燙傷。PLA 雖然相對安全但仍有揮發物。ABS 更要嚴格通風（會釋放苯乙烯）。' },
  { q: 'PIT 區整理工具的原則？', a: 'Shadow board（影子板）+ 工具回歸定位，每場比賽前盤點', b: '常用工具放最方便拿的位置', correct: 'a', explain: '頂尖隊伍如 Team 254 用「影子板」每個工具有指定位置。比賽中工具掉進機器人會卡住馬達。比賽前必須清點。' },
  { q: 'CIM、NEO、Falcon 等 FRC 馬達操作注意？', a: '通電後可用手測試轉動方向', b: '通電前先確保軸上沒有手指/物體；通電後保持 30cm 距離', correct: 'b', explain: 'Falcon 500 堵轉扭力 4.7 Nm，瞬間啟動可夾斷手指。「斷電才動機構」是黃金原則。' },
  { q: '比賽期間 alliance station 駕駛位的安全規範？', a: '可以脫下護目鏡看 dashboard', b: '全程戴護目鏡 + 不可越過 alliance wall', correct: 'b', explain: '比賽中機器人可能撞擊 alliance wall（防護牆），game piece 也可能飛出。FIRST 規定駕駛全程戴護目鏡，違者該場 disqualification。' },
];

let score = 0;
const PK = 'frc_progress_v1';
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
