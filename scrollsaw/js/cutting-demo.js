// 首頁 hero 用的「自動切割演示」— 像 GIF 動圖一樣循環播放
// 木板繞著愛心軌跡移動，鋸條固定，視覺上模擬切割整個愛心輪廓
class CuttingDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.heart = this.makeHeartPath();
    this.particles = [];
    this.t = 0;
    this.cutTrail = [];
    this.cycleDuration = 720; // frames per loop（約 12 秒）
    this.start();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) {
      // 容器尚未顯示，稍後重試
      setTimeout(() => this.resize(), 100);
      return;
    }
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  makeHeartPath() {
    const pts = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const x = 110 * Math.sin(a) * Math.sin(a) * Math.sin(a);
      const y = -(13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a)) * 7.5;
      pts.push({ x, y });
    }
    return pts;
  }

  start() {
    // 分頁切到背景時暫停演示動畫，切回來再續跑
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this._paused) { this._paused = false; this.animate(); }
    });
    this.animate();
  }

  animate() {
    if (document.hidden) { this._paused = true; return; }
    this.t++;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  update() {
    const cyclePos = (this.t % this.cycleDuration) / this.cycleDuration;

    // 重置：每個循環開始時清空切割軌跡
    if (this.t > 0 && this.t % this.cycleDuration === 0) {
      this.cutTrail = [];
    }

    // 當前路徑點
    const idx = Math.floor(cyclePos * (this.heart.length - 1));
    const target = this.heart[idx];
    if (target) {
      // 加入切割軌跡（避免重複加同一點）
      const last = this.cutTrail[this.cutTrail.length - 1];
      if (!last || Math.hypot(target.x - last.x, target.y - last.y) > 0.5) {
        this.cutTrail.push({ x: target.x, y: target.y });
      }
    }

    // 噴木屑
    if (this.t % 2 === 0) {
      this.particles.push({
        x: 0, y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 1,
        size: 1 + Math.random() * 2,
        color: ['#FFB066', '#D85F00', '#E89958', '#FFD9B3'][Math.floor(Math.random() * 4)],
      });
    }

    // 更新粒子
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.life -= 0.025;
      return p.life > 0;
    });
  }

  draw() {
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    if (W === 0) return;

    ctx.clearRect(0, 0, W, H);

    // 背景漸層
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fafafa');
    bg.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 細格紋
    ctx.strokeStyle = 'rgba(0,0,0,.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 機身底部裝飾
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, H - 36, W, 36);
    ctx.fillStyle = '#FF7A00';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCROLL SAW', W / 2, H - 14);

    // 鋸條位置（固定）
    const bladeX = W / 2;
    const bladeY = (H - 36) / 2;

    // 計算當前木板偏移（讓鋸條對到 heart 路徑當前點）
    const cyclePos = (this.t % this.cycleDuration) / this.cycleDuration;
    const idx = Math.floor(cyclePos * (this.heart.length - 1));
    const target = this.heart[idx] || { x: 0, y: 0 };
    const woodOffsetX = -target.x;
    const woodOffsetY = -target.y;

    // 繪製木板
    ctx.save();
    ctx.translate(bladeX + woodOffsetX, bladeY + woodOffsetY);

    // 陰影
    ctx.shadowColor = 'rgba(0,0,0,.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // 木板底色
    const woodGrad = ctx.createLinearGradient(-160, -120, 160, 120);
    woodGrad.addColorStop(0, '#e8c896');
    woodGrad.addColorStop(.5, '#d8b378');
    woodGrad.addColorStop(1, '#c89a5e');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(-160, -120, 320, 240);

    ctx.shadowColor = 'transparent';

    // 木紋
    ctx.strokeStyle = 'rgba(80,40,10,.18)';
    ctx.lineWidth = .8;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      const yBase = -120 + (240 / 10) * i + 12;
      ctx.moveTo(-160, yBase);
      ctx.bezierCurveTo(
        -50, yBase + Math.sin(i * 1.7) * 4,
        50, yBase + Math.cos(i * 2.3) * 5,
        160, yBase + Math.sin(i * 1.1) * 3
      );
      ctx.stroke();
    }

    // 切割線（虛線目標）
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    this.heart.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 切割軌跡（橘色光暈 + 黑色切口）
    if (this.cutTrail.length > 1) {
      // 外光暈
      ctx.strokeStyle = 'rgba(255,170,0,.5)';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      this.cutTrail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // 切口黑線
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.cutTrail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // 木板邊框
    ctx.strokeStyle = 'rgba(0,0,0,.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-160, -120, 320, 240);

    ctx.restore();

    // 鋸條（震動）
    const vibrate = Math.sin(this.t / 1.5) * 1.5;
    ctx.save();
    ctx.translate(0, vibrate);

    // 上夾頭
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bladeX - 18, bladeY - 110, 36, 16);

    // 鋸條本體
    const bladeGrad = ctx.createLinearGradient(bladeX - 3, 0, bladeX + 3, 0);
    bladeGrad.addColorStop(0, '#888');
    bladeGrad.addColorStop(.5, '#fff');
    bladeGrad.addColorStop(1, '#333');
    ctx.fillStyle = bladeGrad;
    ctx.fillRect(bladeX - 3, bladeY - 95, 6, 190);

    // 鋸齒
    ctx.fillStyle = '#222';
    for (let y = bladeY - 85; y < bladeY + 85; y += 8) {
      ctx.beginPath();
      ctx.moveTo(bladeX - 3, y);
      ctx.lineTo(bladeX - 5, y + 3);
      ctx.lineTo(bladeX - 3, y + 6);
      ctx.fill();
    }

    // 下夾頭
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bladeX - 18, bladeY + 95, 36, 16);

    // 鋸條中心點（橘）
    ctx.fillStyle = '#FF7A00';
    ctx.beginPath();
    ctx.arc(bladeX, bladeY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 木屑粒子
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(bladeX + p.x, bladeY + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 進度提示（左上角）
    const progress = Math.round(cyclePos * 100);
    ctx.fillStyle = 'rgba(20,20,20,.85)';
    ctx.fillRect(14, 14, 130, 36);
    ctx.fillStyle = '#3aff6a';
    ctx.font = 'bold 11px Inter, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('● 切割中', 24, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, monospace';
    ctx.fillText(progress + '% ─ 愛心輪廓', 24, 44);
  }
}

window.CuttingDemo = CuttingDemo;
