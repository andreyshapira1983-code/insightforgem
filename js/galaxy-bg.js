// Lightweight, lazy galaxy background
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start() {
    const canvas = document.getElementById('galaxy-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h, stars = [], running = false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function makeStars(n) {
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        s: Math.random() * 0.4 + 0.2
      }));
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.s;
        if (s.x > w) s.x = 0;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    // меньше звёзд на старте, потом можно будет увеличить
    makeStars(Math.max(80, Math.floor((w * h) / 60000)));
    running = !prefersReduced;
    if (running) requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      resize();
      makeStars(stars.length);
    }, { passive: true });
  }

  function kick() {
    // запускаем после того, как основной контент уже показан
    if ('requestIdleCallback' in window) {
      requestIdleCallback(start, { timeout: 1500 });
    } else {
      setTimeout(start, 800);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    kick();
  } else {
    document.addEventListener('DOMContentLoaded', kick, { once: true });
  }
})();
