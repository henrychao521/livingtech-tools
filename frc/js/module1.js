// FRC 平台 模組 1
const PHASES = {
  auto: { name: '自動期 (Autonomous)', desc: '<strong>15 秒</strong>，機器人完全自主運作，無人類操控。預先寫好的程式判斷場地位置、執行任務（射球、移動、抓取等）。通常是得分關鍵時段，分數加權較高。', color: '#0066B3' },
  teleop: { name: '操控期 (Teleop)', desc: '<strong>2 分 15 秒</strong>，駕駛員（drive team）用搖桿操作機器人。隊伍 3 機器人聯盟對抗，計算對方策略、收集 game piece、得分。', color: '#FF6600' },
  endgame: { name: '終局 (Endgame)', desc: '<strong>Teleop 末段，通常 20–30 秒</strong>（依年度賽季而定，例：2024 Crescendo 20 秒、2025 Reefscape 20 秒），有特殊得分機制（爬桿、垂吊、合作協力等）。一場比賽的勝負常在這段時間決定。', color: '#DC2626' },
};

const TIMER_TOTAL = 150; // 2:30
let timerState = 'auto'; // 'auto' / 'teleop' / 'endgame' / 'paused'

// 階段切換動畫
const phaseCells = document.querySelectorAll('.match-phase-cell');
const phaseDetail = document.getElementById('phase-detail');
phaseCells.forEach(cell => {
  cell.addEventListener('click', () => {
    const phase = cell.dataset.phase;
    phaseCells.forEach(c => c.classList.toggle('active', c === cell));
    const p = PHASES[phase];
    phaseDetail.innerHTML = `<strong style="color:${p.color}">${p.name}：</strong>${p.desc}`;
    if (typeof SoundFX !== 'undefined') SoundFX.click();
  });
});

// 機器人部位
const PARTS = {
  drivetrain: {
    name: 'Drivetrain（驅動底盤）',
    role: 'MOBILITY',
    desc: '機器人最重要的子系統。常見類型：<br>• <strong>Tank Drive</strong>：兩邊各 2-3 個輪，類似坦克<br>• <strong>Mecanum</strong>：四個 45° 滾子輪，可橫向移動<br>• <strong>Swerve</strong>：每輪可獨立轉向，最靈活（頂尖隊伍標配）',
    fact: 'Team 254 自 2019 Deep Space 起嘗試 swerve、2022 後全面採用，搭配自家 254Lib 與 WPILib TrajectoryGenerator，在自動期 15 秒內可完成 3–4 個動作。',
  },
  bumper: {
    name: 'Bumper（保險桿）',
    role: 'IMPACT PROTECTION',
    desc: '紅色或藍色的緩衝桿，繞機器人四周一圈。FRC 規則要求所有機器人都必須裝 bumper；bumper 顏色必須對應 alliance，每場比賽前換色。',
    fact: 'Bumper 規範（規則 R402）：padding 至少 2.25" 深、4.5" 高，使用 pool noodle 填充；bumper zone 須在離地 2.5"–5.75" 之間。比賽前必須通過 inspector 檢查。',
  },
  frame: {
    name: 'Frame（主框架）',
    role: 'CHASSIS',
    desc: '機器人的「骨架」。常用 2x1 鋁管 (例：80/20 系列) 或自製 CNC 鋁板組合。尺寸限制（含 bumper）：frame perimeter ≤ 120"、起始高度 ≤ 4 ft（2024 起）；伸展超出 frame 不可超過 12"。',
    fact: '重量上限：2024 賽季為 ≤ 125.5 lbs（不含 bumper、電池）；2025 起改為 ≤ 115 lbs。比賽前要在 scale 上量測，超重就會被取消資格。',
  },
  battery: {
    name: '電池（Battery）',
    role: 'POWER SOURCE',
    desc: '12V SLA 鉛酸電池（鎳鎘或鋰電池被禁用，規則 R601）。每場比賽用一顆全新充飽的電池。容量 17–18.2 Ah、重量 11–14.5 lb，可支撐一場 2:30 比賽 + buffer。',
    fact: '隊伍會替每顆電池編號，紀錄充放電次數。超過 100 次循環就建議淘汰。',
  },
  roborio: {
    name: 'roboRIO（主控制器）',
    role: 'MAIN CONTROLLER',
    desc: 'FRC 標準主控制器，由 National Instruments 製造。執行隊伍寫的程式（Java / C++ / Python / LabVIEW）。',
    fact: '機器人程式必須符合 WPILib 框架。比賽期間 roboRIO 透過 radio 接收場控訊號（啟動/停止/階段切換）。',
  },
  pdp: {
    name: 'PDP / PDH（配電板）',
    role: 'POWER DISTRIBUTION',
    desc: '把電池的 12V 分配給所有馬達控制器、感測器、roboRIO。內建電流監測（每個 channel）+ 保險絲保護。',
    fact: '現行 REV PDH（2022 起主流）有 20 個高電流 + 4 個低電流 = 共 24 個 channel；舊型 CTRE PDP 為 16 channel。透過 CAN bus 回報電流給 roboRIO，可即時偵測異常。',
  },
  manipulator: {
    name: 'Manipulator / Intake / Shooter',
    role: 'GAME PIECE HANDLER',
    desc: '每年根據賽季任務不同。可能是：<br>• <strong>Intake</strong>：抓取地上的 game piece（如 Note、Cube）<br>• <strong>Shooter</strong>：射球/發射機構<br>• <strong>Climber</strong>：爬桿/吊掛機構<br>• <strong>Arm</strong>：機械手臂',
    fact: '這部分占工程設計時間的 60% 以上 — 因為每年都要重新設計。',
  },
  vision: {
    name: 'Vision System（視覺系統）',
    role: 'PERCEPTION',
    desc: '攝影機 + 影像處理。可偵測 AprilTag（場地上的二維碼）來定位機器人，或追蹤 game piece、目標。常用硬體：Limelight、PhotonVision、自製方案。',
    fact: 'Team 254 自己開發視覺處理 pipeline，從攝影機到馬達控制延遲 < 100ms，遠優於商業方案。',
  },
};

const seenSet = new Set();
const totalParts = Object.keys(PARTS).length;
const infoEl = document.getElementById('parts-info');
const progressEl = document.getElementById('progress-text');
const checklistEl = document.getElementById('parts-checklist');
const nextBtn = document.getElementById('next-btn');

const PK = 'frc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || { module1_seen: [] }; } catch { return { module1_seen: [] }; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const sp = loadP();
if (sp.module1_seen) sp.module1_seen.forEach(id => seenSet.add(id));

Object.entries(PARTS).forEach(([id, p], i) => {
  const c = document.createElement('span');
  c.className = 'part-chip';
  if (seenSet.has(id)) c.classList.add('seen');
  c.dataset.id = id;
  c.textContent = `${i + 1}. ${p.name.split('（')[0].replace(/ \(.*\)/, '').replace(/\/.*/, '').trim()}`;
  checklistEl.appendChild(c);
});

function syncUI() {
  document.querySelectorAll('.hotspot-group').forEach(g => g.querySelector('.hotspot').classList.toggle('seen', seenSet.has(g.dataset.id)));
  progressEl.textContent = `已認識 ${seenSet.size} / ${totalParts} 個項目`;
  if (seenSet.size === totalParts) {
    nextBtn.style.opacity = 1;
    nextBtn.style.pointerEvents = 'auto';
  }
}
syncUI();

function render(id) {
  const p = PARTS[id];
  if (!p) return;
  if (typeof SoundFX !== 'undefined') SoundFX.pop();
  infoEl.innerHTML = `<h3>${p.name}</h3><p class="role">${p.role}</p><p class="desc">${p.desc}</p>
    <div style="margin-top:18px;padding:14px;background:var(--accent-light);border-radius:10px;border-left:4px solid var(--accent);font-size:13px;color:var(--text-soft)">
      <strong style="color:var(--accent)">💡 頂尖隊伍小知識：</strong>${p.fact}
    </div>`;
  if (!seenSet.has(id)) {
    seenSet.add(id);
    document.querySelector(`.part-chip[data-id="${id}"]`)?.classList.add('seen');
    syncUI();
    const prog = loadP();
    prog.module1_seen = Array.from(seenSet);
    if (seenSet.size === totalParts) {
      prog.module1 = true;
      if (typeof SoundFX !== 'undefined') SoundFX.unlock();
      showToast('🎉 八個部件都認識完畢！', 'good');
    }
    saveP(prog);
  }
  document.querySelectorAll('.hotspot-group').forEach(g => g.querySelector('.hotspot').classList.toggle('active', g.dataset.id === id));
}

document.querySelectorAll('.hotspot-group').forEach(g => g.addEventListener('click', () => render(g.dataset.id)));
document.querySelectorAll('.part-chip').forEach(c => c.addEventListener('click', () => render(c.dataset.id)));
