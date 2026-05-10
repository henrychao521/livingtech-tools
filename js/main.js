// 共用：簡易進度儲存（localStorage），給整站用
const PROGRESS_KEY = 'scrollsaw_progress_v1';

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
// 支援多層子目錄：/scrollsaw/、/solder/、/.../pages/
function rootRelativePrefix() {
  let depth = 0;
  if (location.pathname.includes('/pages/')) depth++;
  if (/\/(scrollsaw|solder)\//.test(location.pathname)) depth++;
  return '../'.repeat(depth);
}

// 自動為所有頁面注入授權 footer（沒有 footer 的頁面才會加）
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('footer')) {
    const prefix = rootRelativePrefix();
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <p>© 翰林出版・生活科技互動教學平台原型</p>
      <p style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.7;max-width:780px;margin-left:auto;margin-right:auto;padding:0 16px">
        本平台部分實物照片取自 <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">Wikimedia Commons</a>，採 <strong>CC BY-SA</strong> 與公有領域授權。
        依 CC BY-SA「相同方式分享」條款，本平台衍生作品須以相同授權釋出並保留原作者署名。
        完整圖片授權清單見 <a href="${prefix}LICENSE_IMAGES.md" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">LICENSE_IMAGES.md</a>。
      </p>
    `;
    document.body.appendChild(footer);
  }
});

// 給首頁用：標示已完成模組與顯示進度
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('home')) return;
  const p = loadProgress();
  const flags = [p.module1, p.safetyPassed, p.module3, true, true];
  document.querySelectorAll('.module-grid .card').forEach((card, i) => {
    if (flags[i]) {
      const tag = card.querySelector('.card-tag');
      if (tag) tag.textContent = '✓ 已完成';
    }
  });

  // 計算總進度
  const lv = p.module4_levels || {};
  const stars = ['L1','L2','L3','L4','L5'].reduce((s, k) => s + (lv[k] || 0), 0);
  const totalSteps = (p.module1 ? 1 : 0) + (p.safetyPassed ? 1 : 0) + (p.module3 ? 1 : 0);
  const totalProgress = (totalSteps + Math.min(2, stars / 7.5)) / 5; // 0~1

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
    banner.innerHTML = '👑 <strong>線鋸大師</strong>　所有模組完成！';
    document.body.appendChild(banner);
    setTimeout(() => banner.style.transition = 'opacity .5s', 100);
  }
});
