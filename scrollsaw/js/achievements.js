// 成就系統 — 在首頁顯示已解鎖的徽章
const ACHIEVEMENTS = [
  { id: 'first_part', icon: '🔍', name: '初識線鋸', desc: '看完 1 個部位介紹', check: p => (p.module1_seen?.length || 0) >= 1 },
  { id: 'all_parts', icon: '🎓', name: '機械達人', desc: '完成模組 1 全部 8 部位', check: p => p.module1 === true },
  { id: 'safety_pass', icon: '🛡️', name: '安全衛士', desc: '安全規範闖關 95 分以上', check: p => p.safetyPassed === true },
  { id: 'all_steps', icon: '📖', name: '步驟通', desc: '看完所有 8 個操作步驟', check: p => (p.module3_seen?.length || 0) >= 8 },
  { id: 'first_cut', icon: '✂️', name: '初次切割', desc: '完成模組 4 任一關卡', check: p => Object.values(p.module4_levels || {}).some(s => s >= 1) },
  { id: 'three_star', icon: '🌟', name: '三星切割師', desc: '任一關卡達 3 顆星', check: p => Object.values(p.module4_levels || {}).some(s => s >= 3) },
  { id: 'all_levels', icon: '🏆', name: '全關通關', desc: '所有 5 個關卡都至少 1 顆星', check: p => {
    const lv = p.module4_levels || {};
    return ['L1', 'L2', 'L3', 'L4', 'L5'].every(l => (lv[l] || 0) >= 1);
  }},
  { id: 'master', icon: '👑', name: '線鋸大師', desc: '所有關卡都達 3 顆星', check: p => {
    const lv = p.module4_levels || {};
    return ['L1', 'L2', 'L3', 'L4', 'L5'].every(l => (lv[l] || 0) >= 3);
  }},
];

// 在首頁顯示成就
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('home')) return;

  const prog = loadProgress();
  const earned = ACHIEVEMENTS.filter(a => a.check(prog));

  // 找個合適的地方放進去
  const teacher = document.querySelector('.teacher');
  if (!teacher) return;

  const section = document.createElement('section');
  section.id = 'achievements-section';
  section.style.cssText = 'padding: 60px 36px; background: #fff;';
  section.innerHTML = `
    <h3 class="section-title">學習徽章</h3>
    <p class="section-sub">完成各項學習任務即可解鎖（共 ${ACHIEVEMENTS.length} 個）</p>
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px">
      ${ACHIEVEMENTS.map(a => {
        const got = a.check(prog);
        return `
          <div style="background:${got ? 'linear-gradient(135deg,#fff8f0,#fff)' : '#fafafa'};border:1px solid ${got ? '#FFD9B3' : '#e5e5e5'};border-radius:14px;padding:18px;text-align:center;${got ? '' : 'opacity:.5;filter:grayscale(.6)'};transition:all .25s;${got ? 'box-shadow:0 4px 14px rgba(255,122,0,.15)' : ''}">
            <div style="font-size:42px;margin-bottom:8px;${got ? 'filter:drop-shadow(0 4px 8px rgba(255,165,0,.3))' : ''}">${a.icon}</div>
            <div style="font-weight:700;font-size:15px;margin-bottom:4px">${a.name}</div>
            <div style="font-size:12px;color:#888">${a.desc}</div>
            ${got ? '<div style="margin-top:8px;font-size:11px;color:#1b6e3a;font-weight:700">✓ 已解鎖</div>' : '<div style="margin-top:8px;font-size:11px;color:#aaa">🔒 未解鎖</div>'}
          </div>
        `;
      }).join('')}
    </div>
    <p style="text-align:center;margin-top:24px;color:#666;font-size:14px">已解鎖：<strong style="color:#FF7A00;font-size:18px;font-family:Inter">${earned.length}</strong> / ${ACHIEVEMENTS.length}</p>
  `;
  teacher.parentNode.insertBefore(section, teacher);
});
