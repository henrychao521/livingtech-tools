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
