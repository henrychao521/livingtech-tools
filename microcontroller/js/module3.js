// 微控制器 模組 3：8 個範例程式
const EXAMPLES = [
  { title: 'LED 閃爍 Blink', concept: 'digitalWrite + delay',
    code: `<span class="kw">void</span> <span class="fn">setup</span>() {
  <span class="fn">pinMode</span>(<span class="num">13</span>, <span class="kw">OUTPUT</span>);
}
<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="fn">digitalWrite</span>(<span class="num">13</span>, <span class="kw">HIGH</span>); <span class="com">// 亮</span>
  <span class="fn">delay</span>(<span class="num">500</span>);
  <span class="fn">digitalWrite</span>(<span class="num">13</span>, <span class="kw">LOW</span>);  <span class="com">// 滅</span>
  <span class="fn">delay</span>(<span class="num">500</span>);
}`, desc: '入門必跑程式。13 號腳的 LED 每 0.5 秒切換一次。' },
  { title: '按鈕控制 LED', concept: 'digitalRead + if',
    code: `<span class="kw">void</span> <span class="fn">setup</span>() {
  <span class="fn">pinMode</span>(<span class="num">2</span>, <span class="kw">INPUT_PULLUP</span>); <span class="com">// 按鈕</span>
  <span class="fn">pinMode</span>(<span class="num">13</span>, <span class="kw">OUTPUT</span>);
}
<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="kw">if</span> (<span class="fn">digitalRead</span>(<span class="num">2</span>) == <span class="kw">LOW</span>) {
    <span class="fn">digitalWrite</span>(<span class="num">13</span>, <span class="kw">HIGH</span>);
  } <span class="kw">else</span> {
    <span class="fn">digitalWrite</span>(<span class="num">13</span>, <span class="kw">LOW</span>);
  }
}`, desc: '按按鈕亮燈、放開滅燈。INPUT_PULLUP 啟用內部上拉電阻避免雜訊。' },
  { title: '光敏自動夜燈', concept: 'analogRead + 閾值判斷',
    code: `<span class="kw">int</span> threshold = <span class="num">300</span>;
<span class="kw">void</span> <span class="fn">setup</span>() { <span class="fn">pinMode</span>(<span class="num">13</span>, <span class="kw">OUTPUT</span>); }
<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="kw">int</span> lightVal = <span class="fn">analogRead</span>(<span class="kw">A0</span>);
  <span class="kw">if</span> (lightVal &lt; threshold) {  <span class="com">// 暗</span>
    <span class="fn">digitalWrite</span>(<span class="num">13</span>, <span class="kw">HIGH</span>);
  } <span class="kw">else</span> {
    <span class="fn">digitalWrite</span>(<span class="num">13</span>, <span class="kw">LOW</span>);
  }
}`, desc: 'A0 接光敏電阻 + 10kΩ。光線變暗時自動亮燈。閾值可校正。' },
  { title: 'PWM 呼吸燈', concept: 'analogWrite + for 迴圈',
    code: `<span class="kw">void</span> <span class="fn">setup</span>() { <span class="fn">pinMode</span>(<span class="num">9</span>, <span class="kw">OUTPUT</span>); }
<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="kw">for</span> (<span class="kw">int</span> i=<span class="num">0</span>; i&lt;<span class="num">255</span>; i++) {
    <span class="fn">analogWrite</span>(<span class="num">9</span>, i); <span class="fn">delay</span>(<span class="num">8</span>);
  }
  <span class="kw">for</span> (<span class="kw">int</span> i=<span class="num">255</span>; i&gt;<span class="num">0</span>; i--) {
    <span class="fn">analogWrite</span>(<span class="num">9</span>, i); <span class="fn">delay</span>(<span class="num">8</span>);
  }
}`, desc: 'LED 亮度逐漸升降形成呼吸感。PWM 接 9 號腳（支援 PWM 的腳位才能用）。' },
  { title: '超音波測距避障', concept: 'pulseIn + 距離公式',
    code: `<span class="kw">long</span> <span class="fn">getDistance</span>() {
  <span class="fn">digitalWrite</span>(<span class="num">7</span>, <span class="kw">HIGH</span>); <span class="fn">delayMicroseconds</span>(<span class="num">10</span>);
  <span class="fn">digitalWrite</span>(<span class="num">7</span>, <span class="kw">LOW</span>);
  <span class="kw">long</span> t = <span class="fn">pulseIn</span>(<span class="num">8</span>, <span class="kw">HIGH</span>);
  <span class="kw">return</span> t * <span class="num">0.034</span> / <span class="num">2</span>; <span class="com">// cm</span>
}`, desc: '7 號 Trigger 發射、8 號 Echo 接收。聲速 340 m/s，除 2 是因為來回兩次。' },
  { title: 'Serial Monitor 印值', concept: 'Serial.print 除錯',
    code: `<span class="kw">void</span> <span class="fn">setup</span>() {
  <span class="fn">Serial.begin</span>(<span class="num">9600</span>);
}
<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="kw">int</span> v = <span class="fn">analogRead</span>(<span class="kw">A0</span>);
  <span class="fn">Serial.print</span>(<span class="str">"value="</span>);
  <span class="fn">Serial.println</span>(v);
  <span class="fn">delay</span>(<span class="num">500</span>);
}`, desc: 'Arduino IDE 工具→序列監控視窗看數值。除錯神器。' },
  { title: '伺服馬達控制', concept: 'Servo library',
    code: `<span class="com">#include &lt;Servo.h&gt;</span>
<span class="kw">Servo</span> myservo;
<span class="kw">void</span> <span class="fn">setup</span>() {
  myservo.<span class="fn">attach</span>(<span class="num">9</span>);
}
<span class="kw">void</span> <span class="fn">loop</span>() {
  myservo.<span class="fn">write</span>(<span class="num">0</span>); <span class="fn">delay</span>(<span class="num">1000</span>);
  myservo.<span class="fn">write</span>(<span class="num">90</span>); <span class="fn">delay</span>(<span class="num">1000</span>);
  myservo.<span class="fn">write</span>(<span class="num">180</span>); <span class="fn">delay</span>(<span class="num">1000</span>);
}`, desc: '伺服馬達轉動到 0° / 90° / 180°。需要 #include &lt;Servo.h&gt; 函式庫。' },
  { title: '組合：自動清掃機器人邏輯', concept: '感測 + 邏輯 + 馬達',
    code: `<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="kw">long</span> d = <span class="fn">getDistance</span>();
  <span class="kw">if</span> (d &lt; <span class="num">10</span>) {        <span class="com">// 太近</span>
    <span class="fn">moveBack</span>();
    <span class="fn">delay</span>(<span class="num">500</span>);
    <span class="fn">turnLeft</span>();
    <span class="fn">delay</span>(<span class="num">500</span>);
  } <span class="kw">else</span> {
    <span class="fn">moveForward</span>();
  }
}`, desc: '簡化版避障邏輯——對應 3 下統整專題「創意清掃機器人」核心程式架構。' },
];

const PK = 'mc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }
const seen = new Set((loadP().module3_seen) || []);
const exEl = document.getElementById('examples');
const progEl = document.getElementById('prog');
const nextBtn = document.getElementById('next-btn');
EXAMPLES.forEach((e, i) => {
  const div = document.createElement('details');
  div.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;border-left:5px solid #6366F1;${seen.has(i) ? 'background:#E0E7FF' : ''}`;
  div.innerHTML = `<summary style="cursor:pointer;font-weight:700;color:#4338CA"><span style="color:#666">範例 ${i + 1}：</span>${e.title} <span style="font-size:12px;color:#666">(${e.concept})</span></summary>
    <div class="code-block">${e.code}</div>
    <p style="font-size:13px;color:#444">${e.desc}</p>`;
  div.addEventListener('toggle', () => {
    if (div.open && !seen.has(i)) {
      seen.add(i); div.style.background = '#E0E7FF';
      progEl.textContent = `已看 ${seen.size} / 8 個範例`;
      const p = loadP(); p.module3_seen = Array.from(seen);
      if (seen.size === 8) { p.module3 = true; nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; if (typeof SoundFX !== 'undefined') SoundFX.unlock(); showToast('🎉 8 個範例都看完！', 'good'); }
      saveP(p);
    }
  });
  exEl.appendChild(div);
});
progEl.textContent = `已看 ${seen.size} / 8 個範例`;
if (seen.size === 8) { nextBtn.style.opacity = 1; nextBtn.style.pointerEvents = 'auto'; }
