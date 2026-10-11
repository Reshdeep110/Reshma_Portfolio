(() => {
  const canvas = document.getElementById('magic-sky');
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      time = 0;

  const mouse = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };

  let stars = [];

  function resize() {
    width = innerWidth;
    height = innerHeight;

    const ratio = Math.min(devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    stars = Array.from(
      { length: width < 650 ? 65 : 145 },
      () => ({
        x: Math.random(),
        y: Math.random(),
        z: 0.3 + Math.random() * 0.7,
        r: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      })
    );

    if (reduced.matches) paint(0);
  }

  function paint(dt) {
    time += dt;

    // Slightly faster mouse response
    offset.x += (mouse.x - offset.x) * 0.045;
    offset.y += (mouse.y - offset.y) * 0.045;

    ctx.clearRect(0, 0, width, height);

    stars.forEach((s) => {

      // Moderate horizontal floating movement
      const x =
        (
          (
            s.x * width +
            Math.sin(time * 0.09 + s.phase) * 14 +
            offset.x * s.z +
            width +
            50
          ) %
          (width + 100)
        ) - 50;

      // Moderate upward movement
      const y =
        (
          (
            s.y * height -
            time * 6 * s.z +
            offset.y * s.z +
            height +
            50
          ) %
          (height + 100) +
          height +
          100
        ) %
          (height + 100) -
        50;

      // Slightly more noticeable twinkle
      const alpha =
        0.3 +
        (0.35 *
          (1 + Math.sin(time * 0.9 + s.phase))) /
          2;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        s.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(137,221,240,${alpha})`;

      ctx.shadowBlur =
        s.r > 1.5 ? 12 : 3;

      ctx.shadowColor = '#81dcf0';

      ctx.fill();

      if (s.r > 1.85) {
        ctx.strokeStyle =
          `rgba(196,221,134,${alpha * 0.5})`;

        ctx.lineWidth = 0.6;

        ctx.beginPath();

        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);

        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);

        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;
  }

  function tick(now) {
    const dt = last
      ? Math.min((now - last) / 1000, 0.05)
      : 0;

    last = now;

    paint(dt);

    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);

    last = 0;

    if (!document.hidden && !reduced.matches) {
      frame = requestAnimationFrame(tick);
    } else if (!document.hidden) {
      mouse.x = 0;
      mouse.y = 0;

      offset.x = 0;
      offset.y = 0;

      paint(0);
    }
  }

  addEventListener(
    'pointermove',
    (e) => {
      if (
        reduced.matches ||
        e.pointerType === 'touch'
      ) {
        return;
      }

      mouse.x =
        (e.clientX / width - 0.5) * 35;

      mouse.y =
        (e.clientY / height - 0.5) * 25;
    },
    { passive: true }
  );

  document.addEventListener(
    'pointerleave',
    () => {
      mouse.x = 0;
      mouse.y = 0;
    }
  );

  addEventListener(
    'resize',
    resize,
    { passive: true }
  );

  document.addEventListener(
    'visibilitychange',
    sync
  );

  reduced.addEventListener(
    'change',
    sync
  );

  resize();
  sync();
})();