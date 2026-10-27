// 焊接模擬器：指標位置 → 烙鐵頭位置
// 手指會擋住手指正下方的畫面，所以觸控時把烙鐵頭畫在觸控點的左上方（CSS 像素：左 24、上 72），
// 滑鼠與觸控筆本身不擋畫面，不偏移。偏移量以 CSS 像素定義，再依畫布縮放比例換成畫布座標，
// 所以不論手機或平板，烙鐵頭與指尖的實際距離都約 7.5 mm（72 px）。
(function (root) {
  const OFFSETS = {
    touch: { dx: -24, dy: -72 },
    pen: { dx: 0, dy: 0 },
    mouse: { dx: 0, dy: 0 },
  };
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  // ev: { clientX, clientY, pointerType }；rect: getBoundingClientRect()；cw/ch: canvas.width/height
  function tipFromPointer(ev, rect, cw, ch) {
    const off = OFFSETS[ev.pointerType] || OFFSETS.mouse;
    const sx = cw / rect.width, sy = ch / rect.height;
    const fingerX = (ev.clientX - rect.left) * sx;
    const fingerY = (ev.clientY - rect.top) * sy;
    return {
      x: clamp(fingerX + off.dx * sx, 0, cw),
      y: clamp(fingerY + off.dy * sy, 0, ch),
      fingerX: clamp(fingerX, 0, cw),
      fingerY: clamp(fingerY, 0, ch),
      offset: off.dx !== 0 || off.dy !== 0,
    };
  }
  const api = { OFFSETS, tipFromPointer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SolderPointer = api;
})(typeof window !== 'undefined' ? window : this);
