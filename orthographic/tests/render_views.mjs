// 把 module5 的標準視圖與第 3 關目標投影輸出成 SVG（第三角法排列），供轉成 PNG 做前後對照與 VLM 檢查。
// 用法：ORTHO_MODULE5=<某版 module5.js> node render_views.mjs <輸出資料夾> <標籤> [--legacy-draw]
//   --legacy-draw：用修正前 drawSilhouette 的畫法（每個視圖都把列上下反轉）
import fs from 'node:fs';
import path from 'node:path';
import { load } from './_extract.mjs';

const [outDir, tag] = process.argv.slice(2);
const legacy = process.argv.includes('--legacy-draw');
fs.mkdirSync(outDir, { recursive: true });
const M = load();
const FONT = "font-family=\"PingFang TC, Heiti TC, Noto Sans TC, sans-serif\"";
const place = (svg, x, y) => svg.replace('<svg ', `<svg x="${x}" y="${y}" `);

function threeView(name, s = 120) {
  const S = M.SHAPES[name], g = 14, W = s * 2 + g * 3, H = s * 2 + g * 3 + 40;
  const lab = (t, x, y) => `<text x="${x}" y="${y}" ${FONT} font-size="12" fill="#334155" text-anchor="middle">${t}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="${W / 2}" y="18" ${FONT} font-size="14" font-weight="700" fill="#0F172A" text-anchor="middle">${S.label}（${tag}）</text>
${place(M.svgView(S.top, s), g, 28)}${lab('俯視 ' + S.top, g + s / 2, 28 + s + 12)}
${place(M.svgView(S.front, s), g, 28 + s + g + 6)}${lab('正視 ' + S.front, g + s / 2, 28 + 2 * s + g + 18)}
${place(M.svgView(S.side, s), 2 * g + s, 28 + s + g + 6)}${lab('右側視 ' + S.side, 2 * g + 1.5 * s, 28 + 2 * s + g + 18)}
</svg>`;
}

function grid(g2, x0, y0, cell, color) {
  const n = g2.length; let out = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const v = legacy ? g2[n - 1 - r][c] : g2[r][c];
    out += `<rect x="${x0 + c * cell}" y="${y0 + r * cell}" width="${cell - 1}" height="${cell - 1}" fill="${v ? color : '#0F172A'}" stroke="#334155" stroke-width="0.5"/>`;
  }
  return out;
}
function stackTargets() {
  const cell = 26, sz = cell * 3, g = 18, W = (sz * 2 + g * 3) * 2 + 20, H = sz * 2 + g * 3 + 60;
  let body = '';
  M.ROUND3.forEach((q, i) => {
    const ox = i * (sz * 2 + g * 3 + 20);
    body += `<text x="${ox + g}" y="20" ${FONT} font-size="13" font-weight="700" fill="#E2E8F0">${q.label}</text>`;
    body += grid(M.projectGrid(q.target, 'top'), ox + g, 32, cell, '#16A34A');
    body += `<text x="${ox + g + sz / 2}" y="${32 + sz + 13}" ${FONT} font-size="11" fill="#FBBF24" text-anchor="middle">俯視</text>`;
    body += grid(M.projectGrid(q.target, 'front'), ox + g, 32 + sz + g + 4, cell, '#16A34A');
    body += `<text x="${ox + g + sz / 2}" y="${32 + 2 * sz + g + 17}" ${FONT} font-size="11" fill="#FBBF24" text-anchor="middle">正視</text>`;
    body += grid(M.projectGrid(q.target, 'side'), ox + 2 * g + sz, 32 + sz + g + 4, cell, '#16A34A');
    body += `<text x="${ox + 2 * g + 1.5 * sz}" y="${32 + 2 * sz + g + 17}" ${FONT} font-size="11" fill="#FBBF24" text-anchor="middle">右側視</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#1E293B"/>${body}
<text x="10" y="${H - 8}" ${FONT} font-size="11" fill="#94A3B8">第 3 關目標（${tag}）：3D 相機在 +Z 前方</text></svg>`;
}

for (const name of ['lblock', 'step', 'hole', 'tslot', 'bracket']) {
  fs.writeFileSync(path.join(outDir, `${tag}_${name}.svg`), threeView(name));
}
fs.writeFileSync(path.join(outDir, `${tag}_round3.svg`), stackTargets());
console.log('wrote', outDir);
