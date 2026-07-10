// 模組 3：操作步驟教學 — 精緻 SVG 動畫
const STEPS = [
  {
    title: '開機前檢查',
    anim: 'check',
    desc: '操作前先檢查機台周邊：工作台是否乾淨、鋸條是否安裝牢固、護目鏡是否戴好、頭髮與袖口是否收好。養成「機台四周環顧一圈」的習慣，每次都從同一個方向開始檢查。',
    tip: '建立「環視 → 確認 → 開始」三步驟的儀式感，能大幅降低疏忽。',
    warn: null,
  },
  {
    title: '安裝／確認鋸條',
    anim: 'blade',
    desc: '依切割材料選擇鋸條粗細：薄板用細齒（18–25 TPI）、厚板用粗齒（10–15 TPI）。安裝順序：先鎖下夾頭 → 再鎖上夾頭 → 最後調整張力。',
    tip: '鋸條鋸齒「朝下」朝向工作台。用手指輕彈，發出「叮」清亮聲表示張力適中。',
    warn: '鋸齒方向裝反會完全切不動！是初學者最常見的錯誤。',
  },
  {
    title: '調整速度',
    anim: 'speed',
    desc: '依木材種類調整：硬木（如柚木、橡木）→ 慢速；軟木（如松木、合板）→ 中速；切曲線需要時可再加快。',
    tip: '初學練習一律從「中速」（約 800 SPM）開始，不要追求速度。',
    warn: null,
  },
  {
    title: '調整壓料桿',
    anim: 'holddown',
    desc: '把壓料桿降下，輕貼在木板表面。壓料桿要剛好碰到木板，但不過度壓緊（木板還能順暢滑動）。',
    tip: '正確的壓料桿能消除 90% 的「鋸條把木板震彈起來」問題。',
    warn: '壓料桿沒裝好就開機，鋸條會在木板上下震動時拉扯木板，極危險。',
  },
  {
    title: '對準切割線',
    anim: 'align',
    desc: '把鋸條對準切割線的「外側」（保留線約 1mm，後續用銼刀修平）。確認手部位置在「安全三角區」（雙手拇指在木板邊緣、距鋸條至少 5 公分）。',
    tip: '切割線要事先用 0.5mm 的鉛筆畫，太粗的線無法精確對位。',
    warn: null,
  },
  {
    title: '雙手扶板',
    anim: 'hands',
    desc: '雙手拇指自然地按在木板兩側邊緣，其他手指輕扶。重點是「平衡」而非「用力」。手肘自然下垂，肩膀放鬆。',
    tip: '緊張時肩膀會聳起，反而失去控制感。深呼吸再開始。',
    warn: '絕對不可以單手操作，也不可以把手指放在鋸條前方。',
  },
  {
    title: '緩推前進',
    anim: 'feed',
    desc: '開啟電源後，木板向前推進，速度約「鋸條每往復 5–10 次推進 1 公分」。讓鋸條自己切，而不是「推鋸條」。',
    tip: '推太快 → 鋸條彎曲、燒焦、易斷；推太慢 → 摩擦生熱、切口焦黑。',
    warn: '感覺木板「卡住」要立刻減速或停止，可能是鋸條斷了或夾住。',
  },
  {
    title: '內挖切割（先鑽孔再穿鋸條）',
    anim: 'pierce',
    desc: '想在木板「中間」挖出鏤空圖形，不能從邊緣切進去，要用內挖手法：① 在要挖除的廢料區內鑽一個 ≥6mm 的導孔 → ② 鬆開上夾頭，在關機狀態下把鋸條穿過導孔 → ③ 重新夾緊鋸條並調整張力 → ④ 沿內輪廓切割 → ⑤ 完成後再次鬆開上夾頭，取出工件。模組 4 的 L4 關卡就是內挖切割挑戰，先把手順記熟再去闖關！',
    tip: '導孔要鑽在廢料區內、離切割線約 3–5mm，起鋸時比較好對線；挖除的廢料掉下來才算完整成功。',
    warn: '穿鋸條全程必須關機！確認電源關閉、鋸條完全靜止，才能鬆開上夾頭。',
  },
  {
    title: '完工關機',
    anim: 'shutdown',
    desc: '切割完畢 → 關閉電源 → 等鋸條完全停止 → 把木板與木屑清理乾淨 → 把壓料桿升起。',
    tip: '「等鋸條完全停止」是最重要的一步，許多事故發生在「以為已經停了」。',
    warn: '離開機台前一定要回頭確認電源已關。',
  },
];

const stepListEl = document.getElementById('step-list');
const stepDetailEl = document.getElementById('step-detail');
const stepProgressEl = document.getElementById('step-progress');
const seenSteps = new Set();
let currentStep = 0;

// 載入既有進度
const savedProg = loadProgress();
if (savedProg.module3_seen) savedProg.module3_seen.forEach(i => seenSteps.add(i));

STEPS.forEach((s, i) => {
  const item = document.createElement('div');
  item.className = 'step-item';
  if (seenSteps.has(i)) item.classList.add('done');
  item.dataset.idx = i;
  item.innerHTML = `<div class="num">${i + 1}</div><div class="step-title">${s.title}</div>`;
  item.addEventListener('click', () => selectStep(i));
  stepListEl.appendChild(item);
});

function selectStep(i) {
  currentStep = i;
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  document.querySelectorAll('.step-item').forEach((el, idx) => {
    el.classList.toggle('active', idx === i);
  });
  const s = STEPS[i];
  stepDetailEl.innerHTML = `
    <div class="step-num">STEP ${String(i + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}</div>
    <h3>${s.title}</h3>
    <div class="step-anim">${renderAnim(s.anim)}</div>
    <p>${s.desc}</p>
    <div class="step-tip"><strong>💡 提示：</strong>${s.tip}</div>
    ${s.warn ? `<div class="step-warn"><strong>⚠️ 注意：</strong>${s.warn}</div>` : ''}
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:space-between">
      <button class="btn btn-ghost" ${i === 0 ? 'disabled' : ''} onclick="selectStep(${i - 1})">← 上一步</button>
      <button class="btn btn-primary" onclick="markDone(${i})">${i === STEPS.length - 1 ? '完成所有步驟 ✓' : '我已了解，下一步 →'}</button>
    </div>
  `;
}

function markDone(i) {
  if (!seenSteps.has(i)) {
    seenSteps.add(i);
    if (typeof SoundFX !== 'undefined') SoundFX.success();
  }
  document.querySelectorAll('.step-item')[i].classList.add('done');
  stepProgressEl.textContent = `已學習 ${seenSteps.size} / ${STEPS.length} 步`;
  const prog = loadProgress();
  prog.module3_seen = Array.from(seenSteps);
  saveProgress(prog);
  if (seenSteps.size === STEPS.length) {
    document.getElementById('next-btn').style.opacity = 1;
    document.getElementById('next-btn').style.pointerEvents = 'auto';
    if (typeof SoundFX !== 'undefined') SoundFX.unlock();
    showToast('🎉 九個步驟都看完了，準備好進入模擬練習！', 'good');
    prog.module3 = true;
    saveProgress(prog);
  }
  if (i < STEPS.length - 1) selectStep(i + 1);
}

// === 精緻 SVG 動畫 ===
function renderAnim(type) {
  const anims = {
    check: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <defs>
          <linearGradient id="checkBodyG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#FFAA55"/><stop offset="1" stop-color="#FF7A00"/>
          </linearGradient>
        </defs>
        <!-- 機台簡圖 -->
        <rect x="120" y="140" width="160" height="60" rx="4" fill="url(#checkBodyG)"/>
        <rect x="100" y="195" width="200" height="20" rx="3" fill="#3a3a3a"/>
        <rect x="190" y="100" width="20" height="50" fill="#222"/>
        <rect x="160" y="90" width="80" height="14" fill="#FF9933"/>
        <!-- 環視動畫圓 -->
        <circle cx="200" cy="155" r="80" fill="none" stroke="#FF7A00" stroke-width="2" stroke-dasharray="6 6">
          <animateTransform attributeName="transform" type="rotate" from="0 200 155" to="360 200 155" dur="6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="200" cy="155" r="100" fill="none" stroke="#FF7A00" stroke-width="1" stroke-dasharray="3 3" opacity=".5">
          <animateTransform attributeName="transform" type="rotate" from="360 200 155" to="0 200 155" dur="8s" repeatCount="indefinite"/>
        </circle>
        <!-- 檢查項目（角落白卡片，避開機台與圈圈）-->
        <g font-family="Noto Sans TC,sans-serif" font-size="11" font-weight="600">
          <rect x="4" y="6" width="92" height="22" rx="4" fill="#fff" stroke="#16a34a" stroke-width="1.5"/>
          <text x="50" y="22" text-anchor="middle" fill="#15803d">✓ 工作台乾淨</text>
          <rect x="304" y="6" width="92" height="22" rx="4" fill="#fff" stroke="#16a34a" stroke-width="1.5"/>
          <text x="350" y="22" text-anchor="middle" fill="#15803d">✓ 護目鏡</text>
          <rect x="4" y="212" width="92" height="22" rx="4" fill="#fff" stroke="#16a34a" stroke-width="1.5"/>
          <text x="50" y="228" text-anchor="middle" fill="#15803d">✓ 鋸條牢固</text>
          <rect x="304" y="212" width="92" height="22" rx="4" fill="#fff" stroke="#16a34a" stroke-width="1.5"/>
          <text x="350" y="228" text-anchor="middle" fill="#15803d">✓ 周圍淨空</text>
        </g>
        <!-- 中央眼睛 -->
        <text x="200" y="165" text-anchor="middle" font-size="38">👀</text>
      </svg>`,

    blade: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <!-- 工作台 -->
        <rect x="50" y="180" width="300" height="50" rx="4" fill="#cfcfcf"/>
        <!-- 上下夾頭 -->
        <rect x="180" y="40" width="40" height="18" rx="2" fill="#1a1a1a"/>
        <rect x="180" y="180" width="40" height="18" rx="2" fill="#1a1a1a"/>
        <!-- 鋸條（震動）-->
        <g>
          <rect x="197" y="58" width="6" height="122" fill="#222">
            <animate attributeName="y" values="58;62;58" dur="0.25s" repeatCount="indefinite"/>
          </rect>
          <!-- 鋸齒（細節，朝下）-->
          <g fill="#222">
            <polygon points="197,75 193,79 197,83">
              <animate attributeName="points" values="197,75 193,79 197,83;197,79 193,83 197,87;197,75 193,79 197,83" dur="0.25s" repeatCount="indefinite"/>
            </polygon>
            <polygon points="197,95 193,99 197,103">
              <animate attributeName="points" values="197,95 193,99 197,103;197,99 193,103 197,107;197,95 193,99 197,103" dur="0.25s" repeatCount="indefinite"/>
            </polygon>
            <polygon points="197,115 193,119 197,123">
              <animate attributeName="points" values="197,115 193,119 197,123;197,119 193,123 197,127;197,115 193,119 197,123" dur="0.25s" repeatCount="indefinite"/>
            </polygon>
            <polygon points="197,135 193,139 197,143">
              <animate attributeName="points" values="197,135 193,139 197,143;197,139 193,143 197,147;197,135 193,139 197,143" dur="0.25s" repeatCount="indefinite"/>
            </polygon>
            <polygon points="197,155 193,159 197,163">
              <animate attributeName="points" values="197,155 193,159 197,163;197,159 193,163 197,167;197,155 193,159 197,163" dur="0.25s" repeatCount="indefinite"/>
            </polygon>
          </g>
        </g>
        <!-- 標示 -->
        <line x1="200" y1="120" x2="280" y2="120" stroke="#E14A4A" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="290" y="115" font-family="Noto Sans TC,sans-serif" font-size="13" fill="#E14A4A" font-weight="700">齒朝下</text>
        <text x="290" y="130" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#E14A4A">向工作台</text>

        <line x1="200" y1="58" x2="100" y2="58" stroke="#444" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="40" y="62" font-family="Noto Sans TC,sans-serif" font-size="12" fill="#444">上夾頭</text>

        <line x1="200" y1="200" x2="100" y2="200" stroke="#444" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="40" y="204" font-family="Noto Sans TC,sans-serif" font-size="12" fill="#444">下夾頭</text>
      </svg>`,

    speed: `
      <svg viewBox="0 0 400 240" style="width:80%;max-width:340px">
        <defs>
          <radialGradient id="dialG"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e0e0e0"/></radialGradient>
        </defs>
        <!-- 旋鈕底座 -->
        <circle cx="200" cy="120" r="80" fill="#1a1a1a"/>
        <circle cx="200" cy="120" r="72" fill="url(#dialG)" stroke="#222" stroke-width="2"/>
        <!-- 刻度 -->
        <g stroke="#444" stroke-width="2">
          <line x1="200" y1="50" x2="200" y2="58"/>
          <line x1="200" y1="182" x2="200" y2="190"/>
          <line x1="130" y1="120" x2="138" y2="120"/>
          <line x1="262" y1="120" x2="270" y2="120"/>
        </g>
        <g stroke="#888" stroke-width="1">
          <line x1="153" y1="73" x2="158" y2="78"/>
          <line x1="247" y1="73" x2="242" y2="78"/>
          <line x1="153" y1="167" x2="158" y2="162"/>
          <line x1="247" y1="167" x2="242" y2="162"/>
        </g>
        <!-- 標籤 -->
        <text x="115" y="125" font-size="12" fill="#666" font-family="Inter">慢</text>
        <text x="276" y="125" font-size="12" fill="#666" font-family="Inter">快</text>
        <text x="195" y="48" font-size="11" fill="#666" font-family="Inter">800 SPM</text>
        <!-- 指針（中速擺動）-->
        <g>
          <line x1="200" y1="120" x2="200" y2="65" stroke="#FF7A00" stroke-width="5" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" values="-25 200 120;25 200 120;-25 200 120" dur="3s" repeatCount="indefinite"/>
          </line>
          <circle cx="200" cy="120" r="10" fill="#FF7A00" stroke="#1a1a1a" stroke-width="2"/>
          <circle cx="200" cy="120" r="3" fill="#fff"/>
        </g>
        <!-- 數位顯示 -->
        <rect x="140" y="200" width="120" height="30" rx="4" fill="#0a2a0a"/>
        <text x="200" y="221" text-anchor="middle" fill="#3aff6a" font-size="18" font-family="monospace" font-weight="700">800 SPM</text>
      </svg>`,

    holddown: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <!-- 工作台 -->
        <rect x="50" y="180" width="300" height="40" rx="3" fill="#cfcfcf"/>
        <rect x="50" y="178" width="300" height="6" fill="#a0a0a0"/>
        <!-- 木板 -->
        <rect x="100" y="155" width="200" height="25" fill="#d4a574"/>
        <path d="M100 162 Q200 160 300 165" fill="none" stroke="rgba(80,40,10,.2)"/>
        <!-- 機身懸臂 -->
        <rect x="170" y="20" width="60" height="30" fill="#FF7A00"/>
        <!-- 壓料桿 -->
        <g>
          <rect x="160" y="50" width="80" height="6" fill="#888" rx="2">
            <animate attributeName="y" values="50;58;58;58;50" dur="3s" repeatCount="indefinite"/>
          </rect>
          <rect x="195" y="56" width="6" height="40" fill="#888">
            <animate attributeName="y" values="56;64;64;64;56" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="height" values="40;90;90;90;40" dur="3s" repeatCount="indefinite"/>
          </rect>
          <rect x="180" y="146" width="36" height="10" rx="3" fill="#666">
            <animate attributeName="y" values="146;150;150;150;146" dur="3s" repeatCount="indefinite"/>
          </rect>
          <rect x="184" y="152" width="28" height="3" rx="1" fill="#444">
            <animate attributeName="y" values="152;156;156;156;152" dur="3s" repeatCount="indefinite"/>
          </rect>
        </g>
        <!-- 標示箭頭 -->
        <g>
          <line x1="240" y1="160" x2="320" y2="120" stroke="#2EBD66" stroke-width="2" stroke-dasharray="4 3"/>
          <polygon points="240,160 247,156 247,164" fill="#2EBD66"/>
          <text x="325" y="118" font-family="Noto Sans TC,sans-serif" font-size="13" fill="#2EBD66" font-weight="700">輕貼</text>
          <text x="325" y="132" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#2EBD66">不過度施力</text>
        </g>
      </svg>`,

    align: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <!-- 工作台 -->
        <rect x="20" y="180" width="360" height="40" rx="3" fill="#cfcfcf"/>
        <!-- 木板 -->
        <rect x="80" y="100" width="240" height="80" fill="#d4a574"/>
        <path d="M80 130 Q200 125 320 135" fill="none" stroke="rgba(80,40,10,.2)"/>
        <path d="M80 155 Q200 150 320 158" fill="none" stroke="rgba(80,40,10,.15)"/>
        <!-- 鉛筆畫的切割線 -->
        <line x1="100" y1="100" x2="100" y2="180" stroke="#222" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="80" y="92" font-family="Noto Sans TC,sans-serif" font-size="12" fill="#555">切割線</text>
        <!-- 鋸條 -->
        <rect x="103" y="80" width="6" height="120" fill="#1a1a1a"/>
        <line x1="106" y1="80" x2="106" y2="200" stroke="#fff" stroke-width=".5" stroke-dasharray="2 2"/>
        <!-- 對準動畫光環 -->
        <circle cx="106" cy="140" r="10" fill="none" stroke="#FF7A00" stroke-width="2">
          <animate attributeName="r" values="6;20;6" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="106" cy="140" r="4" fill="#FF7A00"/>
        <!-- 1mm 標示 -->
        <line x1="103" y1="220" x2="100" y2="220" stroke="#E14A4A" stroke-width="2"/>
        <text x="115" y="234" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#E14A4A" font-weight="700">外側保留 1mm（修整空間）</text>
      </svg>`,

    hands: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <!-- 工作台 -->
        <rect x="20" y="180" width="360" height="40" rx="3" fill="#cfcfcf"/>
        <!-- 木板 -->
        <rect x="60" y="100" width="280" height="80" fill="#d4a574"/>
        <path d="M60 130 Q200 125 340 135" fill="none" stroke="rgba(80,40,10,.2)"/>
        <!-- 鋸條 -->
        <rect x="197" y="60" width="6" height="140" fill="#1a1a1a"/>
        <!-- 左手（簡化握持示意）-->
        <g transform="translate(70,130)">
          <ellipse cx="20" cy="0" rx="22" ry="14" fill="#FFE0C0"/>
          <rect x="-2" y="-10" width="6" height="14" rx="2" fill="#FFE0C0"/>
          <rect x="6" y="-12" width="5" height="16" rx="2" fill="#F5C49A"/>
          <rect x="13" y="-13" width="5" height="17" rx="2" fill="#F5C49A"/>
          <rect x="20" y="-12" width="5" height="16" rx="2" fill="#F5C49A"/>
          <rect x="27" y="-10" width="5" height="14" rx="2" fill="#F5C49A"/>
        </g>
        <!-- 右手 -->
        <g transform="translate(308,130) scale(-1,1)">
          <ellipse cx="20" cy="0" rx="22" ry="14" fill="#FFE0C0"/>
          <rect x="-2" y="-10" width="6" height="14" rx="2" fill="#FFE0C0"/>
          <rect x="6" y="-12" width="5" height="16" rx="2" fill="#F5C49A"/>
          <rect x="13" y="-13" width="5" height="17" rx="2" fill="#F5C49A"/>
          <rect x="20" y="-12" width="5" height="16" rx="2" fill="#F5C49A"/>
          <rect x="27" y="-10" width="5" height="14" rx="2" fill="#F5C49A"/>
        </g>
        <!-- 安全三角區 -->
        <polygon points="200,80 110,180 290,180" fill="rgba(46,189,102,.15)" stroke="#2EBD66" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="200" y="170" text-anchor="middle" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#1b6e3a" font-weight="700">安全三角區</text>
        <!-- 距離標示 -->
        <line x1="115" y1="235" x2="195" y2="235" stroke="#444" stroke-width="1"/>
        <text x="155" y="232" text-anchor="middle" font-family="Noto Sans TC,sans-serif" font-size="10" fill="#444">≥ 5cm</text>
      </svg>`,

    feed: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <!-- 工作台 -->
        <rect x="20" y="160" width="360" height="40" rx="3" fill="#cfcfcf"/>
        <!-- 鋸條（震動）-->
        <rect x="197" y="40" width="6" height="160" fill="#1a1a1a">
          <animate attributeName="y" values="40;42;40" dur="0.2s" repeatCount="indefinite"/>
        </rect>
        <!-- 木板（移動中）-->
        <g>
          <rect width="120" height="60" fill="#d4a574">
            <animate attributeName="x" values="60;220;60" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="y" values="100;100;100" dur="4s" repeatCount="indefinite"/>
          </rect>
          <!-- 木屑（飛散）-->
          <g>
            <circle cx="200" cy="160" r="2" fill="#FFB066">
              <animate attributeName="cy" values="160;180;160" dur="0.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0;1" dur="0.4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="195" cy="165" r="1.5" fill="#D85F00">
              <animate attributeName="cy" values="165;185;165" dur="0.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite"/>
            </circle>
          </g>
        </g>
        <!-- 切割軌跡 -->
        <line x1="60" y1="130" x2="200" y2="130" stroke="#222" stroke-width="2" stroke-dasharray="3 2"/>
        <!-- 速度提示 -->
        <text x="200" y="225" text-anchor="middle" font-family="Noto Sans TC,sans-serif" font-size="12" fill="#444">每往復 5–10 次推進 1 公分（讓鋸條自己切）</text>
        <!-- 速度標 -->
        <g transform="translate(310,30)">
          <rect x="0" y="0" width="80" height="22" rx="4" fill="#2EBD66"/>
          <text x="40" y="15" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">理想速度</text>
        </g>
      </svg>`,

    pierce: `
      <svg viewBox="0 0 400 240" style="width:90%;max-width:380px">
        <!-- 工作台 -->
        <rect x="20" y="195" width="360" height="30" rx="3" fill="#cfcfcf"/>
        <!-- 木板 -->
        <rect x="70" y="75" width="260" height="120" fill="#d4a574"/>
        <path d="M70 115 Q200 110 330 120" fill="none" stroke="rgba(80,40,10,.2)"/>
        <path d="M70 155 Q200 150 330 158" fill="none" stroke="rgba(80,40,10,.15)"/>
        <!-- 內輪廓切割線（要挖除的區域）-->
        <rect x="145" y="100" width="115" height="70" fill="none" stroke="#222" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="265" y="94" text-anchor="end" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#555">內輪廓切割線</text>
        <!-- 導孔 -->
        <circle cx="170" cy="135" r="7" fill="#3a2410"/>
        <circle cx="170" cy="135" r="7" fill="none" stroke="#FF7A00" stroke-width="2">
          <animate attributeName="r" values="7;16;7" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <!-- 鋸條穿過導孔 -->
        <rect x="167" y="46" width="6" height="149" fill="#1a1a1a"/>
        <!-- 上夾頭（先鬆開）-->
        <rect x="150" y="28" width="40" height="16" rx="2" fill="#1a1a1a"/>
        <text x="196" y="41" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#444">上夾頭：先鬆開再穿鋸條</text>
        <!-- 導孔標示 -->
        <line x1="166" y1="142" x2="112" y2="212" stroke="#E14A4A" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="20" y="228" font-family="Noto Sans TC,sans-serif" font-size="11" fill="#E14A4A" font-weight="700">導孔 ≥ 6mm（鑽在廢料區內）</text>
        <!-- 關機徽章 -->
        <rect x="292" y="16" width="92" height="26" rx="6" fill="#E14A4A"/>
        <text x="338" y="34" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="Noto Sans TC,sans-serif">穿鋸條＝關機</text>
      </svg>`,

    shutdown: `
      <svg viewBox="0 0 400 240" style="width:80%;max-width:340px">
        <!-- 開關面板 -->
        <rect x="100" y="40" width="200" height="160" rx="10" fill="#2a2a2a"/>
        <rect x="115" y="55" width="170" height="130" rx="6" fill="#1a1a1a"/>
        <!-- ON/OFF 開關 -->
        <g>
          <rect x="135" y="80" width="60" height="50" rx="6" fill="#2EBD66" opacity="1">
            <animate attributeName="opacity" values="1;.4;.4;.4" dur="3s" repeatCount="indefinite"/>
          </rect>
          <text x="165" y="112" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">ON</text>
        </g>
        <g>
          <rect x="205" y="80" width="60" height="50" rx="6" fill="#5a1a1a">
            <animate attributeName="fill" values="#5a1a1a;#E14A4A;#E14A4A;#5a1a1a" dur="3s" repeatCount="indefinite"/>
          </rect>
          <text x="235" y="112" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">OFF</text>
        </g>
        <!-- 提示文字 -->
        <text x="200" y="155" text-anchor="middle" fill="#3aff6a" font-size="12" font-family="monospace">> 關電源</text>
        <text x="200" y="172" text-anchor="middle" fill="#3aff6a" font-size="12" font-family="monospace">> 等鋸條停止</text>
        <text x="200" y="189" text-anchor="middle" fill="#3aff6a" font-size="12" font-family="monospace">> 清理工作台</text>
        <!-- 手指動畫（按 OFF）-->
        <text x="245" y="145" font-size="28">
          👆
          <animate attributeName="x" values="245;235;245" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="y" values="145;115;145" dur="3s" repeatCount="indefinite"/>
        </text>
      </svg>`,
  };
  return anims[type] || '';
}

// 預設選第一步
selectStep(0);
window.selectStep = selectStep;
window.markDone = markDone;

// === 步驟排序拼圖 ===
if (typeof Interactions !== 'undefined') {
  Interactions.SequencePuzzle({
    container: '#seq-puzzle',
    items: STEPS.map(s => s.title),
    title: '把打亂的步驟排回正確順序',
    onComplete: () => {
      try {
        const k = 'scrollsaw_progress_v1';
        const p = JSON.parse(localStorage.getItem(k)) || {};
        p.module3_puzzle = true;
        localStorage.setItem(k, JSON.stringify(p));
      } catch (e) {}
      if (typeof showToast === 'function') showToast('🏆 排序測驗通過！', 'good');
    }
  });
}
