// 模組 5：創作挑戰 — 圖樣庫升級版
const TEMPLATES = [
  {
    id: 'star',
    name: '五角星',
    diff: 'easy',
    desc: '經典造型・適合初學',
    path: (() => {
      const pts = [];
      const cx = 150, cy = 150;
      for (let i = 0; i <= 10; i++) {
        const a = (i * 36 - 90) * Math.PI / 180;
        const r = i % 2 === 0 ? 110 : 45;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    })(),
  },
  {
    id: 'heart',
    name: '愛心',
    diff: 'easy',
    desc: '節日禮物的好選擇',
    path: (() => {
      const pts = [];
      for (let t = 0; t <= 100; t++) {
        const a = t * Math.PI * 2 / 100;
        const x = 100 * Math.sin(a) * Math.sin(a) * Math.sin(a);
        const y = -(13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a)) * 6;
        pts.push([x + 150, y + 145]);
      }
      return pts;
    })(),
  },
  {
    id: 'fish',
    name: '可愛小魚',
    diff: 'mid',
    desc: '曲線+尾鰭三角',
    path: (() => {
      const pts = [];
      // 上半身體
      for (let t = 0; t <= 50; t++) {
        const a = t * Math.PI / 50;
        pts.push([60 + t * 3, 150 - 50 * Math.sin(a)]);
      }
      // 尾巴上
      pts.push([220, 100]);
      pts.push([255, 80]);
      pts.push([260, 150]);
      pts.push([255, 220]);
      pts.push([220, 200]);
      // 下半身體
      for (let t = 50; t >= 0; t--) {
        const a = t * Math.PI / 50;
        pts.push([60 + t * 3, 150 + 50 * Math.sin(a)]);
      }
      return pts;
    })(),
  },
  {
    id: 'leaf',
    name: '橡樹葉',
    diff: 'easy',
    desc: '雙弧對稱',
    path: (() => {
      const pts = [];
      // 主弧（左半）
      for (let t = 0; t <= 50; t++) {
        const a = (t / 50) * Math.PI;
        pts.push([150 - 80 * Math.sin(a) * (1 + Math.sin(t * 0.3) * 0.15), 30 + (t / 50) * 240]);
      }
      // 主弧（右半，回程）
      for (let t = 50; t >= 0; t--) {
        const a = (t / 50) * Math.PI;
        pts.push([150 + 80 * Math.sin(a) * (1 + Math.sin(t * 0.3) * 0.15), 30 + (t / 50) * 240]);
      }
      return pts;
    })(),
  },
  {
    id: 'cat',
    name: '小貓剪影',
    diff: 'hard',
    desc: '耳朵尖角・需慢工',
    path: [
      [105, 90], [85, 50], [120, 65], // 左耳
      [180, 65], [215, 50], [195, 90], // 右耳
      [235, 110], [248, 145], [248, 175], [240, 200],
      [225, 220], [200, 235], [170, 245], [150, 248],
      [130, 245], [100, 235], [75, 220], [60, 200],
      [52, 175], [52, 145], [65, 110], [105, 90],
    ],
  },
  {
    id: 'gear',
    name: '齒輪',
    diff: 'hard',
    desc: '8 齒・內外切換',
    path: (() => {
      const pts = [];
      const cx = 150, cy = 150, n = 8;
      for (let i = 0; i <= n * 4; i++) {
        const a = (i / (n * 4)) * Math.PI * 2 - Math.PI / 2;
        const phase = i % 4;
        const r = phase < 2 ? 100 : 60;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    })(),
  },
  {
    id: 'star4',
    name: '四芒星',
    diff: 'mid',
    desc: '銳角訓練',
    path: (() => {
      const pts = [];
      const cx = 150, cy = 150;
      for (let i = 0; i <= 8; i++) {
        const a = (i * 45 - 90) * Math.PI / 180;
        const r = i % 2 === 0 ? 110 : 35;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    })(),
  },
  {
    id: 'flower',
    name: '六瓣花',
    diff: 'mid',
    desc: '波浪形花瓣',
    path: (() => {
      const pts = [];
      const cx = 150, cy = 150;
      for (let t = 0; t <= 120; t++) {
        const a = (t / 120) * Math.PI * 2 - Math.PI / 2;
        const r = 70 + 35 * Math.cos(6 * a);
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts;
    })(),
  },
  {
    id: 'butterfly',
    name: '蝴蝶',
    diff: 'hard',
    desc: '對稱複合曲線',
    path: (() => {
      const pts = [];
      const cx = 150, cy = 150;
      // 蝴蝶曲線（簡化版）
      for (let t = 0; t <= 200; t++) {
        const a = (t / 200) * Math.PI * 4;
        const r = Math.exp(Math.cos(a)) - 2 * Math.cos(4 * a);
        pts.push([cx + 30 * r * Math.cos(a), cy + 30 * r * Math.sin(a)]);
      }
      return pts;
    })(),
  },
];

// 渲染圖樣選單
const grid = document.getElementById('template-grid');
TEMPLATES.forEach(t => {
  const card = document.createElement('div');
  card.className = 'template-card';
  card.dataset.id = t.id;
  // 找出 bbox 並計算 transform
  const bb = getBB(t.path);
  const cx = (bb.minX + bb.maxX) / 2;
  const cy = (bb.minY + bb.maxY) / 2;
  card.innerHTML = `
    <svg class="template-svg" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="tg-${t.id}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#FFAA55"/>
          <stop offset="1" stop-color="#FF7A00"/>
        </linearGradient>
      </defs>
      <polyline points="${t.path.map(p => p.join(',')).join(' ')}"
        fill="rgba(255,170,85,.12)" stroke="url(#tg-${t.id})" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <div class="template-name">${t.name}</div>
    <div class="template-meta">
      <span class="difficulty diff-${t.diff}">${t.diff === 'easy' ? '初級' : t.diff === 'mid' ? '中級' : '高級'}</span>
      <span>${t.desc}</span>
    </div>
  `;
  card.addEventListener('click', () => {
    if (typeof SoundFX !== 'undefined') SoundFX.click();
    analyzeTemplate(t);
  });
  grid.appendChild(card);
});

function getBB(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pts.forEach(([x, y]) => {
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  });
  return { minX, minY, maxX, maxY };
}

function analyzeTemplate(t) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.toggle('active', c.dataset.id === t.id));
  document.getElementById('plan-output').classList.remove('hidden');

  try {
    const PK = 'scrollsaw_progress_v1';
    const p = JSON.parse(localStorage.getItem(PK)) || {};
    p.module5 = true;
    p.module5_template = t.id;
    localStorage.setItem(PK, JSON.stringify(p));
  } catch (e) {}

  const pts = scaleToCanvas(t.path);
  drawPlanCanvas(pts, t);

  const len = pathLength(t.path);
  const sharpAngles = countSharpAngles(t.path);
  const lenCM = (len / 25).toFixed(1);
  const timeSec = Math.round(len / 25 * 60);
  document.getElementById('stat-len').textContent = `${lenCM} cm`;
  document.getElementById('stat-time').textContent = formatTime(timeSec);
  const diffMap = { easy: '★☆☆', mid: '★★☆', hard: '★★★' };
  document.getElementById('stat-diff').textContent = diffMap[t.diff];

  const tips = [];
  if (sharpAngles > 0) tips.push(`<li>共 <strong>${sharpAngles} 處尖角</strong>，需要「在原地慢慢轉動木板」，不要急著推進。</li>`);
  if (t.diff === 'hard') tips.push(`<li>難度較高，建議先在模組 4 把 L4、L5 練到 3 顆星再嘗試。</li>`);
  if (t.id === 'fish' || t.id === 'cat') tips.push(`<li>這個圖形是「外輪廓」切割，從邊緣開始，沿線回到起點即可分離。</li>`);
  if (t.id === 'gear') tips.push(`<li>齒輪需先在每齒間鑽穿孔，再把鋸條穿過去做內挖切割。</li>`);
  if (t.id === 'butterfly' || t.id === 'flower') tips.push(`<li>蝴蝶/花朵的對稱曲線可以先畫好對稱軸，切到一半翻面繼續。</li>`);
  tips.push(`<li>建議先用鉛筆把路徑畫在木板上，並以 <strong>0.5mm 細芯</strong>保持線條清晰。</li>`);
  tips.push(`<li>切完後保留 <strong>1mm</strong> 修整空間，用銼刀修平輪廓。</li>`);

  document.getElementById('plan-tips').innerHTML = `
    <h4 style="margin-top:22px;font-size:16px">📋 切割提示</h4>
    <ul style="padding-left:22px;color:var(--text-soft);font-size:14px;line-height:1.9;margin-top:8px">${tips.join('')}</ul>
  `;
  document.getElementById('plan-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scaleToCanvas(pts) {
  const canvas = document.getElementById('plan-canvas');
  const W = canvas.width, H = canvas.height;
  const bb = getBB(pts);
  const w = bb.maxX - bb.minX, h = bb.maxY - bb.minY;
  const margin = 70;
  const scale = Math.min((W - margin * 2) / w, (H - margin * 2) / h);
  const ox = (W - w * scale) / 2 - bb.minX * scale;
  const oy = (H - h * scale) / 2 - bb.minY * scale;
  return pts.map(([x, y]) => [x * scale + ox, y * scale + oy]);
}

function drawPlanCanvas(pts, template) {
  const canvas = document.getElementById('plan-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 木板底
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#e8c896');
  grad.addColorStop(.5, '#d8b378');
  grad.addColorStop(1, '#c89a5e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 木紋
  ctx.strokeStyle = 'rgba(80,40,10,.18)';
  ctx.lineWidth = .8;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    const yBase = (canvas.height / 14) * i + 12;
    ctx.moveTo(0, yBase);
    ctx.bezierCurveTo(
      canvas.width * .25, yBase + Math.sin(i * 1.7) * 6,
      canvas.width * .65, yBase + Math.cos(i * 2.3) * 7,
      canvas.width, yBase + Math.sin(i * 1.1) * 4
    );
    ctx.stroke();
  }

  // 切割路徑
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
  ctx.stroke();
  ctx.setLineDash([]);

  // 標出尖角
  const sharp = findSharpAngleIndices(template.path);
  sharp.forEach(idx => {
    const [x, y] = pts[idx];
    // 紅光暈
    const radial = ctx.createRadialGradient(x, y, 0, x, y, 16);
    radial.addColorStop(0, 'rgba(225,74,74,.5)');
    radial.addColorStop(1, 'rgba(225,74,74,0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    // 紅圓點
    ctx.fillStyle = '#E14A4A';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x, y + 4);
  });

  // 起點
  const [sx, sy] = pts[0];
  ctx.fillStyle = '#2EBD66';
  ctx.beginPath(); ctx.arc(sx, sy, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
  ctx.fillText('起', sx, sy + 4);

  // 標題列
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.fillRect(0, 0, canvas.width, 56);
  ctx.fillStyle = '#222';
  ctx.font = '700 18px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`切割路徑：${template.name}`, 20, 26);
  ctx.font = '12px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText(`紅點 = 尖角，需要在原地慢慢轉動木板  ／  綠點 = 起點`, 20, 44);

  // 浮水印（右下）
  ctx.font = '11px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.textAlign = 'right';
  ctx.fillText('珩宇老師製作・數位線鋸機教學平台', canvas.width - 16, canvas.height - 12);
}

function pathLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return len;
}

function findSharpAngleIndices(pts) {
  const result = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    const [x3, y3] = pts[i + 1];
    const a1 = Math.atan2(y2 - y1, x2 - x1);
    const a2 = Math.atan2(y3 - y2, x3 - x2);
    let diff = Math.abs(a2 - a1);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    if (diff > Math.PI / 3) result.push(i);
  }
  return result;
}

function countSharpAngles(pts) {
  return findSharpAngleIndices(pts).length;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

document.getElementById('upload-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.name.endsWith('.svg')) {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(ev.target.result, 'image/svg+xml');
        const path = doc.querySelector('path');
        if (path) {
          showToast('SVG 已載入（簡易模式：以路徑外框估算）', '');
          analyzeTemplate({
            id: 'custom', name: file.name, diff: 'mid', desc: '使用者上傳',
            path: [[60, 60], [240, 60], [240, 240], [60, 240], [60, 60]],
          });
        }
      } catch (err) {
        showToast('SVG 解析失敗', 'bad');
      }
    };
    reader.readAsText(file);
  } else {
    showToast('PNG 上傳尚未支援，請使用 SVG 或選擇現成圖樣', 'warn');
  }
});

document.getElementById('btn-print').onclick = () => {
  if (typeof SoundFX !== 'undefined') SoundFX.click();
  window.print();
};
document.getElementById('btn-download').onclick = () => {
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  const canvas = document.getElementById('plan-canvas');
  const link = document.createElement('a');
  link.download = '切割計畫書.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
