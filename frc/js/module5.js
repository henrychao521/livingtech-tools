// FRC 模組 5：工程筆記範本 + 獎項

const PAGES = [
  { type: '策略一頁紙', subtitle: 'Strategy 1-Pager', date: 'Week 1, Day 1', content: '<strong>核心問題：</strong>今年（2024 Crescendo）得分：SPEAKER Note 2 分（放大時 5 分）、AMP Note 1 分、TRAP 5 分 → 主攻 SPEAKER。<br><br><strong>機器人目標：</strong><br>1. Auto: Mobility + 1 Note → 7 分<br>2. Teleop: 12+ Notes 進 SPEAKER（放大時 5 分/顆）→ 60 分<br>3. Endgame: ONSTAGE 爬桿 → 3 分<br>4. 不做 STAGE Trap（投資報酬率低）' },
  { type: '腦力激盪', subtitle: 'Brainstorm Session', date: 'Week 1, Day 3', content: '<strong>Intake 機構候選：</strong><br>1. Over-bumper roller（推入）<br>2. Under-bumper（下抓）<br>3. Floor intake（地面收取）<br><br><strong>Pros/Cons 評分（1-5）：</strong><br>1. 速度: 3/5/4　可靠: 4/3/5　成本: 5/3/2<br><br>→ 選 #3 Floor intake' },
  { type: '原型測試', subtitle: 'Prototype Test Log', date: 'Week 2, Day 4', content: '<strong>原型 v1：</strong>木板 + 3D 列印滾輪<br><strong>測試結果（20 次）：</strong><br>• 成功撿取：18 / 20 (90%)<br>• 平均時間：1.2 秒<br>• 失敗原因：滾輪打滑（兩次）<br><br><strong>改進方向：</strong>滾輪換 90A 橡膠 + 增加表面壓力 0.5N' },
  { type: 'CAD 設計', subtitle: 'CAD Design Doc', date: 'Week 3, Day 1', content: '<strong>零件清單：</strong><br>• Frame: 2x1 鋁管 × 8 (1064mm + 762mm)<br>• Side plates: CNC AL 6061 × 2<br>• Roller: 1" × 8" 100A polyurethane<br>• Motors: 2× NEO 550 (with 4:1 reduction)<br><br><strong>力學分析：</strong>馬達扭力 0.9 Nm × 4 (reduction) = 3.6 Nm > 預估荷重 2.5 Nm ✓' },
  { type: '電氣設計', subtitle: 'Electrical Schematic', date: 'Week 3, Day 5', content: '<strong>PDH Channel 配置：</strong><br>• Ch 0-3: 4× Falcon 500 (drivetrain)<br>• Ch 4-5: 2× NEO 550 (intake)<br>• Ch 6: NEO (shooter)<br><br><strong>感測器：</strong><br>• 2× CANcoder（swerve absolute）<br>• 1× Limelight 3<br>• 1× Pigeon 2 IMU<br><br><strong>總電流預估：</strong>120 A peak / 40 A avg ✓ 在電池容量內' },
  { type: '測試與資料', subtitle: 'Testing Data', date: 'Week 5, Day 2', content: '<strong>射擊精度測試（50 次）：</strong><br>• 距離 3m: 命中率 96% (48/50)<br>• 距離 5m: 命中率 80% (40/50)<br>• 距離 7m: 命中率 56% (28/50)<br><br><strong>決策：</strong>策略僅在 < 5m 區域射擊<br><br><strong>速度測試：</strong>Note 從撿到射出平均 2.8 秒（目標 < 3 秒 ✓）' },
  { type: '比賽復盤', subtitle: 'Match Reflection', date: 'Regional Event, Match 24', content: '<strong>比賽結果：</strong>132 - 145 (Loss)<br><br><strong>檢討：</strong><br>• Auto: 7 分 (目標 12) → autonomous 沒撿到第 2 顆 Note。原因：vision 對 AprilTag 失準。<br>• Teleop: 78 分 (目標 90) → 沒問題。<br>• Endgame: 0 分 (目標 3) → 鏈條卡住爬不起來。<br><br><strong>改進：</strong>明天比賽前重做 chain tensioner。' },
  { type: '財務與物料', subtitle: 'BOM + Budget', date: '全季彙整', content: '<strong>物料總成本：</strong>$8,420 USD<br><br><strong>分類：</strong><br>• Drivetrain (swerve modules): $6,000<br>• Manipulator parts: $1,200<br>• Electronics: $850<br>• Bumpers/Frame/Misc: $370<br><br><strong>贊助商：</strong>$5,000（GitHub, NVIDIA, 在地廠商）<br><strong>自籌：</strong>$3,420（捐款、義賣）' },
];

const pagesEl = document.getElementById('notebook-pages');
PAGES.forEach(p => {
  const card = document.createElement('div');
  card.className = 'notebook-page';
  card.innerHTML = `
    <h5>${p.type} ｜ ${p.date}</h5>
    <div class="nb-content">
      <div style="font-size:11px;color:#92400e;font-family:monospace;margin-bottom:8px">${p.subtitle}</div>
      ${p.content}
    </div>
  `;
  pagesEl.appendChild(card);
});

// 獎項
const AWARDS = [
  { name: 'Impact Award', cn: 'FIRST 影響力獎', desc: 'FRC 最高榮譽。表彰隊伍對社區、教育、STEM 推廣的長遠影響力。獲獎隊伍自動晉級世界錦標賽。', criteria: '• 創隊歷史與影響力<br>• 推廣 FIRST 精神<br>• 對社區的具體貢獻<br>• 影片 + Essay + 面試', emoji: '🏆' },
  { name: 'Excellence in Engineering', cn: '工程卓越獎', desc: '表彰機器人「各 subsystem 無縫整合」的優異設計。看的是技術整合與系統工程。', criteria: '• Subsystem 之間配合度<br>• 設計細節與工藝<br>• 創新元素<br>• 維修方便性', emoji: '⚙️' },
  { name: 'Engineering Inspiration', cn: '工程啟發獎', desc: '表彰隊伍在學校 / 社區「推廣工程」的成就。重點是「啟發他人」。', criteria: '• 社區參與深度<br>• 教育推廣計畫<br>• 學生成長故事<br>• 獲 NASA 支持（補助獲獎隊伍報名費）', emoji: '✨' },
  { name: 'Creativity Award', cn: '創意獎', desc: '由 Xerox 贊助。表彰最有創意的機械設計概念，特別是 unconventional 的解法。', criteria: '• 與眾不同的方法<br>• 解決傳統難題<br>• 設計巧思', emoji: '💡' },
  { name: 'Industrial Design', cn: '工業設計獎', desc: '表彰機器人「兼具形式、功能、美學」。Bumper 工藝、線材整理、視覺整合都加分。', criteria: '• 美學整體性<br>• 工藝精緻度<br>• 形式與功能平衡', emoji: '🎨' },
  { name: 'Innovation in Control', cn: '控制創新獎', desc: '表彰機器人控制系統的獨特應用。可能是自動程式、視覺系統、或感測器整合。', criteria: '• 演算法創新<br>• 感測器運用<br>• 軟硬整合', emoji: '🤖' },
];

const awardsEl = document.getElementById('awards');
AWARDS.forEach(a => {
  const card = document.createElement('div');
  card.className = 'award-card';
  card.innerHTML = `
    <span class="award-trophy">${a.emoji}</span>
    <h4>${a.cn}</h4>
    <div class="award-name-en">${a.name}</div>
    <p style="margin-bottom:10px">${a.desc}</p>
    <div style="background:rgba(251,191,36,.15);padding:8px 10px;border-radius:6px;font-size:12px;line-height:1.7"><strong style="color:#92400e">評鑑指標：</strong><br>${a.criteria}</div>
  `;
  awardsEl.appendChild(card);
});

// 自評清單
const CHECKLIST = [
  '每個 subsystem 都有 brainstorm 階段紀錄（至少 3 個候選方案）',
  '每個重大決策都有 Pugh chart 或評分矩陣支持',
  '所有原型測試都有量化數據（成功率、時間、誤差）',
  'CAD 圖含完整工程圖與 BOM（Bill of Materials）',
  '電氣有完整線路圖（含 PDP 通道配置與保險絲規格）',
  '寫得讓「外人也看得懂」 — 評審不是你的隊員',
  '每頁有日期、作者、版本號',
  '失敗紀錄 = 成功紀錄（從錯誤學習）',
  '附上贊助商致謝與財務透明度',
  '一頁總結（Executive Summary）方便評審快速判斷',
];

const checklistEl = document.getElementById('checklist');
let checkedCount = 0;
CHECKLIST.forEach((item, i) => {
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:var(--bg-soft);border-radius:8px;margin-bottom:6px;cursor:pointer;transition:all .2s;border:1px solid transparent';
  div.innerHTML = `
    <input type="checkbox" id="chk${i}" style="margin-top:3px;cursor:pointer">
    <label for="chk${i}" style="cursor:pointer;font-size:14px;line-height:1.6;flex:1">${item}</label>
  `;
  const chkbox = div.querySelector('input');
  chkbox.addEventListener('change', () => {
    div.style.background = chkbox.checked ? 'var(--success-light)' : 'var(--bg-soft)';
    div.style.borderColor = chkbox.checked ? 'var(--success)' : 'transparent';
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    updateChecklistResult();
  });
  checklistEl.appendChild(div);
});

function updateChecklistResult() {
  const checked = document.querySelectorAll('#checklist input:checked').length;
  const total = CHECKLIST.length;
  const result = document.getElementById('checklist-result');
  let msg = '', cls = '';
  if (checked === total) {
    msg = `🏆 <strong>${checked} / ${total} ・ 完美！</strong>你的工程筆記達到競賽級水準，有機會角逐 Excellence in Engineering Award。`;
    cls = 'success';
  } else if (checked >= 7) {
    msg = `✅ <strong>${checked} / ${total} ・ 不錯！</strong>已有競賽基礎，補齊剩下 ${total - checked} 項就有獎項競爭力。`;
    cls = 'success';
  } else if (checked >= 4) {
    msg = `⚠️ <strong>${checked} / ${total} ・ 還需努力</strong>。工程筆記是 FRC 的核心評鑑項目，建議優先補足量化數據與決策紀錄。`;
    cls = 'warn';
  } else if (checked > 0) {
    msg = `❌ <strong>${checked} / ${total} ・ 基礎不足</strong>。沒有完整工程筆記就無法參與多數高階獎項評選。`;
    cls = 'bad';
  } else {
    msg = `勾選符合的項目，看你的工程筆記準備度。`;
    cls = '';
  }
  result.innerHTML = cls ? `<div class="feedback ${cls === 'success' ? 'success' : cls === 'warn' ? 'info' : 'error'}">${msg}</div>` : `<p class="muted">${msg}</p>`;

  // 完成標記
  if (checked >= 7) {
    const PK = 'frc_progress_v1';
    let p; try { p = JSON.parse(localStorage.getItem(PK)) || {}; } catch { p = {}; }
    p.module5 = true;
    p.module5_score = checked;
    localStorage.setItem(PK, JSON.stringify(p));
  }
}
updateChecklistResult();
