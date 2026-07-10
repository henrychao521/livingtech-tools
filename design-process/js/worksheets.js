// 產品設計流程：可列印學習單（A4・黑白）
(function () {
  const HEAD_LINE = `<div class="ws-id">班級：__________　座號：______　姓名：________________　日期：____________</div>`;
  const RULE = '<div class="rule"></div>';
  const rules = n => RULE.repeat(n);

  /* ── ① POV 句型練習 ───────────────────────────────── */
  const povSheet = `
  <section class="sheet">
    <h1>學習單 ①　POV 觀點句練習</h1>
    ${HEAD_LINE}
    <p class="ws-note">POV（Point of View）句型把「觀察」變成「設計題目」：<strong>（誰）需要（什麼），因為（洞見）</strong>。<br>
    寫的時候注意：「需要」填的是<em>需求</em>而不是<em>解決方案</em>；「因為」要寫出你觀察到的原因或洞見。</p>
    <div class="ws-example">範例：<u>放學自己回家的小學生</u> 需要 <u>安全感和被陪伴的感覺</u>，因為 <u>一個人走暗巷會害怕，而爸媽又還沒下班</u>。</div>
    ${[1, 2, 3].map(n => `
    <div class="pov-group">
      <h2>第 ${n} 組</h2>
      <p class="pov-line"><span class="pov-label">（誰）</span>${RULE}</p>
      <p class="pov-line"><span class="pov-label">需要（什麼需求）</span>${RULE}</p>
      <p class="pov-line"><span class="pov-label">因為（觀察到的洞見）</span>${rules(2)}</p>
    </div>`).join('')}
  </section>`;

  /* ── ② Pugh 決策矩陣 ─────────────────────────────── */
  const pughSheet = `
  <section class="sheet">
    <h1>學習單 ②　Pugh 決策矩陣</h1>
    ${HEAD_LINE}
    <p class="ws-note">把候選方案跟「基準方案」比較：每個準則評 <strong>+1（較好）／ 0（差不多）／ −1（較差）</strong>，
    乘上權重後加總，分數最高的方案勝出。權重建議 1–5 分（越重要越高）。</p>
    <p class="ws-line">設計主題：${RULE}</p>
    <table class="ws-table">
      <thead>
        <tr>
          <th style="width:26%">評估準則</th><th style="width:10%">權重<br><small>(1–5)</small></th>
          <th style="width:16%">基準方案<br><small>＿＿＿＿＿</small></th>
          <th style="width:16%">方案 A<br><small>＿＿＿＿＿</small></th>
          <th style="width:16%">方案 B<br><small>＿＿＿＿＿</small></th>
          <th style="width:16%">方案 C<br><small>＿＿＿＿＿</small></th>
        </tr>
      </thead>
      <tbody>
        ${[1, 2, 3, 4, 5].map(n => `<tr><td class="crit">${n}.</td><td></td><td class="base">0</td><td></td><td></td><td></td></tr>`).join('')}
        <tr class="sum"><td>加權總分（評分 × 權重加總）</td><td>—</td><td class="base">0</td><td></td><td></td><td></td></tr>
        <tr class="sum"><td>排名</td><td>—</td><td class="base">—</td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
    <p class="ws-line" style="margin-top:6mm">我們決定採用的方案與理由：</p>
    ${rules(3)}
  </section>`;

  /* ── ③ 使用者訪談提綱 ────────────────────────────── */
  const interviewQ = (tag, hint) => `
    <div class="iv-q">
      <p class="iv-tag">${tag}<span class="iv-hint">${hint}</span></p>
      <p class="iv-line">Q：${RULE}</p>
      <p class="iv-line">受訪者回答重點：${rules(2)}</p>
    </div>`;
  const interviewSheet = `
  <section class="sheet">
    <h1>學習單 ③　使用者訪談提綱</h1>
    ${HEAD_LINE}
    <p class="ws-line">訪談主題：${RULE}</p>
    <p class="ws-line">受訪者（化名／身分即可）：${RULE}</p>
    <p class="ws-note">訪談小技巧：多問「為什麼」和「可以說說上次的經驗嗎」，少問「是不是」；讓對方說故事，不要急著推銷你的點子。</p>
    <h2>暖身（讓對方放鬆，聊聊背景）</h2>
    ${interviewQ('暖身 1', '例：請簡單介紹一下自己平常的一天？')}
    ${interviewQ('暖身 2', '例：你多常遇到／使用＿＿＿？')}
    <h2>主體（深入問題與經驗）</h2>
    ${interviewQ('主體 1', '例：可以描述最近一次遇到＿＿＿的經過嗎？')}
    ${interviewQ('主體 2', '例：那時候最讓你困擾的是什麼？為什麼？')}
    ${interviewQ('主體 3', '例：你現在都怎麼解決？覺得哪裡不夠好？')}
    ${interviewQ('主體 4', '例：如果可以改變一件事，你最想改變什麼？')}
    ${interviewQ('主體 5', '例：有沒有什麼是我沒問到、但你覺得重要的？')}
    <h2>結尾（感謝與後續）</h2>
    ${interviewQ('結尾 1', '例：謝謝你！之後做出原型可以再請你試用嗎？')}
  </section>`;

  const PRINT_CSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif; color: #111; background: #eee; }
    .toolbar { position: sticky; top: 0; background: #fff; border-bottom: 1px solid #ccc; padding: 10px 16px; display: flex; gap: 12px; align-items: center; }
    .toolbar button { font: inherit; font-weight: 700; padding: 8px 22px; border: 1px solid #111; background: #111; color: #fff; border-radius: 6px; cursor: pointer; }
    .toolbar span { font-size: 13px; color: #555; }
    .sheet { width: 210mm; min-height: 297mm; margin: 10mm auto; background: #fff; padding: 18mm 16mm; page-break-after: always; }
    h1 { font-size: 17pt; border-bottom: 2.5px solid #111; padding-bottom: 3mm; margin-bottom: 4mm; }
    h2 { font-size: 12pt; margin: 6mm 0 3mm; border-left: 4px solid #111; padding-left: 3mm; }
    .ws-id { font-size: 10.5pt; margin-bottom: 4mm; }
    .ws-note { font-size: 10pt; line-height: 1.7; background: #f4f4f4; border: 1px solid #bbb; border-radius: 3px; padding: 3mm 4mm; margin-bottom: 5mm; }
    .ws-example { font-size: 10pt; line-height: 1.8; border: 1px dashed #888; border-radius: 3px; padding: 3mm 4mm; margin-bottom: 5mm; }
    .ws-line { font-size: 11pt; margin: 3mm 0 1mm; }
    .rule { border-bottom: 1px solid #555; height: 9mm; }
    .pov-group { margin-bottom: 8mm; }
    .pov-line { font-size: 11pt; margin-top: 3mm; }
    .pov-label { display: inline-block; font-weight: 700; margin-bottom: 1mm; }
    .ws-table { width: 100%; border-collapse: collapse; margin-top: 3mm; }
    .ws-table th, .ws-table td { border: 1px solid #111; padding: 3mm 2mm; font-size: 10.5pt; text-align: center; height: 12mm; vertical-align: middle; }
    .ws-table th { background: #eee; height: auto; }
    .ws-table td.crit { text-align: left; }
    .ws-table td.base { background: #f4f4f4; color: #555; }
    .ws-table tr.sum td { font-weight: 700; background: #fafafa; }
    .iv-q { margin-bottom: 4mm; }
    .iv-tag { font-size: 10pt; font-weight: 700; }
    .iv-hint { font-weight: 400; color: #666; margin-left: 3mm; font-size: 9pt; }
    .iv-line { font-size: 10.5pt; margin-top: 1.5mm; }
    .iv-line .rule { height: 8mm; }
    @page { size: A4; margin: 0; }
    @media print {
      body { background: #fff; }
      .toolbar { display: none; }
      .sheet { margin: 0 auto; width: auto; min-height: auto; }
    }`;

  const SHEETS = { pov: povSheet, pugh: pughSheet, interview: interviewSheet };

  window.openWorksheet = function (kind) {
    const body = kind === 'all' ? povSheet + pughSheet + interviewSheet : (SHEETS[kind] || povSheet);
    const w = window.open('', '_blank');
    if (!w) { if (typeof showToast === 'function') showToast('請允許彈出視窗才能開啟學習單', 'bad'); return; }
    w.document.write(`<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8">
      <title>產品設計流程・列印學習單</title><style>${PRINT_CSS}</style></head><body>
      <div class="toolbar"><button onclick="window.print()">🖨 列印</button><span>建議 A4 直式、黑白列印。列印時請關閉「頁首與頁尾」。</span></div>
      ${body}</body></html>`);
    w.document.close();
  };
})();
