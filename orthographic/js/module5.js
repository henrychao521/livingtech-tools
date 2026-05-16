// 三視圖 模組 5：Projection Game — 三輪闖關
// Round 1: 視圖 → 物件配對（SVG 全靜態）
// Round 2: 缺失視圖補完（SVG 全靜態）
// Round 3: 方塊堆疊建構（Three.js 互動 + 即時投影比對）
// 設計參考：eGrove Spatial Vis Training、Projection Game 類教育軟體
//          CNS 3《工程製圖》第三角投影法

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PK = 'ort_progress_v1';
function loadP() { try { return JSON.parse(localStorage.getItem(PK)) || {}; } catch { return {}; } }
function saveP(p) { localStorage.setItem(PK, JSON.stringify(p)); }

// =============================================================
// SVG 視圖繪製工具（Round 1 / Round 2 用）
// =============================================================
const VIEW_BG = '#1E293B', VIEW_FG = '#A5B4FC', VIEW_EDGE = '#3730A3', VIEW_DASH = '#94A3B8';
const SHAPES = {
  cube:      { label: '立方體', front: 'square', side: 'square', top: 'square', iso: 'cube' },
  cylinder:  { label: '圓柱',   front: 'rect',   side: 'rect',   top: 'circle', iso: 'cylinder' },
  cone:      { label: '圓錐',   front: 'triangle', side: 'triangle', top: 'circle-dot', iso: 'cone' },
  sphere:    { label: '球體',   front: 'circle', side: 'circle', top: 'circle', iso: 'sphere' },
  lblock:    { label: 'L 型塊', front: 'l-shape', side: 'rect-tall', top: 'rect', iso: 'lblock' },
  step:      { label: '階梯塊', front: 'rect',   side: 'rect-tall',  top: 'rect-step', iso: 'step' },
  hole:      { label: '帶圓孔板', front: 'rect-circle-hole', side: 'rect-dash-horiz', top: 'rect-dash-vert', iso: 'hole' },
  tslot:     { label: 'T 槽塊', front: 't-shape', side: 'rect', top: 't-rev', iso: 'tslot' },
  bracket:   { label: 'L 角架', front: 'rect', side: 'rect', top: 'l-shape', iso: 'bracket' },
  pyramid:   { label: '金字塔', front: 'triangle', side: 'triangle', top: 'square-diag', iso: 'pyramid' },
};

// SVG 視圖元件：給定 viewType + size，回傳 SVG 字串
function svgView(type, size = 80) {
  const s = size, c = s / 2, pad = s * 0.12;
  const W = s, H = s;
  const fill = VIEW_FG, stroke = VIEW_EDGE, dash = VIEW_DASH;
  const inner = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="${stroke}" stroke-width="0.7" stroke-dasharray="2 2" opacity="0.4"/>`;

  function shape() {
    switch (type) {
      case 'square':
        return `<rect x="${pad}" y="${pad}" width="${s - pad * 2}" height="${s - pad * 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect':
        return `<rect x="${pad}" y="${pad * 1.8}" width="${s - pad * 2}" height="${s - pad * 3.6}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect-tall':
        return `<rect x="${pad * 1.8}" y="${pad}" width="${s - pad * 3.6}" height="${s - pad * 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'circle':
        return `<circle cx="${c}" cy="${c}" r="${(s - pad * 2) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'circle-dot':
        return `<circle cx="${c}" cy="${c}" r="${(s - pad * 2) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><circle cx="${c}" cy="${c}" r="2" fill="${stroke}"/>`;
      case 'triangle':
        return `<polygon points="${c},${pad} ${s - pad},${s - pad} ${pad},${s - pad}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'l-shape':
        // 左下 L
        return `<polygon points="${pad},${pad} ${pad + (s - pad * 2) * 0.4},${pad} ${pad + (s - pad * 2) * 0.4},${pad + (s - pad * 2) * 0.55} ${s - pad},${pad + (s - pad * 2) * 0.55} ${s - pad},${s - pad} ${pad},${s - pad}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'l-rev':
        // 階梯：右下大、左上小
        return `<polygon points="${pad},${pad + (s - pad * 2) * 0.45} ${pad + (s - pad * 2) * 0.4},${pad + (s - pad * 2) * 0.45} ${pad + (s - pad * 2) * 0.4},${pad} ${s - pad},${pad} ${s - pad},${s - pad} ${pad},${s - pad}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 't-shape':
        return `<polygon points="${pad},${pad} ${s - pad},${pad} ${s - pad},${pad + (s - pad * 2) * 0.4} ${c + (s - pad * 2) * 0.15},${pad + (s - pad * 2) * 0.4} ${c + (s - pad * 2) * 0.15},${s - pad} ${c - (s - pad * 2) * 0.15},${s - pad} ${c - (s - pad * 2) * 0.15},${pad + (s - pad * 2) * 0.4} ${pad},${pad + (s - pad * 2) * 0.4}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 't-rev':
        return `<polygon points="${pad},${s - pad} ${s - pad},${s - pad} ${s - pad},${s - pad - (s - pad * 2) * 0.4} ${c + (s - pad * 2) * 0.15},${s - pad - (s - pad * 2) * 0.4} ${c + (s - pad * 2) * 0.15},${pad} ${c - (s - pad * 2) * 0.15},${pad} ${c - (s - pad * 2) * 0.15},${s - pad - (s - pad * 2) * 0.4} ${pad},${s - pad - (s - pad * 2) * 0.4}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect-step':
        return `<polygon points="${pad},${pad} ${pad + (s - pad * 2) * 0.4},${pad} ${pad + (s - pad * 2) * 0.4},${pad + (s - pad * 2) * 0.5} ${s - pad},${pad + (s - pad * 2) * 0.5} ${s - pad},${s - pad} ${pad},${s - pad}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect-circle-hole':
        return `<rect x="${pad}" y="${pad * 1.8}" width="${s - pad * 2}" height="${s - pad * 3.6}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><circle cx="${c}" cy="${c}" r="${(s - pad * 2) * 0.18}" fill="${VIEW_BG}" stroke="${stroke}" stroke-width="1.5"/>`;
      case 'rect-dash-vert':
        // 兩條垂直虛線（孔軸沿 X/Z 方向，從俯視看）
        return `<rect x="${pad}" y="${pad * 1.8}" width="${s - pad * 2}" height="${s - pad * 3.6}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><line x1="${c - 8}" y1="${pad * 1.8}" x2="${c - 8}" y2="${s - pad * 1.8}" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3 2"/><line x1="${c + 8}" y1="${pad * 1.8}" x2="${c + 8}" y2="${s - pad * 1.8}" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
      case 'rect-dash-horiz':
        // 兩條水平虛線（孔軸沿 Z 方向，從側視看到孔上下邊界）
        return `<rect x="${pad}" y="${pad * 1.8}" width="${s - pad * 2}" height="${s - pad * 3.6}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><line x1="${pad}" y1="${c - 8}" x2="${s - pad}" y2="${c - 8}" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3 2"/><line x1="${pad}" y1="${c + 8}" x2="${s - pad}" y2="${c + 8}" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
      case 'square-diag':
        return `<rect x="${pad}" y="${pad}" width="${s - pad * 2}" height="${s - pad * 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><line x1="${pad}" y1="${pad}" x2="${s - pad}" y2="${s - pad}" stroke="${stroke}" stroke-width="1"/><line x1="${pad}" y1="${s - pad}" x2="${s - pad}" y2="${pad}" stroke="${stroke}" stroke-width="1"/><circle cx="${c}" cy="${c}" r="2.5" fill="${stroke}"/>`;
      default:
        return `<text x="${c}" y="${c}" text-anchor="middle" font-size="10" fill="${stroke}">?</text>`;
    }
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background:${VIEW_BG};border-radius:4px">${inner}${shape()}</svg>`;
}

// 等角預覽：改用 OpenSCAD 預渲 PNG（精準等角投影 30°/30°/90° + 真實光影）
// 路徑 models/orthographic/<name>-iso.png（由 scripts/build_models.sh 編譯產出）
// type → 對應 .scad 檔名映射；M5 用的 type 與檔案命名不完全一致，這裡做別名表
const ISO_FILE_MAP = { l: 'lblock' };  // 例：題目用 'l' 但檔名是 'lblock'

function svgIso(type, size = 100) {
  const file = ISO_FILE_MAP[type] || type;
  // 用 <img> 嵌入 PNG，外面再包一層 <svg> 保持原 API 介面（同尺寸、可內嵌）
  return `<img src="../../models/orthographic/${file}-iso.png" width="${size}" height="${size}" style="background:#1E293B;border-radius:4px;display:block;margin:0 auto" alt="${type}" loading="lazy">`;
}

// =============================================================
// 共用：題目骨架
// =============================================================
const state = { score: 0, total: 0, answered: { 1: new Set(), 2: new Set(), 3: new Set() } };

function updateScore() {
  document.getElementById('score').textContent = state.score;
}

function markCorrect(round, qid) {
  if (state.answered[round].has(qid)) return;
  state.answered[round].add(qid);
  state.score++;
  updateScore();
  if (typeof SoundFX !== 'undefined') SoundFX.success();
  const p = loadP(); p.module5 = true; p.module5_score = state.score; saveP(p);
  // 通關全部 → 慶祝
  if (state.score >= state.total) {
    if (typeof SoundFX !== 'undefined') SoundFX.win();
    showToast(`🎓 全部過關！${state.score} / ${state.total}`, 'good');
  }
}

function markWrong() {
  if (typeof SoundFX !== 'undefined') SoundFX.error();
}

// =============================================================
// Round 1: 視圖 → 物件配對
// =============================================================
const ROUND1 = [
  { ans: 'cube',     views: ['square','square','square'],         options: ['cube','cylinder','sphere','pyramid'],  expl: '三個視圖都是正方形 → 立方體（六面相等）。' },
  { ans: 'cylinder', views: ['rect','rect','circle'],             options: ['cylinder','cube','cone','sphere'],     expl: '俯視 = 圓 + 正視 / 側視 = 矩形 → 圓柱。' },
  { ans: 'cone',     views: ['triangle','triangle','circle-dot'], options: ['cone','pyramid','cylinder','sphere'],  expl: '俯視帶中心點（圓錐尖）+ 正視 / 側視為三角形 → 圓錐。' },
  { ans: 'lblock',   views: ['l-shape','rect-tall','rect'],       options: ['lblock','step','bracket','cube'],      expl: '正視 = L 形 + 俯視 = 矩形 → L 型塊（兩個方塊相連）。' },
  { ans: 'hole',     views: ['rect-circle-hole','rect-dash-horiz','rect-dash-vert'], options: ['hole','tslot','step','cylinder'], expl: '正視 = 矩形含實線圓（孔口）+ 側視 = 兩條水平虛線（孔上下邊界）+ 俯視 = 兩條垂直虛線（孔左右邊界）→ 帶圓孔板。' },
];

function buildRound1() {
  const root = document.getElementById('round-1');
  root.innerHTML = '<p style="font-size:13.5px;color:#475569;margin-bottom:14px">給你正視・側視・俯視，從 4 個 3D 物件中選對的一個。<span class="hint-toggle" onclick="this.nextElementSibling.style.display=\'inline\';this.style.display=\'none\'">💡 顯示提示</span><span style="display:none;margin-left:8px;color:#64748B">「對齊規則」：正視寬 = 俯視寬；高平齊：正視高 = 側視高。</span></p>';
  ROUND1.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    card.innerHTML = `
      <div class="qhead">
        <span class="qbadge">Q ${i + 1} / ${ROUND1.length}</span>
        <span style="font-size:12px;color:#94A3B8">視圖 → 物件</span>
      </div>
      <div class="view-grid">
        <div class="view-cell">${svgView(q.views[0], 90)}<div class="view-cell-label">正視 FRONT</div></div>
        <div class="view-cell">${svgView(q.views[1], 90)}<div class="view-cell-label">側視 SIDE</div></div>
        <div class="view-cell">${svgView(q.views[2], 90)}<div class="view-cell-label">俯視 TOP</div></div>
      </div>
      <p class="qprompt">這是什麼 3D 物件？</p>
      <div class="opt-grid">
        ${q.options.map(o => `<div class="opt-cell" data-o="${o}">${svgIso(o, 90)}<div class="opt-label">${SHAPES[o].label}</div></div>`).join('')}
      </div>
      <div class="feedback-slot"></div>
    `;
    root.appendChild(card);
    card.querySelectorAll('.opt-cell').forEach(opt => {
      opt.addEventListener('click', () => {
        if (card.querySelector('.opt-cell.correct') || card.querySelector('.opt-cell.wrong.disabled')) return;
        const ok = opt.dataset.o === q.ans;
        card.querySelectorAll('.opt-cell').forEach(x => {
          x.classList.add('disabled');
          if (x.dataset.o === q.ans) x.classList.add('correct');
          if (x === opt && !ok) x.classList.add('wrong');
        });
        card.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✓' : '✗'} ${q.expl}</div>`;
        if (ok) markCorrect(1, i);
        else markWrong();
      });
    });
  });
}

// =============================================================
// Round 2: 缺失視圖補完
// =============================================================
const ROUND2 = [
  { shape: 'cube',     missing: 'side',  known: { front: 'square', top: 'square' }, options: ['square','rect','circle','triangle'], expl: '立方體六面相等 → 三個視圖都是相同正方形。' },
  { shape: 'cylinder', missing: 'top',   known: { front: 'rect',   side: 'rect' },  options: ['circle','square','triangle','rect'],  expl: '圓柱的軸向 = 上下方向 → 俯視 = 圓形。' },
  { shape: 'lblock',   missing: 'front', known: { side: 'rect-tall', top: 'rect' }, options: ['l-shape','rect','t-shape','triangle'], expl: 'L 型塊的「L」是從正視方向看到的形狀；側視看到完整高度 = 矩形。' },
  { shape: 'cone',     missing: 'top',   known: { front: 'triangle', side: 'triangle' }, options: ['circle-dot','circle','triangle','square'], expl: '圓錐俯視 = 圓 + 中央一個尖點（從正上方看尖端）。' },
];

const VIEW_KEY = { front: '正視', side: '側視', top: '俯視' };

function buildRound2() {
  const root = document.getElementById('round-2');
  root.innerHTML = '<p style="font-size:13.5px;color:#475569;margin-bottom:14px">給你 3D 物件 + 兩個視圖，從 4 個選項中選出缺失的第三視圖。</p>';
  ROUND2.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    const knownFirst = Object.keys(q.known)[0];
    const knownSecond = Object.keys(q.known)[1];
    card.innerHTML = `
      <div class="qhead">
        <span class="qbadge">Q ${i + 1} / ${ROUND2.length}</span>
        <span style="font-size:12px;color:#94A3B8">補缺失視圖</span>
      </div>
      <div style="display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center">
        <div style="background:#0F172A;border-radius:8px;padding:10px;text-align:center">
          ${svgIso(q.shape, 100)}
          <div style="color:#FBBF24;font-size:11px;font-family:Inter;margin-top:4px">3D 物件</div>
        </div>
        <div class="view-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="view-cell">${q.known.front ? svgView(q.known.front, 80) : `<div style="width:80px;height:80px;background:#0B1322;border:2px dashed #FBBF24;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#FBBF24;font-size:13px;font-weight:700">?</div>`}<div class="view-cell-label">正視 FRONT</div></div>
          <div class="view-cell">${q.known.side ? svgView(q.known.side, 80) : `<div style="width:80px;height:80px;background:#0B1322;border:2px dashed #FBBF24;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#FBBF24;font-size:13px;font-weight:700">?</div>`}<div class="view-cell-label">側視 SIDE</div></div>
          <div class="view-cell">${q.known.top ? svgView(q.known.top, 80) : `<div style="width:80px;height:80px;background:#0B1322;border:2px dashed #FBBF24;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#FBBF24;font-size:13px;font-weight:700">?</div>`}<div class="view-cell-label">俯視 TOP</div></div>
        </div>
      </div>
      <p class="qprompt" style="margin-top:14px">缺失的 <strong style="color:#4F46E5">${VIEW_KEY[q.missing]}</strong> 是哪一個？</p>
      <div class="opt-grid">
        ${q.options.map(o => `<div class="opt-cell" data-o="${o}">${svgView(o, 80)}</div>`).join('')}
      </div>
      <div class="feedback-slot"></div>
    `;
    root.appendChild(card);
    const ansSvg = SHAPES[q.shape][q.missing];
    card.querySelectorAll('.opt-cell').forEach(opt => {
      opt.addEventListener('click', () => {
        if (card.querySelector('.opt-cell.correct') || card.querySelector('.opt-cell.wrong.disabled')) return;
        const ok = opt.dataset.o === ansSvg;
        card.querySelectorAll('.opt-cell').forEach(x => {
          x.classList.add('disabled');
          if (x.dataset.o === ansSvg) x.classList.add('correct');
          if (x === opt && !ok) x.classList.add('wrong');
        });
        card.querySelector('.feedback-slot').innerHTML = `<div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✓' : '✗'} ${q.expl}</div>`;
        if (ok) markCorrect(2, i);
        else markWrong();
      });
    });
  });
}

// =============================================================
// Round 3: 方塊堆疊建構（Three.js + 即時投影比對）
// =============================================================
const GRID = 3; // 3×3×3 立方網格
// 目標：用 3D voxel 陣列定義「應該長什麼樣」
// 陣列 voxels[x][y][z] = 1 表示該位置有方塊
const ROUND3 = [
  {
    label: 'L 型塊（兩塊組合）',
    target: (() => {
      const v = makeEmptyGrid();
      // 底層整片 1×3×3 沒填滿，只填底排 L
      // 簡化版：x=0,1,2 / y=0 / z=0..2 + x=0 / y=1 / z=0
      for (let z = 0; z < 3; z++) v[0][0][z] = 1;
      for (let z = 0; z < 3; z++) v[1][0][z] = 1;
      for (let z = 0; z < 3; z++) v[2][0][z] = 1;
      v[0][1][0] = 1; v[0][1][1] = 1;
      return v;
    })(),
    hint: 'L 型塊：底排一條長條 + 一邊往上立起兩格。',
  },
  {
    label: 'T 形塊（俯視看像 T）',
    target: (() => {
      const v = makeEmptyGrid();
      // 底層 1×3 + 中間往前突出 1×2
      for (let x = 0; x < 3; x++) v[x][0][0] = 1;
      v[1][0][1] = 1; v[1][0][2] = 1;
      return v;
    })(),
    hint: '從俯視看像「T」字形，全部都在底層（y=0）。',
  },
];

function makeEmptyGrid() {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => Array(GRID).fill(0)));
}

function buildRound3() {
  const root = document.getElementById('round-3');
  root.innerHTML = `
    <p style="font-size:13.5px;color:#475569;margin-bottom:14px">這是這個模組最 game 的關卡！在 3×3×3 網格內，<strong>左鍵</strong>點空格加方塊、<strong>右鍵</strong>移除方塊，目標是讓三個視圖完全符合右下角的「目標」。比對 ≥ 95% 即過關。</p>
    <div id="r3-content"></div>
  `;
  const content = document.getElementById('r3-content');

  ROUND3.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    card.innerHTML = `
      <div class="qhead">
        <span class="qbadge">Q ${qi + 1} / ${ROUND3.length}</span>
        <span style="font-size:12px;color:#94A3B8">${q.label}</span>
      </div>
      <div class="stack-game">
        <div class="stack-layout">
          <div class="stack-3d" id="stk3d-${qi}">
            <div style="position:absolute;top:8px;left:10px;font-size:11px;color:#FBBF24;font-weight:700;z-index:2">🎮 建構區（拖曳旋轉相機；點方塊位置加 / 減）</div>
          </div>
          <div class="stack-views">
            <div class="stack-view">
              <div><div class="vlabel">正視</div><canvas id="stk-cur-front-${qi}" width="64" height="64"></canvas></div>
              <div style="color:#475569;font-size:18px">vs</div>
              <div><div class="vlabel" style="color:#16A34A">目標</div><canvas id="stk-tgt-front-${qi}" width="64" height="64"></canvas></div>
            </div>
            <div class="stack-view">
              <div><div class="vlabel">側視</div><canvas id="stk-cur-side-${qi}" width="64" height="64"></canvas></div>
              <div style="color:#475569;font-size:18px">vs</div>
              <div><div class="vlabel" style="color:#16A34A">目標</div><canvas id="stk-tgt-side-${qi}" width="64" height="64"></canvas></div>
            </div>
            <div class="stack-view">
              <div><div class="vlabel">俯視</div><canvas id="stk-cur-top-${qi}" width="64" height="64"></canvas></div>
              <div style="color:#475569;font-size:18px">vs</div>
              <div><div class="vlabel" style="color:#16A34A">目標</div><canvas id="stk-tgt-top-${qi}" width="64" height="64"></canvas></div>
            </div>
          </div>
        </div>
        <div class="stack-toolbar">
          <span style="color:#FBBF24;font-weight:700;align-self:center">提示：${q.hint}</span>
          <span style="flex:1"></span>
          <button class="danger" data-act="clear" data-q="${qi}">🗑 清空</button>
          <button data-act="hint" data-q="${qi}">💡 自動完成（放棄）</button>
        </div>
        <div style="margin-top:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px"><span>視圖比對：<strong id="stk-match-${qi}">0%</strong></span><span id="stk-status-${qi}" style="color:#FBBF24">繼續堆方塊...</span></div>
          <div class="match-bar"><div class="match-bar-fill" id="stk-bar-${qi}" style="width:0%"></div></div>
          <div class="legend">
            <div class="legend-item"><span class="legend-dot" style="background:#6366F1"></span>已放置方塊</div>
            <div class="legend-item"><span class="legend-dot" style="background:#16A34A"></span>目標視圖</div>
            <div class="legend-item"><span class="legend-dot" style="background:#dc2626"></span>差異區域</div>
          </div>
        </div>
      </div>
    `;
    content.appendChild(card);
    initStackGame(qi, q);
  });
}

// 把 3D voxel grid 投影到 2D silhouette（從某個軸方向看）
// axis: 'front' (沿 +Z 看，投影到 xy)、'side' (沿 -X 看，投影到 zy)、'top' (沿 +Y 看，投影到 xz)
function projectGrid(grid, axis) {
  const n = grid.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      for (let z = 0; z < n; z++) {
        if (grid[x][y][z]) {
          if (axis === 'front') out[y][x] = 1;       // y = row (反向: y=0 在底)、x = col
          else if (axis === 'side') out[y][z] = 1;    // y = row、z = col（從左看）
          else if (axis === 'top') out[z][x] = 1;     // z = row、x = col
        }
      }
    }
  }
  return out;
}

// 把 2D silhouette grid 繪製到 canvas
function drawSilhouette(cv, grid2d, color = '#6366F1', diffMask = null) {
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, W, H);
  const n = grid2d.length;
  const cell = Math.floor(Math.min(W, H) / (n + 1));
  const ox = (W - cell * n) / 2, oy = (H - cell * n) / 2;
  // y 反轉：grid2d[0] 是頂部
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const v = grid2d[n - 1 - row][col]; // 反轉 row 讓 y=0 在底部
      if (v) {
        ctx.fillStyle = (diffMask && diffMask[n - 1 - row][col]) ? '#dc2626' : color;
        ctx.fillRect(ox + col * cell, oy + row * cell, cell - 1, cell - 1);
      }
      // 格線
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(ox + col * cell, oy + row * cell, cell, cell);
    }
  }
}

// 計算兩個 silhouette 的匹配度 0~1
function calcMatch(a, b) {
  const n = a.length;
  let same = 0, total = n * n;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (a[r][c] === b[r][c]) same++;
  return same / total;
}

// 計算差異 mask（標出 a 比 b 多的格子，紅色顯示）
function calcDiff(a, b) {
  const n = a.length;
  const diff = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (a[r][c] !== b[r][c]) diff[r][c] = 1;
  return diff;
}

// 初始化單一方塊堆疊遊戲
function initStackGame(qi, q) {
  const container = document.getElementById(`stk3d-${qi}`);
  const W = container.clientWidth || 400, H = container.clientHeight || 380;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1E293B);

  const amb = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85);
  dir.position.set(50, 80, 60);
  scene.add(dir);

  const camera = new THREE.PerspectiveCamera(45, W / H, 1, 500);
  camera.position.set(70, 60, 90);
  camera.lookAt(15, 15, 15);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(15, 15, 15);

  // 底層格盤
  const gridGroup = new THREE.Group();
  const cellSize = 10;
  const offset = (GRID - 1) / 2;
  // 繪製 voxel 範圍框（半透明）
  const wireMat = new THREE.LineBasicMaterial({ color: 0x4338CA, opacity: 0.4, transparent: true });
  for (let x = 0; x <= GRID; x++) {
    for (let z = 0; z <= GRID; z++) {
      const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x * cellSize, 0, z * cellSize), new THREE.Vector3(x * cellSize, GRID * cellSize, z * cellSize)]);
      gridGroup.add(new THREE.Line(geom, wireMat));
    }
  }
  // 底面格線
  const floorGeo = new THREE.PlaneGeometry(GRID * cellSize, GRID * cellSize, GRID, GRID);
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x0F172A, transparent: true, opacity: 0.5 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(GRID * cellSize / 2, 0, GRID * cellSize / 2);
  scene.add(floor);
  const floorEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(GRID * cellSize, GRID * cellSize, GRID, GRID), 0), new THREE.LineBasicMaterial({ color: 0x334155 }));
  floorEdges.rotation.x = -Math.PI / 2;
  floorEdges.position.copy(floor.position);
  scene.add(floorEdges);
  scene.add(gridGroup);

  // ghost 方塊（hover 預覽）
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24, transparent: true, opacity: 0.35 });
  const ghost = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 0.96, cellSize * 0.96, cellSize * 0.96), ghostMat);
  ghost.visible = false;
  scene.add(ghost);

  // 玩家方塊集合
  const userGrid = makeEmptyGrid();
  const blockMat = new THREE.MeshPhongMaterial({ color: 0x6366F1, flatShading: true });
  const blockMeshes = {}; // key: 'x,y,z' → mesh

  function addBlock(x, y, z) {
    if (userGrid[x][y][z]) return;
    userGrid[x][y][z] = 1;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 0.96, cellSize * 0.96, cellSize * 0.96), blockMat);
    mesh.position.set(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, z * cellSize + cellSize / 2);
    scene.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0x1E1B4B }));
    edges.position.copy(mesh.position);
    scene.add(edges);
    blockMeshes[`${x},${y},${z}`] = { mesh, edges };
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    updateViews();
  }

  function removeBlock(x, y, z) {
    if (!userGrid[x][y][z]) return;
    userGrid[x][y][z] = 0;
    const obj = blockMeshes[`${x},${y},${z}`];
    if (obj) {
      scene.remove(obj.mesh);
      scene.remove(obj.edges);
      delete blockMeshes[`${x},${y},${z}`];
    }
    if (typeof SoundFX !== 'undefined') SoundFX.pop();
    updateViews();
  }

  function clearAll() {
    for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) for (let z = 0; z < GRID; z++) {
      if (userGrid[x][y][z]) removeBlock(x, y, z);
    }
  }

  function fillTarget() {
    clearAll();
    for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) for (let z = 0; z < GRID; z++) {
      if (q.target[x][y][z]) addBlock(x, y, z);
    }
  }

  // 預先繪製目標三視圖
  drawSilhouette(document.getElementById(`stk-tgt-front-${qi}`), projectGrid(q.target, 'front'), '#16A34A');
  drawSilhouette(document.getElementById(`stk-tgt-side-${qi}`),  projectGrid(q.target, 'side'),  '#16A34A');
  drawSilhouette(document.getElementById(`stk-tgt-top-${qi}`),   projectGrid(q.target, 'top'),   '#16A34A');

  function updateViews() {
    const f = projectGrid(userGrid, 'front');
    const s = projectGrid(userGrid, 'side');
    const t = projectGrid(userGrid, 'top');
    const tf = projectGrid(q.target, 'front');
    const ts = projectGrid(q.target, 'side');
    const tt = projectGrid(q.target, 'top');
    drawSilhouette(document.getElementById(`stk-cur-front-${qi}`), f, '#6366F1', calcDiff(f, tf));
    drawSilhouette(document.getElementById(`stk-cur-side-${qi}`), s, '#6366F1', calcDiff(s, ts));
    drawSilhouette(document.getElementById(`stk-cur-top-${qi}`), t, '#6366F1', calcDiff(t, tt));
    // 比對：三個視圖平均匹配度
    const m = (calcMatch(f, tf) + calcMatch(s, ts) + calcMatch(t, tt)) / 3;
    const pct = Math.round(m * 100);
    document.getElementById(`stk-match-${qi}`).textContent = pct + '%';
    document.getElementById(`stk-bar-${qi}`).style.width = pct + '%';
    const statusEl = document.getElementById(`stk-status-${qi}`);
    if (pct >= 95) {
      statusEl.textContent = '🎉 完美匹配！過關！';
      statusEl.style.color = '#16A34A';
      markCorrect(3, qi);
    } else if (pct >= 70) {
      statusEl.textContent = '👍 接近了，調整看看';
      statusEl.style.color = '#FBBF24';
    } else {
      statusEl.textContent = '繼續堆方塊...';
      statusEl.style.color = '#94A3B8';
    }
  }

  // 點擊偵測：raycast 到 grid 平面或現有方塊
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getMouse(e) {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  function pickCell(e) {
    getMouse(e);
    raycaster.setFromCamera(mouse, camera);
    // 先找現有方塊
    const blockObjs = Object.values(blockMeshes).map(b => b.mesh);
    const blockHits = raycaster.intersectObjects(blockObjs);
    if (blockHits.length) {
      const m = blockHits[0].object;
      const x = Math.floor(m.position.x / cellSize);
      const y = Math.floor(m.position.y / cellSize);
      const z = Math.floor(m.position.z / cellSize);
      const normal = blockHits[0].face.normal.clone();
      return { exist: true, x, y, z, normalX: Math.round(normal.x), normalY: Math.round(normal.y), normalZ: Math.round(normal.z) };
    }
    // 再找底面（floor）
    const floorHits = raycaster.intersectObject(floor);
    if (floorHits.length) {
      const p = floorHits[0].point;
      const x = Math.floor(p.x / cellSize);
      const z = Math.floor(p.z / cellSize);
      if (x < 0 || x >= GRID || z < 0 || z >= GRID) return null;
      return { exist: false, x, y: 0, z };
    }
    return null;
  }

  renderer.domElement.addEventListener('mousemove', e => {
    const hit = pickCell(e);
    if (!hit) { ghost.visible = false; return; }
    let x = hit.x, y = hit.y, z = hit.z;
    if (hit.exist) {
      // 在點擊面外側放新方塊
      x += hit.normalX; y += hit.normalY; z += hit.normalZ;
    }
    if (x < 0 || x >= GRID || y < 0 || y >= GRID || z < 0 || z >= GRID || userGrid[x][y][z]) {
      ghost.visible = false;
      return;
    }
    ghost.visible = true;
    ghost.position.set(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, z * cellSize + cellSize / 2);
  });

  renderer.domElement.addEventListener('mousedown', e => {
    if (e.button !== 0 && e.button !== 2) return;
    const hit = pickCell(e);
    if (!hit) return;
    if (e.button === 2) {
      // 右鍵：移除已有方塊
      if (hit.exist) removeBlock(hit.x, hit.y, hit.z);
      e.preventDefault();
    } else {
      // 左鍵：在面外側加方塊
      let x = hit.x, y = hit.y, z = hit.z;
      if (hit.exist) { x += hit.normalX; y += hit.normalY; z += hit.normalZ; }
      if (x < 0 || x >= GRID || y < 0 || y >= GRID || z < 0 || z >= GRID) return;
      addBlock(x, y, z);
    }
  });
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

  // 工具列按鈕
  document.querySelector(`button[data-act="clear"][data-q="${qi}"]`).addEventListener('click', clearAll);
  document.querySelector(`button[data-act="hint"][data-q="${qi}"]`).addEventListener('click', fillTarget);

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
  updateViews(); // 初始化時也算一次（即使全空也要顯示目標）
}

// =============================================================
// Tab 切換 + 初始化
// =============================================================
function switchRound(r) {
  document.querySelectorAll('.round-tab').forEach(t => t.classList.toggle('active', t.dataset.r == r));
  document.querySelectorAll('.round-content').forEach(c => c.style.display = 'none');
  document.getElementById('round-' + r).style.display = 'block';
}
document.querySelectorAll('.round-tab').forEach(t => t.addEventListener('click', () => switchRound(t.dataset.r)));

state.total = ROUND1.length + ROUND2.length + ROUND3.length;
document.getElementById('total').textContent = state.total;
buildRound1();
buildRound2();
buildRound3();
