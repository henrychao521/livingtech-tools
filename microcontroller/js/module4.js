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

const CODES = {
  blink: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`,
  button: `void setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  if (digitalRead(2) == LOW)\n    digitalWrite(13, HIGH);\n  else\n    digitalWrite(13, LOW);\n}`,
  distance: `void loop() {\n  long d = getDistance();\n  if (d < 20) {\n    motorBack();\n    turnLeft();\n  } else {\n    moveForward();\n  }\n}`,
};

function setMode(m) {
  mode = m;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.s === m));
  $('code').textContent = CODES[m];
  t = 0;
  ledOn = false;
  buttonPressed = false;
  distance = 50;
  $('btn-toggle').textContent = m === 'blink' ? '⏸ LED 自動閃爍中' : m === 'button' ? '🔘 按按鈕' : '📏 改變距離';
  const p = loadP(); p.module4 = true; saveP(p);
}

document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setMode(b.dataset.s)));
$('btn-toggle').addEventListener('click', () => {
  if (mode === 'button') {
    buttonPressed = !buttonPressed;
    $('btn-toggle').textContent = buttonPressed ? '🔘 按住中' : '🔘 按按鈕';
  } else if (mode === 'distance') {
    distance = distance < 100 ? distance + 30 : 10;
    $('btn-toggle').textContent = `📏 距離 ${distance} cm`;
  }
});

function draw() {
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
    active = distance < 20;
  }

  ctx.strokeStyle = active ? '#fbbf24' : '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(270, 240);
  ctx.lineTo(500, 240);
  ctx.stroke();

  // 右側元件
  if (mode === 'blink' || mode === 'button') {
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
    ctx.fillText('LED', 600, 290);
    if (mode === 'button') {
      // 按鈕
      ctx.fillStyle = buttonPressed ? '#dc2626' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(600, 380, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 12px Inter';
      ctx.fillText('Button', 600, 420);
      // 連線
      ctx.strokeStyle = buttonPressed ? '#fbbf24' : '#475569';
      ctx.beginPath();
      ctx.moveTo(575, 380);
      ctx.lineTo(270, 380);
      ctx.lineTo(270, 350);
      ctx.stroke();
    }
  } else if (mode === 'distance') {
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
    ctx.fillText('HC-SR04', 535, 280);
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
    ctx.fillText(distance + ' cm', (570 + obsX) / 2, 170);
  }

  // 訊號流動小點
  if (active) {
    const x = 270 + ((t * 4) % 230);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, 240, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 狀態文字
  let status = '';
  if (mode === 'blink') status = `LED 13: ${ledOn ? 'HIGH (亮)' : 'LOW (滅)'} ・ 自動每 500ms 切換`;
  else if (mode === 'button') status = `Button (pin 2): ${buttonPressed ? 'LOW' : 'HIGH'}  →  LED 13: ${ledOn ? 'HIGH' : 'LOW'}`;
  else if (mode === 'distance') status = `Distance: ${distance} cm  →  ${active ? '⚠ 太近 → moveBack() + turnLeft()' : '✓ 安全 → moveForward()'}`;
  $('status').textContent = status;

  requestAnimationFrame(draw);
}

setMode('blink');
draw();
