/* 三視圖模組 5 題庫（第 1、2 回合）— 題目物件與選項全部來自物件庫（models/orthographic/library/）。
 * round1（看三視圖選物件）：options 是物件 id，options[0] 是正解。
 * round2（補缺失視圖）：options 是 { obj, view, xf, note }，options[0] 是正解；xf 為干擾變換
 *   （mirrorU 左右翻、mirrorV 上下翻、hid2vis 虛線畫成實線、nohid 漏畫虛線）。
 * 畫面上選項會洗牌；作答紀錄用原始順序。正解唯一性由 ortho_lib_work/test_quiz.mjs 自動檢查。 */
(function (root) {
  'use strict';
  root.ORTHO_BANK_M5 = {
    round1: [
      { type: 'object', level: 1, ans: 'lblock', options: ['lblock', 'tee', 'step3', 'notch'],
        expl: '正視圖是 L 形；俯視圖有一條分界線（立板頂面和底座頂面不一樣高），位置和正視圖的內角長對正；右側視圖的水平線是底座頂面的高度（高平齊）。' },
      { type: 'object', level: 2, ans: 'chamfer', options: ['chamfer', 'ramp', 'block', 'lblock'],
        expl: '右側視圖缺了左上角——右側視圖的左邊是物體正面，所以斜面在「前上方」；正視圖、俯視圖各有一條實線，是斜面和正面、頂面的交線。' },
      { type: 'object', level: 2, ans: 'holeplate', options: ['holeplate', 'cbore', 'cylstack', 'slotplate'],
        expl: '俯視圖是圓（孔口看得到，實線）；正視圖、右側視圖用兩條虛線表示孔壁，中間的細鏈線是孔的中心線。板厚 15、沒有台階，所以不是沉頭孔塊。' },
      { type: 'object', level: 3, ans: 'tslot', options: ['tslot', 'dovetail', 'notch', 'vblock'],
        expl: '正視圖直接看到 T 字形槽口（前後貫穿）；俯視圖的窄槽是實線、下面較寬的槽被擋住所以是虛線；右側視圖兩條水平虛線是寬槽的上下面。' },
      { type: 'object', level: 3, ans: 'cbore', options: ['cbore', 'holeplate', 'cylstack', 'boss'],
        expl: '俯視圖兩個同心圓：大圓是沉頭、小圓是貫穿孔。正視圖的虛線在上方先寬後窄，表示沉頭在頂面、深 8。' },
      { type: 'object', level: 4, ans: 'lhole', options: ['lhole', 'bracket', 'rib', 'lblock'],
        expl: '正視圖是 L 形，立板裡的水平虛線是左右貫穿的孔；右側視圖看得到這個孔的圓（孔口在立板右面）；俯視圖右邊的圓是底座的垂直孔。' },
    ],
    round2: [
      { type: 'missing', level: 1, obj: 'step3', view: 'right', known: { front: { obj: 'step3', view: 'front' }, top: { obj: 'step3', view: 'top' } },
        options: [{ obj: 'step3', view: 'right', note: '正確的右側視圖' }, { obj: 'step3', view: 'left', note: '左側視圖（階梯被擋住，分界線變虛線）' },
          { obj: 'lblock', view: 'right', note: 'L 形塊的右側視圖（只有一條分界線）' }, { obj: 'notch', view: 'right', note: '高度不對的矩形' }],
        expl: '從右邊看，三個台階的右側面都看得到，所以有兩條實線分界（高 15、30），和正視圖的台階高度「高平齊」。' },
      { type: 'missing', level: 2, obj: 'chamfer', view: 'top', known: { front: { obj: 'chamfer', view: 'front' }, right: { obj: 'chamfer', view: 'right' } },
        options: [{ obj: 'chamfer', view: 'top', note: '正確的俯視圖' }, { obj: 'chamfer', view: 'bottom', note: '仰視圖（分界線看不到，變虛線）' },
          { obj: 'chamfer', view: 'top', xf: 'mirrorV', note: '前後顛倒（分界線畫到後方）' }, { obj: 'ramp', view: 'top', note: '分界線方向錯（左右分界）' }],
        expl: '俯視圖的下緣是物體正面。斜面在前方，從上面看得到斜面，斜面和頂面的交線離正面 15，所以實線在靠下（靠正面）的位置。' },
      { type: 'missing', level: 3, obj: 'tslot', view: 'top', known: { front: { obj: 'tslot', view: 'front' }, right: { obj: 'tslot', view: 'right' } },
        options: [{ obj: 'tslot', view: 'top', note: '正確的俯視圖' }, { obj: 'tslot', view: 'top', xf: 'hid2vis', note: '寬槽畫成實線（其實被擋住）' },
          { obj: 'tslot', view: 'top', xf: 'nohid', note: '漏畫寬槽的虛線' }, { obj: 'dovetail', view: 'top', note: '鳩尾槽塊的俯視圖' }],
        expl: '從上面只看得到寬 10 的槽口（實線）；下面寬 30 的槽被頂面擋住，要畫虛線，位置和正視圖的寬槽長對正。' },
      { type: 'missing', level: 3, obj: 'cbore', view: 'front', known: { top: { obj: 'cbore', view: 'top' }, right: { obj: 'cbore', view: 'right' } },
        options: [{ obj: 'cbore', view: 'front', note: '正確的正視圖' }, { obj: 'cbore', view: 'front', xf: 'mirrorV', note: '沉頭畫到底面（上下顛倒）' },
          { obj: 'cbore', view: 'front', xf: 'hid2vis', note: '孔畫成實線（孔在內部看不到）' }, { obj: 'cbore', view: 'right', note: '寬度不對（這是右側視圖）' }],
        expl: '正視圖要和俯視圖長對正：寬 60；孔在內部所以畫虛線，沉頭（直徑 24、深 8）在上方，和右側視圖的台階高平齊。' },
      { type: 'missing', level: 4, obj: 'bracket', view: 'right', known: { front: { obj: 'bracket', view: 'front' }, top: { obj: 'bracket', view: 'top' } },
        options: [{ obj: 'bracket', view: 'right', note: '正確的右側視圖' }, { obj: 'bracket', view: 'left', note: '左側視圖（立板跑到左邊）' },
          { obj: 'bracket', view: 'right', xf: 'hid2vis', note: '孔畫成實線' }, { obj: 'rib', view: 'right', note: '肋板角架的右側視圖' }],
        expl: '右側視圖的左邊是物體正面，立板在後方，所以 L 形的高臂在右邊；兩種孔從右邊都看不到，畫虛線＋中心線。' },
      { type: 'missing', level: 4, obj: 'lhole', view: 'top', known: { front: { obj: 'lhole', view: 'front' }, right: { obj: 'lhole', view: 'right' } },
        options: [{ obj: 'lhole', view: 'top', note: '正確的俯視圖' }, { obj: 'lhole', view: 'bottom', note: '仰視圖（從底下看）' },
          { obj: 'lhole', view: 'top', xf: 'hid2vis', note: '立板的孔畫成實線' }, { obj: 'lhole', view: 'top', xf: 'mirrorU', note: '左右相反' }],
        expl: '從上往下看：立板（左）和底座（右）頂面高度不同，中間一條實線；底座的垂直孔看得到（圓）；立板裡左右貫穿的孔看不到，用兩條虛線。' },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
