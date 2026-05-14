// 3D 印表機 模組 2：安全闖關
const SCENARIOS = [
  { q: '列印中發現首層沒附著（在亂跑），下一步？', a: '立刻按暫停，重新校正熱床', b: '繼續列印看會不會自己好', correct: 'a', explain: '首層沒附著代表噴頭與熱床距離不對。繼續印只會浪費料 + 噴頭被纏成一坨。應立刻停止重新校正。' },
  { q: '想換絲線，正確順序？', a: '加熱噴頭到列印溫度 → 抽出舊絲 → 推入新絲 → 擠出一段確認顏色', b: '直接拉舊絲、塞新絲', correct: 'a', explain: '冷拉絲線會讓殘留塑料卡在加熱頭內造成堵料。一定要加熱到熔點才能拉。' },
  { q: '剛列印完的物件，多久才能徒手摸熱床？', a: '等到 LCD 顯示溫度 < 40°C 才摸', b: '立刻就能摸（已停止加熱）', correct: 'a', explain: '熱床從 60°C 降到 40°C 約需 5 分鐘。即使「停止加熱」按下，餘溫還是會燙人。' },
  { q: '列印過程中聞到刺鼻味（特別是塑料燒焦味），怎麼辦？', a: '繼續列印但開窗通風', b: '立刻停止列印，找出問題（可能是 ABS 高溫或堵料燒焦）', correct: 'b', explain: 'ABS 含苯乙烯，高溫會釋放有毒煙；堵料燒焦也是元件異常。一定要停止並檢查。' },
  { q: 'PLA 絲線受潮會有什麼影響？', a: '列印時噴嘴會發出「啵啵」聲，表面有氣泡', b: '完全不影響，PLA 不吸水', correct: 'a', explain: '絲線吸水後高溫汽化，造成擠出不穩、表面粗糙。要密封 + 乾燥劑保存，受潮可用乾燥箱烘 4 小時。' },
  { q: '列印中要把噴頭停一下，正確做法？', a: '直接拔電源', b: '在切片軟體或 LCD 用「暫停」（會把噴頭撐開避免燒物件）', correct: 'b', explain: '直接拔電源會讓噴頭停在物件上，慢慢把那個區塊燒成一坨。要用「暫停」讓機器自動移開噴頭。' },
  { q: '取下列印好的物件，工具用什麼？', a: '徒手用力拔', b: '用平頭鏟刀（spatula）斜插底部、順著底面撬', correct: 'b', explain: '徒手會割傷或拉壞熱床表面。鏟刀要平貼熱床順著底面進入。物件會自然彈起。' },
  { q: '看到加熱頭異常冒煙、變色，立刻？', a: '緊急停止 → 拔電源 → 等冷卻後檢查', b: '繼續列印觀察會不會自己好', correct: 'a', explain: '冒煙是內部材料燒毀的訊號，可能是堵料或加熱棒短路。一定要斷電，避免火災。' },
  { q: '長時間列印（如 8 小時以上），可以無人在場嗎？', a: '可以，現代印表機有過熱保護', b: '建議至少要有人定期檢查（至少每 1 小時一次）', correct: 'b', explain: '即使有保護機制，3D 印表機仍是火災風險來源。建議使用「列印監控攝影機」或定期巡檢。' },
  { q: '列印時，可以伸手進去調整熱床嗎？', a: '可以，但要小心', b: '絕對不可以，X 軸會撞到手', correct: 'b', explain: 'X 軸馬達不知道你的手在那，會直接撞過來。要調整必須先暫停列印。' },
];
let score = 0;
const PK = 'printer3d_progress_v1';
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
