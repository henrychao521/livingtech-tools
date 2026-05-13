// 基本手工具 模組 2：安全闖關
const SCENARIOS = [
  { q: '美工刀變鈍切不動，下一步？', a: '用力切過去', b: '折掉一段刀片或更換新刀片', correct: 'b', explain: '鈍刀切要施力大、容易滑——「鈍刀比利刀危險」是工坊鐵則。美工刀刀片有折斷凹槽，用內附小工具折一段就有新刃。' },
  { q: '螺絲鎖很緊轉不動，下一步？', a: '用更大的螺絲起子使勁轉', b: '改用較長把柄的起子（增加力臂）或換扳手', correct: 'b', explain: '使力過大會把刀頭從螺絲頭打滑（崩牙）。要增力應該用「長把柄」或「鋼柄起子+扳手」夾握，而不是死命轉。' },
  { q: '銼刀沒有木柄，可以用嗎？', a: '小心點用就行', b: '不能用，要先裝上木柄', correct: 'b', explain: '銼刀尾端是尖銳的「莖部」，無柄狀態用力推銼會被尾端刺穿手掌——這是工坊嚴重傷害事故主因。' },
  { q: '想要鋸一塊不規則的小工件，工件可以用手按住嗎？', a: '可以，按穩就好', b: '不行，必須用 C 型夾或檯虎鉗固定', correct: 'b', explain: '小工件徒手按容易滑動，鋸子順勢割到按工件的手。所有切削加工的工件都要固定。' },
  { q: '用活動扳手轉螺帽，活動鉗口要靠哪邊？', a: '靠施力方向', b: '靠不施力的方向（固定鉗口受力）', correct: 'b', explain: '活動鉗口受力會「彈開」鬆掉，要讓固定鉗口承受主要力量。施力方向也要「拉」而非「推」較安全。' },
  { q: '鎚到手指了！馬上做什麼？', a: '繼續用敲完', b: '停下檢查、冰敷、嚴重時找老師處理', correct: 'b', explain: '輕傷立刻冰敷可消腫止痛。指甲下淤血嚴重要找醫療處理（可能要放血減壓）。繼續硬撐會加重傷害。' },
  { q: '看到別人鋸子滑掉差點割到，下一步？', a: '不關我的事', b: '提醒對方並協助確認工件固定再繼續', correct: 'b', explain: '工坊安全是團隊責任。看到危險動作要友善提醒——「我看你那邊工件好像沒夾緊？」' },
  { q: '工作完後工具怎麼收？', a: '丟回工具盒就好', b: '清潔 → 檢查有無損壞 → 歸位到「工具影」原位', correct: 'b', explain: '工坊管理：工具有「影子板」（shadow board）每件有固定位置——下一個人才能立刻拿到。歸位前清掉鐵屑與油汙。' },
  { q: '量尺寸時不確定，怎麼辦？', a: '隨便量一次就好', b: '量兩次以上確認，必要時請教老師', correct: 'b', explain: '「Measure twice, cut once 量兩次、切一次」是工藝鐵則。切壞了不能還原，但量幾次只是多花幾秒。' },
  { q: '看到工具有破損（鎚柄裂、銼刀崩齒、起子刀頭歪），怎麼辦？', a: '繼續用沒關係', b: '不要用，標示「待修」並通報老師', correct: 'b', explain: '損壞工具是事故源頭：裂柄鎚頭會飛、崩齒銼刀會打滑、歪刀頭會崩螺絲。要分開放置並寫紙條警示其他同學。' },
];
let score = 0;
const PK = 'ht_progress_v1';
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
      document.getElementById('next-btn').style.opacity = 1; document.getElementById('next-btn').style.pointerEvents = 'auto';
      if (typeof SoundFX !== 'undefined') SoundFX.win();
      const p = loadP(); p.module2 = true; p.safetyPassed = true; saveP(p);
    } else {
      document.getElementById('scenario-result').innerHTML = `<div class="feedback error" style="margin-top:20px">${score} 分，未達 90 分，請重新挑戰。</div>`;
    }
  }
}));
