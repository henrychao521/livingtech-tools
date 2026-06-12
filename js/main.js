// 共用：簡易進度儲存（localStorage），給整站用
// key 依 <body data-tool="..."> 對應到各工具自己的進度（與各工具模組 JS 內的 PK 一致）；
// 沒有 data-tool 的頁面維持線鋸機 key（scrollsaw 各模組直接呼叫本檔的 loadProgress/saveProgress）
const TOOL_PROGRESS_KEYS = {
  'scrollsaw': 'scrollsaw_progress_v1',
  'solder': 'solder_progress_v1',
  'breadboard': 'breadboard_progress_v1',
  'printer3d': 'printer3d_progress_v1',
  'drill': 'drill_progress_v1',
  'drill-press': 'dpress_progress_v1',
  'sander': 'sander_progress_v1',
  'hand-tools': 'ht_progress_v1',
  'hydraulic-arm': 'ha_progress_v1',
  'mechanism': 'mech_progress_v1',
  'microcontroller': 'mc_progress_v1',
  'simple-machines': 'sm_progress_v1',
  'structure': 'structure_progress_v1',
  'structure-sim': 'struct_progress_v1',
  'orthographic': 'ort_progress_v1',
  'energy': 'energy_progress_v1',
  'powertrain': 'pt_progress_v1',
  'design-process': 'dp_progress_v1',
  'frc': 'frc_progress_v1',
  'onshape': 'onshape_progress_v1',
};
const PROGRESS_KEY = (document.body && TOOL_PROGRESS_KEYS[document.body.dataset.tool]) || 'scrollsaw_progress_v1';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {
      module1: false,
      module2: false,
      module3: false,
      module4_levels: { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0 },
      safetyPassed: false,
    };
  } catch (e) {
    return {
      module1: false, module2: false, module3: false,
      module4_levels: { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0 },
      safetyPassed: false,
    };
  }
}

function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function showToast(msg, type = '') {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.className = 'toast show ' + type;
  t.textContent = msg;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    t.className = 'toast ' + type;
  }, 2000);
}

// 計算從目前頁面回到 repo 根目錄需要的相對路徑前綴
// 直接取 main.js 自己的 src 前綴（"js/main.js"→""、"../js/main.js"→"../"、"../../js/main.js"→"../../"），
// 任何目錄深度、任何工具都正確
function rootRelativePrefix() {
  const s = document.querySelector('script[src$="js/main.js"]');
  const m = s && s.getAttribute('src').match(/^(.*?)js\/main\.js$/);
  if (m) return m[1];
  let depth = 0;
  if (location.pathname.includes('/pages/')) depth++;
  if (/\/[a-z0-9-]+\/(pages\/)?[^/]*$/.test(location.pathname)) depth++;
  return '../'.repeat(depth);
}

// 自動為所有頁面注入授權 footer（沒有 footer 的頁面才會加）
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('footer')) {
    const prefix = rootRelativePrefix();
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <p>© 珩宇老師製作・生活科技互動教學平台原型</p>
      <p style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.7;max-width:780px;margin-left:auto;margin-right:auto;padding:0 16px">
        本平台部分實物照片取自 <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">Wikimedia Commons</a>，採 <strong>CC BY-SA</strong> 與公有領域授權。
        依 CC BY-SA「相同方式分享」條款，本平台衍生作品須以相同授權釋出並保留原作者署名。
        完整圖片授權清單見 <a href="${prefix}LICENSE_IMAGES.md" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">LICENSE_IMAGES.md</a>。
      </p>
    `;
    document.body.appendChild(footer);
  }
});

// 服儀檢查等拖放頁的觸控提示：HTML5 拖放在 iPad/手機上不會動，
// 各工具的 module2 都已內建「點配備 → 點放置區」備援，但畫面沒講——在觸控裝置上主動告知
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  const firstDraggable = document.querySelector('.draggable');
  if (!firstDraggable || !document.querySelector('.dropzone')) return;
  const hint = document.createElement('div');
  hint.style.cssText = 'background:linear-gradient(135deg,#eff6ff,#fff);border:1px solid #93c5fd;border-left:4px solid #3b82f6;border-radius:10px;padding:10px 14px;margin:0 0 14px;font-size:13.5px;color:#1e3a8a;line-height:1.6';
  hint.innerHTML = '📱 平板／手機操作方式：先<strong>點一下</strong>要使用的配備，再<strong>點</strong>它該放的位置即可（不需要拖曳）。';
  const itemsBox = firstDraggable.parentElement;
  if (itemsBox && itemsBox.parentElement) itemsBox.parentElement.insertBefore(hint, itemsBox);
});

// 給首頁用：標示已完成模組與顯示進度
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('home')) return;
  const p = loadProgress();
  const lv = p.module4_levels || {};
  const stars = Object.values(lv).reduce((s, v) => s + (v || 0), 0);

  // 各工具進度欄位略有差異：M2 可能寫 safetyPassed / module2 / module2_score，
  // M4 可能寫 module4 或 module4_levels 星數
  function moduleDone(n) {
    if (n === 2) return !!(p.safetyPassed || p.module2 || p.module2_score);
    if (n === 4) return !!(p.module4 || Object.values(lv).some(v => v > 0));
    return !!p['module' + n];
  }

  document.querySelectorAll('.module-grid .card').forEach((card, i) => {
    if (moduleDone(i + 1)) {
      const tag = card.querySelector('.card-tag');
      if (tag) tag.textContent = '✓ 已完成';
    }
  });

  // 計算總進度（M4 以星數計部分進度，滿 15 星=完成）
  const doneSteps = [1, 2, 3, 5].filter(moduleDone).length;
  const m4Part = stars > 0 ? Math.min(1, stars / 15) : (moduleDone(4) ? 1 : 0);
  const totalProgress = (doneSteps + m4Part) / 5; // 0~1

  // 在 hero 區下方插入進度儀表板（如果有任何進度）
  if (totalProgress > 0) {
    const hero = document.querySelector('.hero');
    if (hero) {
      const dashboard = document.createElement('div');
      dashboard.style.cssText = 'max-width:1200px;margin:0 auto;padding:0 36px 20px';
      dashboard.innerHTML = `
        <div style="background:linear-gradient(135deg,#fff8f0,#fff);border:1px solid var(--border);border-radius:18px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;box-shadow:var(--shadow-sm)">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="font-size:32px">🚀</div>
            <div>
              <div style="font-size:13px;color:var(--text-muted);font-weight:600">學習進度</div>
              <div style="font-size:18px;font-weight:700;color:var(--primary-dark)">${Math.round(totalProgress * 100)}% 完成・收集 ${stars} 顆星</div>
            </div>
          </div>
          <div style="flex:1;min-width:180px;max-width:300px">
            <div style="height:8px;background:var(--bg-soft);border-radius:999px;overflow:hidden;border:1px solid var(--border)">
              <div style="height:100%;width:${totalProgress * 100}%;background:linear-gradient(90deg,var(--primary),var(--success));transition:width .5s"></div>
            </div>
          </div>
        </div>
      `;
      hero.parentNode.insertBefore(dashboard, hero.nextSibling);
    }
  }

  // 全部完成的慶祝橫幅
  if (totalProgress >= 0.95) {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:80px;right:24px;background:linear-gradient(135deg,#FFD700,#FFA500);color:#fff;padding:16px 22px;border-radius:14px;box-shadow:0 12px 32px rgba(255,165,0,.4);z-index:60;animation:popIn .5s';
    const toolName = (document.querySelector('.brand h1') || {}).textContent || '本工具';
    banner.innerHTML = `👑 <strong>${toolName}大師</strong>　所有模組完成！`;
    document.body.appendChild(banner);
    setTimeout(() => banner.style.transition = 'opacity .5s', 100);
  }
});
