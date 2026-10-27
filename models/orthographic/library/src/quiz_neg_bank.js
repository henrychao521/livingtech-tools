/* 反向測試：這些題目故意有問題，test_quiz.mjs 必須全部抓出來 */
globalThis.ORTHO_QUIZ_NEG = [
  { type: 'view', obj: 'tee', view: 'top', options: [{ obj: 'tee', view: 'top' }, { obj: 'step3', view: 'top' }, { obj: 'block', view: 'top' }, { obj: 'notch', view: 'top' }] },
  { type: 'view', obj: 'notch', view: 'front', options: [{ obj: 'notch', view: 'front' }, { obj: 'notch', view: 'rear' }, { obj: 'block', view: 'front' }, { obj: 'tee', view: 'front' }] },
  { type: 'view', obj: 'lblock', view: 'top', options: [{ obj: 'lblock', view: 'bottom' }, { obj: 'block', view: 'top' }, { obj: 'tee', view: 'top' }, { obj: 'chamfer', view: 'top' }] },
  { type: 'object', ans: 'tee', options: ['tee', 'step3', 'notch', 'lblock'], views: ['top'] },
  { type: 'triplet', obj: 'tslot', options: [
    { front: { obj: 'tslot', view: 'front' }, top: { obj: 'tslot', view: 'top' }, right: { obj: 'tslot', view: 'right' } },
    { front: { obj: 'tslot', view: 'front' }, top: { obj: 'tslot', view: 'top' }, right: { obj: 'tslot', view: 'left' } }] },
];
