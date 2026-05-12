// FRC 模組 4：機器人配置策略模擬
const canvas = document.getElementById('frc-field');
const ctx = canvas.getContext('2d');

const CONFIG = {
  drive: 'tank',
  manip: 'intake-only',
  auto: 'basic',
  end: 'park',
};

// 配置選項的得分加權
const DRIVES = {
  tank: { speed: 3, agility: 2, difficulty: 1, defense: 4, name: 'Tank Drive', emoji: '🚜' },
  mecanum: { speed: 3.5, agility: 4, difficulty: 2.5, defense: 3, name: 'Mecanum', emoji: '↔️' },
  swerve: { speed: 4.5, agility: 5, difficulty: 5, defense: 2, name: 'Swerve', emoji: '🌀' },
};
const MANIPS = {
  'intake-only': { teleopScore: 8, autoCap: 5, reliability: 4.5, weight: 1, name: '僅 Intake' },
  arm: { teleopScore: 15, autoCap: 10, reliability: 3.5, weight: 2.5, name: '機械手臂' },
  shooter: { teleopScore: 18, autoCap: 12, reliability: 3, weight: 2, name: '射擊機構' },
  combo: { teleopScore: 25, autoCap: 18, reliability: 2.5, weight: 3.5, name: '手臂+射擊' },
};
const AUTOS = {
  basic: { score: 3, complexity: 1, name: '走出起點' },
  'score-one': { score: 7, complexity: 2.5, name: '單次得分' },
  multi: { score: 17, complexity: 5, name: '多任務 vision' },
};
const ENDS = {
  park: { score: 2, complexity: 1, name: 'Park' },
  climb: { score: 12, complexity: 3, name: '爬桿' },
  harmony: { score: 20, complexity: 5, name: '合作爬' },
};

const PK = 'frc_progress_v1';

// 配置點擊
document.querySelectorAll('.config-option').forEach(opt => {
  opt.addEventListener('click', () => {
    const cat = opt.dataset.cat;
    const id = opt.dataset.id;
    document.querySelectorAll(`.config-option[data-cat="${cat}"]`).forEach(o => o.classList.toggle('selected', o === opt));
    CONFIG[cat] === id ? null : (CONFIG[cat] = id);
    CONFIG[cat] = id;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    update();
  });
});

function update() {
  const d = DRIVES[CONFIG.drive];
  const m = MANIPS[CONFIG.manip];
  const a = AUTOS[CONFIG.auto];
  const e = ENDS[CONFIG.end];

  // 得分計算
  // Teleop 估算：manipulator 得分 * 移動速度因子 * 可靠度
  const teleopMatchCount = m.teleopScore * (d.speed / 4) * (m.reliability / 5);
  const autoScore = Math.min(a.score, m.autoCap * (a.complexity / 5 + 0.3));
  const endScore = e.score;
  // 防守得分 (drive 影響)
  const defenseBonus = d.defense * 1.5;
  const totalScore = Math.round(teleopMatchCount + autoScore + endScore + defenseBonus);

  document.getElementById('total-score').textContent = totalScore;

  // 細項顯示
  document.getElementById('score-breakdown').innerHTML = `
    <div class="stat-row"><span>${d.emoji} 驅動分數</span><span class="val">${(teleopMatchCount).toFixed(1)} pts</span></div>
    <div class="stat-row"><span>🎯 Manipulator 得分</span><span class="val">${(m.teleopScore * m.reliability / 5).toFixed(1)} ×場數</span></div>
    <div class="stat-row"><span>🤖 自動期</span><span class="val">${autoScore.toFixed(1)} pts</span></div>
    <div class="stat-row"><span>🏁 終局</span><span class="val">${endScore} pts</span></div>
    <div class="stat-row"><span>🛡️ 防守加成</span><span class="val">+${defenseBonus.toFixed(1)} pts</span></div>
    <div class="stat-row"><span>⚙️ 設計難度</span><span class="val ${d.difficulty + m.weight + a.complexity > 10 ? 'bad' : d.difficulty + m.weight > 6 ? 'warn' : 'good'}">${(d.difficulty + m.weight + a.complexity).toFixed(1)} / 15</span></div>
    <div class="stat-row"><span>💪 可靠度</span><span class="val ${m.reliability >= 4 ? 'good' : m.reliability >= 3 ? '' : 'bad'}">${m.reliability.toFixed(1)} / 5</span></div>
  `;

  // 建議
  let rec = '';
  let recClass = '';
  if (totalScore >= 55) {
    rec = '🏆 <strong>頂級配置！</strong>這套組合預測能在區域賽進入 alliance pick（前 8 強）。但難度高，需要充足時間製造與測試。建議：駕駛員至少 100+ practice match。';
    recClass = 'success';
  } else if (totalScore >= 40) {
    rec = '✅ <strong>穩健配置！</strong>實用度高，適合多數隊伍。在區域賽應能進入中段。可考慮把 endgame 升級為合作（+8 分）。';
    recClass = 'success';
  } else if (totalScore >= 25) {
    rec = '⚠️ <strong>基本配置！</strong>能比賽但難拿名次。建議：把 manipulator 升級或加入射擊機構，可大幅提升 teleop 得分。';
    recClass = 'warn';
  } else {
    rec = '❌ <strong>太基礎了！</strong>這套配置在大部分賽季可能僅能 mobility + park。建議至少升級一個項目，比例考量：先升 manipulator > autonomous > drivetrain > endgame。';
    recClass = 'bad';
  }
  // 額外提醒
  if (CONFIG.drive === 'swerve' && CONFIG.manip === 'combo') {
    rec += '<br><br>⚡ <strong>注意</strong>：Swerve + 全能 manipulator 是頂尖配置但成本可觀（主流 COTS swerve 如 MK4i / MAXSwerve / SDS 約 $500–$700 / module，加馬達與編碼器後一組 $800–$1200；整套 4 個約 $3000–$5000 USD）。確保預算與時間。';
  }
  if (CONFIG.auto === 'multi' && m.reliability < 4) {
    rec += '<br><br>⚠️ <strong>注意</strong>：複雜自動程式 + 低可靠度 manipulator = 自動期失敗率高。建議先穩定 mechanism 再做進階 auto。';
  }
  document.getElementById('recommendation').innerHTML = `<div class="recommendation ${recClass}">${rec}</div>`;

  drawField();

  // 完成模組 4 標記
  let p; try { p = JSON.parse(localStorage.getItem(PK)) || {}; } catch { p = {}; }
  p.module4 = true;
  p.module4_score = totalScore;
  localStorage.setItem(PK, JSON.stringify(p));
}

function drawField() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 場地（俯視）
  // 中線
  ctx.fillStyle = '#2d4f6e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 紅藍區
  ctx.fillStyle = 'rgba(220,38,38,.15)';
  ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
  ctx.fillStyle = 'rgba(0,102,179,.15)';
  ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
  // 中線
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  // 起點區
  ctx.strokeStyle = 'rgba(255,255,255,.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 60, 70, 280);
  ctx.strokeRect(650, 60, 70, 280);
  // 得分區
  ctx.fillStyle = 'rgba(34,197,94,.3)';
  ctx.fillRect(140, 80, 60, 80);
  ctx.fillRect(140, 240, 60, 80);
  ctx.fillRect(560, 80, 60, 80);
  ctx.fillRect(560, 240, 60, 80);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('得分區', 170, 130);
  // Game piece（場地中間）
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 80 + i * 60, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 機器人（依配置畫）
  drawRobot(180, 200, 'red');
  drawRobot(580, 200, 'blue');

  // 標題
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Inter';
  ctx.textAlign = 'left';
  ctx.fillText('紅隊聯盟', 50, 35);
  ctx.textAlign = 'right';
  ctx.fillText('藍隊聯盟', canvas.width - 50, 35);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('Game Piece', canvas.width / 2, 30);

  // 配置標籤
  const d = DRIVES[CONFIG.drive];
  const m = MANIPS[CONFIG.manip];
  ctx.fillStyle = '#fff';
  ctx.font = '12px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`${d.emoji} ${d.name}`, 130, 380);
  ctx.fillText(`${m.name}`, 230, 380);
}

function drawRobot(x, y, color) {
  // Bumper
  ctx.fillStyle = color === 'red' ? '#dc2626' : '#0066B3';
  ctx.fillRect(x - 28, y - 28, 56, 56);
  // 主體
  ctx.fillStyle = color === 'red' ? '#7f1d1d' : '#004A87';
  ctx.fillRect(x - 22, y - 22, 44, 44);
  // 輪子
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - 30, y - 32, 8, 12);
  ctx.fillRect(x + 22, y - 32, 8, 12);
  ctx.fillRect(x - 30, y + 20, 8, 12);
  ctx.fillRect(x + 22, y + 20, 8, 12);
  // 機械手臂依配置（如果有）
  if (CONFIG.manip === 'arm' || CONFIG.manip === 'combo') {
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y - 50);
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 10, y - 55, 20, 8);
  }
  if (CONFIG.manip === 'shooter' || CONFIG.manip === 'combo') {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(x + 22, y - 10);
    ctx.lineTo(x + 35, y - 6);
    ctx.lineTo(x + 35, y + 6);
    ctx.lineTo(x + 22, y + 10);
    ctx.closePath();
    ctx.fill();
  }
}

update();
