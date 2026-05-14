// 基本手工具 模組 2：安全闖關
// 設計原則：A 選項是「初學者常見迷思」（看起來合理但其實有風險），B 才是正解。
// 來源編號對應 hand-tools 頁尾「資料來源」區。
const SCENARIOS = [
  { q: '美工刀刀片變鈍切不動，下一步？',
    a: '徒手把鈍掉的刀片折斷取得新刃',
    b: '把刀片伸出 1 格，用內附折斷器（或刀套底部金屬槽）折斷後收進回收盒，或整片更換',
    correct: 'b',
    explain: '鈍刀切要施力大、容易滑掉——「鈍刀比利刀危險」是工坊共識。美工刀刀片每隔一段有「折斷凹槽」，但徒手折斷會被刀片碎片割傷，正確做法是用刀套底部金屬槽或廠商提供的折斷器，並把折下的刀片收進密封回收盒。',
    cite: '[2][3]' },

  { q: '螺絲鎖很緊轉不動，下一步？',
    a: '改用較長把柄的起子（增加力臂）或同尺寸鋼柄起子搭配扳手夾握',
    b: '用力轉看看，或換更大尺寸的螺絲起子',
    correct: 'a',
    explain: '使力過大或換錯尺寸會把刀頭從螺絲頭打滑（崩牙）。增力應該用「長把柄起子」或「鋼柄起子＋扳手」夾握增加力矩，而不是換大一級尺寸。',
    cite: '[1][7]' },

  { q: '銼刀握把鬆動／或拿到無柄銼刀，可以用嗎？',
    a: '用毛巾包住莖部代替握把就好',
    b: '不能用，要先裝上或更換木柄／塑膠柄',
    correct: 'b',
    explain: '銼刀尾端的「莖部」是尖銳細釘狀，無柄或毛巾包覆狀態用力推銼，莖部會穿透布料刺穿手掌——這是工坊常見嚴重事故主因之一。',
    cite: '[2][4]' },

  { q: '要鋸一塊不規則的小工件，可以怎麼固定？',
    a: '用 C 型夾、F 型夾或檯虎鉗固定到工作台',
    b: '用左手按住工件右手鋸（學會控制就好）',
    correct: 'a',
    explain: '小工件徒手按容易滑動，鋸子會順勢割到按工件的手。所有切削加工都應遵守「工件先固定、再下刀」的順序。',
    cite: '[2][3]' },

  { q: '用活動扳手轉螺帽，活動鉗口應該朝哪邊？',
    a: '朝施力的方向（力比較順）',
    b: '朝「不施力」的方向（讓固定鉗口承受主要受力）',
    correct: 'b',
    explain: '活動扳手只有「固定鉗口」是直接連接握把的，受力時不會彈開；「活動鉗口」若朝向施力方向會逐漸鬆開。施力時也要「拉」而非「推」較安全。',
    cite: '[7]' },

  { q: '鎚到手指了，馬上做什麼？',
    a: '停下、冰敷 10–15 分鐘觀察腫脹與活動度；嚴重時通報老師處理',
    b: '甩一甩手繼續做完手上工作',
    correct: 'a',
    explain: '輕傷立刻冰敷可消腫止痛。指甲下淤血嚴重或手指不能彎曲，應送醫評估是否需要放血減壓或骨折處置。繼續硬撐會延誤就醫。',
    cite: '[1][3]' },

  { q: '看到同學鋸子滑掉差點割到，下一步？',
    a: '當作沒看到、各自做自己的',
    b: '友善提醒對方檢查工件是否固定，必要時請老師示範',
    correct: 'b',
    explain: '工坊安全是團隊責任。看到危險動作要友善提醒——「我看你那邊工件好像沒夾緊？」這也是 12 年國教「合作」素養指標的具體實踐。',
    cite: '[2]' },

  { q: '工作完後工具怎麼收？',
    a: '清潔 → 檢查有無損壞 → 歸位到「影子板」（shadow board）的原位',
    b: '清潔後丟回工具盒就好',
    correct: 'a',
    explain: '工坊管理：工具有「影子板」每件有固定輪廓位置——下一個人才能立刻找到，也能一眼看出「少了哪件」。歸位前先清掉鐵屑與油汙。',
    cite: '[8]' },

  { q: '量尺寸時看起來差不多就好嗎？',
    a: '差 1 mm 內可以接受，量一次就好',
    b: '量兩次以上互相確認，重要尺寸請老師複測',
    correct: 'b',
    explain: '「Measure twice, cut once」（量兩次、切一次）是工藝鐵則。切錯不能還原，多花幾秒量幾次卻可避免整件作品報廢。',
    cite: '[2]' },

  { q: '看到工具明顯破損（鎚柄裂、銼刀崩齒、起子刀頭歪），怎麼辦？',
    a: '不要用，標示「待修」或「報廢」並通報老師',
    b: '裂痕不大、繼續用沒關係',
    correct: 'a',
    explain: '損壞工具是事故源頭：裂柄鎚頭使用中可能整顆飛出、崩齒銼刀會打滑、歪刀頭會崩螺絲。依勞動部安衛指引，發現損壞工具應立即停用、隔離並通報。',
    cite: '[1][8]' },
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
  parent.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${correct ? 'success' : 'error'}">${correct ? '✓' : '✗'} ${s.explain}<br><span style="font-size:11px;color:#94a3b8">📚 參考：${s.cite}（見頁尾資料來源）</span></div>`;
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
