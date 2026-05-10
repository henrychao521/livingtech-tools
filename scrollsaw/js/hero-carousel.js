// 首頁 hero 輪播
class HeroCarousel {
  constructor(container, opts = {}) {
    this.container = container;
    this.slides = container.querySelectorAll('.hc-slide');
    this.dots = container.querySelectorAll('.hc-dot');
    this.current = 0;
    this.interval = opts.interval || 5500;
    this.timer = null;
    this.bindEvents();
    this.startAuto();
  }

  goTo(idx, dir = 1) {
    idx = (idx + this.slides.length) % this.slides.length;
    if (idx === this.current) return;
    this.slides[this.current].classList.remove('active');
    this.dots[this.current]?.classList.remove('active');
    this.current = idx;
    this.slides[idx].classList.add('active');
    this.dots[idx]?.classList.add('active');
  }

  next() { this.goTo(this.current + 1); }
  prev() { this.goTo(this.current - 1); }

  bindEvents() {
    const prev = this.container.querySelector('.hc-prev');
    const next = this.container.querySelector('.hc-next');
    if (prev) prev.onclick = () => { this.prev(); this.resetAuto(); };
    if (next) next.onclick = () => { this.next(); this.resetAuto(); };
    this.dots.forEach((dot, i) => {
      dot.onclick = () => { this.goTo(i); this.resetAuto(); };
    });
    // 滑鼠進入暫停輪播
    this.container.addEventListener('mouseenter', () => this.stopAuto());
    this.container.addEventListener('mouseleave', () => this.startAuto());

    // 鍵盤支援
    this.container.tabIndex = 0;
    this.container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { this.prev(); this.resetAuto(); }
      if (e.key === 'ArrowRight') { this.next(); this.resetAuto(); }
    });
  }

  startAuto() {
    this.stopAuto();
    this.timer = setInterval(() => this.next(), this.interval);
  }

  stopAuto() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  resetAuto() {
    if (this.timer) this.startAuto();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;
  new HeroCarousel(carousel);

  // 啟動切割演示動畫
  const demoCanvas = document.getElementById('cutting-demo-canvas');
  if (demoCanvas && typeof CuttingDemo !== 'undefined') {
    new CuttingDemo(demoCanvas);
  }
});
