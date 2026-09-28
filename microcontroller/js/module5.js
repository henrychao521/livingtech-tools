// 微控制器 模組 5：創意作品案例
const HANLIN = [
  {
    name: '創意公仔燈', icon: '💡',
    course: '3 下 K4 闖關任務',
    desc: '用 Arduino + LED + 光敏 + 觸控感測器做出會「感應使用者互動」的桌燈。',
    components: ['Arduino UNO', 'WS2812 RGB LED 條 1m', '光敏電阻', '觸控感測 TTP223', '5V 2A 以上行動電源（USB，同時供 Arduino 與燈條）'],
    note: '⚡ 供電：1m WS2812 約 60 顆，全白全亮每顆最多約 60mA，合計可達 3.6A，<strong>不能從 Arduino 的 5V 腳取電</strong>。燈條電源線直接接行動電源（或另一組 5V 電源）、GND 與 Arduino 共地，程式用 FastLED 的 setBrightness() 把亮度壓低，讓總電流不超過電源額定。不要用 4 顆 AA（約 6V）：接 VIN 低於建議的 7V，直接接燈條又超過 5V。',
    code: '使用 FastLED 函式庫控制 RGB LED 序列。觸控時切換顏色模式、光線變暗自動亮起。',
    extension: '進階：加藍牙模組讓手機控制顏色、加 MP3 模組讓燈光配音樂節奏。',
  },
  {
    name: '創意清掃機器人', icon: '🤖',
    course: '3 下 統整專題',
    desc: '結合所有電子知識：感測、馬達驅動、結構、能源管理。是整個國中生活科技課程的「最終 boss」。',
    components: ['Arduino UNO + L298N 馬達驅動板', '兩個 TT 馬達 + 輪子', '超音波 HC-SR04', '萬向輪 1 個', '2S 18650 電池組（7.4V，須含保護板，用專用充電器）', '車身（壓克力或 3D 列印）'],
    code: 'getDistance() + 邏輯避障 + 馬達 PWM 速度控制。可加紅外線循跡感測做沿線清掃。',
    extension: '進階：加 ESP32 + 手機 App 遙控；在車頭加碰撞開關（微動開關）做邊緣偵測，撞到牆就後退轉向；在車底加紅外線感測器偵測桌緣或樓梯，避免跌落；加 6 軸感測器（加速度計＋陀螺儀，如 MPU-6050）量轉了幾度，讓車子轉彎、走直線更準。',
    note: '🔋 鋰電池安全：只用有保護板的電池組與專用充電器；接線前先確認正負極，避免短路；電池鼓脹、摔過或外皮破損就停用；充電時要有人在場、放在不可燃的桌面上，不要整夜充電。',
  },
];

const EXT = [
  { name: '智慧澆花系統', icon: '🪴', desc: '土壤濕度感測 + 水泵 + DHT11 溫濕度。可設定每日定時澆水 + LINE 通知。' },
  { name: '寵物自動餵食器', icon: '🐕', desc: 'RTC 即時時鐘 + 伺服馬達 + LED 矩陣顯示。每天定時打開飼料閘門。' },
  { name: '手勢控制 LED 燈', icon: '✋', desc: '紅外線感測 + RGB LED。揮手切換顏色、揮兩下開關。' },
  { name: '空汙偵測站', icon: '😷', desc: 'ESP32 + PMS5003 PM2.5 感測器 + OLED 顯示 + 上傳 Thingspeak 雲端記錄。' },
  { name: '密碼鎖', icon: '🔒', desc: '矩陣鍵盤 + LCD + 伺服馬達。輸入正確密碼開鎖、錯三次警報。' },
  { name: '節能感應燈', icon: '💡', desc: 'PIR 人體感測 + LED + 光敏電阻。白天不亮、晚上有人才亮、無人 10 秒後自動熄。' },
];

const PK = 'mc_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

const hl = document.getElementById('hl');
HANLIN.forEach(p => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;border-left:5px solid #6366F1';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><span style="font-size:36px">${p.icon}</span><div><h4 style="margin:0;color:#4338CA">${p.name}</h4><span style="font-size:11px;color:#666">${p.course}</span></div></div>
    <p style="font-size:13px;color:#444">${p.desc}</p>
    <p style="font-size:12.5px;color:#666;margin:8px 0"><strong>料件：</strong>${p.components.join('、')}</p>
    <p style="font-size:12.5px;color:#666"><strong>程式重點：</strong>${p.code}</p>
    ${p.note ? `<p style="font-size:12.5px;color:#92400E;background:#FEF3C7;padding:8px;border-radius:6px;margin-top:8px">${p.note}</p>` : ''}
    <p style="font-size:12.5px;color:#16A34A;background:#DCFCE7;padding:8px;border-radius:6px;margin-top:8px"><strong>進階延伸：</strong>${p.extension}</p>`;
  hl.appendChild(c);
});

const ext = document.getElementById('ext');
EXT.forEach(e => {
  const c = document.createElement('div');
  c.style.cssText = 'background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px;border-left:4px solid #6366F1';
  c.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:26px">${e.icon}</span><strong style="color:#4338CA;font-size:14px">${e.name}</strong></div>
    <p style="font-size:12.5px;color:#444">${e.desc}</p>`;
  ext.appendChild(c);
});

const p = loadP(); p.module5 = true; saveP(p);
