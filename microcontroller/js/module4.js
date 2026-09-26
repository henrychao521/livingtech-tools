// 微控制器 模組 4：虛擬電路模擬器
const PK = 'mc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const cv = document.getElementById('mc-canvas');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const $ = id => document.getElementById(id);

let mode = 'blink';
let t = 0;
let ledOn = false;
let buttonPressed = false;
let distance = 50;
const TOO_CLOSE = 10;                 // 避障閾值（cm），與模組 3 範例 8 相同
const DIST_STEPS = [50, 30, 15, 5, 80]; // 按「改變距離」依序切換，含小於閾值的 5 cm

const CODES = {
  blink: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`,
  button: `void setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  if (digitalRead(2) == LOW)\n    digitalWrite(13, HIGH);\n  else\n    digitalWrite(13, LOW);\n}`,
  // 與模組 3 範例 8 完全相同（閾值、函式名、delay）
  distance: `void loop() {\n  long d = getDistance();\n  if (d < ${TOO_CLOSE}) {        // 太近\n    moveBack();\n    delay(500);\n    turnLeft();\n    delay(500);\n  } else {\n    moveForward();\n  }\n}`,
};

function setMode(m) {
  mode = m;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.s === m));
  $('code').textContent = CODES[m];
  t = 0;
  ledOn = false;
  buttonPressed = false;
  distance = 50;
  $('btn-toggle').textContent = m === 'blink' ? '自動閃爍中（不需操作）' : m === 'button' ? '🔘 按按鈕' : '📏 改變距離';
  $('btn-toggle').disabled = m === 'blink';   // 閃爍情境不需要外部輸入，按鈕停用避免誤以為能暫停
  // 三個情境都切換過才記為完成（載入時的 blink 算一個）
  visited.add(m);
  if (visited.size === Object.keys(CODES).length) {
    const p = loadP();
    if (!p.module4) { p.module4 = true; saveP(p); showToast('🎉 3 個情境都操作過了！', 'good'); }
  }
}
const visited = new Set();

document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setMode(b.dataset.s)));
$('btn-toggle').addEventListener('click', () => {
  if (mode === 'button') {
    buttonPressed = !buttonPressed;
    $('btn-toggle').textContent = buttonPressed ? '🔘 按住中' : '🔘 按按鈕';
  } else if (mode === 'distance') {
    distance = DIST_STEPS[(DIST_STEPS.indexOf(distance) + 1) % DIST_STEPS.length];
    $('btn-toggle').textContent = `📏 距離 ${distance} cm`;
  }
});

function draw() {
  if (document.hidden) { window.__rafPaused = true; return; }
  t++;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);

  // Arduino 板（左側）
  ctx.fillStyle = '#16A34A';
  ctx.fillRect(50, 100, 220, 280);
  ctx.fillStyle = '#fff';
  ctx.font = '700 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('ARDUINO UNO', 160, 130);
  // 處理器
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(120, 170, 80, 60);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 11px Inter';
  ctx.fillText('ATmega328P', 160, 200);
  // 引腳
  ctx.fillStyle = '#94a3b8';
  for (let i = 0; i < 6; i++) ctx.fillRect(55 + i * 30, 360, 12, 14);

  // 訊號流動（左到右）
  let active = false;
  if (mode === 'blink') {
    const phase = Math.floor(t / 30) % 2;
    ledOn = phase === 0;
    active = ledOn;
  } else if (mode === 'button') {
    ledOn = buttonPressed;
    active = ledOn;
  } else if (mode === 'distance') {
    active = distance < TOO_CLOSE;
  }

  // 右側元件
  if (mode === 'blink' || mode === 'button') {
    // 輸出：Arduino 腳 13 → 220Ω 限流電阻 → LED → 接回 GND
    ctx.strokeStyle = active ? '#fbbf24' : '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(270, 240);
    ctx.lineTo(400, 240);
    ctx.moveTo(460, 240);
    ctx.lineTo(570, 240);
    ctx.stroke();
    // 電阻（鋸齒）
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 240);
    for (let k = 0; k < 6; k++) ctx.lineTo(405 + k * 10, k % 2 ? 250 : 230);
    ctx.lineTo(460, 240);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '700 12px Inter';
    ctx.fillText('220Ω 限流電阻', 430, 222);
    // LED
    ctx.fillStyle = ledOn ? '#fbbf24' : '#475569';
    ctx.beginPath();
    ctx.arc(600, 240, 30, 0, Math.PI * 2);
    ctx.fill();
    if (ledOn) {
      ctx.fillStyle = 'rgba(251,191,36,.3)';
      ctx.beginPath();
      ctx.arc(600, 240, 50, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.font = '700 14px Inter';
    ctx.fillText('LED', 600, 300);
    // 回路：LED → GND（Arduino 下緣的 GND 腳）
    ctx.strokeStyle = active ? '#fbbf24' : '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(630, 240);
    ctx.lineTo(700, 240);
    ctx.lineTo(700, 460);
    ctx.lineTo(61, 460);
    ctx.lineTo(61, 374);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 12px Inter';
    ctx.fillText('GND', 90, 452);
    if (mode === 'button') {
      // 按鈕（輸入：按鈕 → 腳 2）
      ctx.fillStyle = buttonPressed ? '#dc2626' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(600, 380, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 12px Inter';
      ctx.fillText('Button', 600, 424);
      // 連線
      ctx.strokeStyle = buttonPressed ? '#fbbf24' : '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(575, 380);
      ctx.lineTo(270, 380);
      ctx.lineTo(270, 350);
      ctx.stroke();
    }
  } else if (mode === 'distance') {
    // 輸入：HC-SR04 → Arduino（訊號線一直有資料流入）
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(500, 240);
    ctx.lineTo(270, 240);
    ctx.stroke();
    // 超音波 + 障礙物
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(500, 220, 70, 40);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(515, 240, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(555, 240, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 11px Inter';
    ctx.fillText('HC-SR04（輸入）', 535, 278);
    // 障礙物（隨距離移動）
    const obsX = 500 + 70 + distance * 1.8;
    ctx.fillStyle = active ? '#dc2626' : '#a16207';
    ctx.fillRect(obsX, 200, 30, 80);
    // 距離標示
    ctx.strokeStyle = active ? '#dc2626' : '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(570, 180);
    ctx.lineTo(obsX, 180);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = active ? '#dc2626' : '#3B82F6';
    ctx.font = '800 16px Inter';
    ctx.fillText(distance + ' cm', Math.max(600, (570 + obsX) / 2), 170);
    // 輸出：Arduino → 兩顆馬達／車輪
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(270, 340);
    ctx.lineTo(394, 340);
    ctx.moveTo(446, 340);
    ctx.lineTo(494, 340);
    ctx.stroke();
    const spin = (active ? -1 : 1) * t * 0.08; // 太近時反轉（後退）
    [420, 520].forEach((wx, k) => {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(wx, 340, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = active ? '#dc2626' : '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wx, 340, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx, 340);
      ctx.lineTo(wx + 22 * Math.cos(spin), 340 + 22 * Math.sin(spin));
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '700 11px Inter';
      ctx.fillText(k === 0 ? '左馬達' : '右馬達', wx, 384);
    });
    ctx.fillStyle = active ? '#dc2626' : '#22c55e';
    ctx.font = '800 13px Inter';
    ctx.fillText(active ? '↺ 後退＋左轉' : '↻ 前進', 470, 410);
  }

  // 訊號流動小點
  if (mode === 'distance') {
    // 感測器 → Arduino（右到左）、Arduino → 馬達（左到右）
    const x1 = 500 - ((t * 4) % 230);
    const x2 = 270 + ((t * 3) % 224);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x1, 240, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, 340, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (active) {
    const x = 270 + ((t * 4) % 300);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, 240, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 狀態文字
  let status = '';
  if (mode === 'blink') status = `LED 13: ${ledOn ? 'HIGH (亮)' : 'LOW (滅)'} ・ 自動每 500ms 切換`;
  else if (mode === 'button') status = `Button (pin 2): ${buttonPressed ? 'LOW' : 'HIGH'}  →  LED 13: ${ledOn ? 'HIGH' : 'LOW'}`;
  else if (mode === 'distance') status = `Distance: ${distance} cm  →  ${active ? `⚠ 太近（< ${TOO_CLOSE} cm）→ moveBack() + turnLeft()` : '✓ 安全 → moveForward()'}`;
  $('status').textContent = status;

  requestAnimationFrame(draw);
}

setMode('blink');
draw();
// 分頁切到背景時 rAF 自動停止，切回來再續跑（省電，教室平板友善）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.__rafPaused) { window.__rafPaused = false; draw(); }
});